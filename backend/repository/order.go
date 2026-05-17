package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"
	"tickets/models"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

const reservationDuration = 10 * time.Minute

func (r *OrderRepository) Reserve(userID, eventID int, seatIDs []int) (*models.ReserveResponse, error) {
	if len(seatIDs) == 0 {
		return nil, errors.New("нет выбранных мест")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var totalPrice float64

	// Проверяем каждое место и собираем event_seat_id + price
	type seatInfo struct {
		eventSeatID int
		price       float64
	}
	seats := make([]seatInfo, 0, len(seatIDs))

	for _, seatID := range seatIDs {
		var esID int
		var price float64
		var status string
		var reservedUntil sql.NullTime

		err := tx.QueryRow(`
			SELECT es.id, es.price, es.status, es.reserved_until
			FROM event_seats es
			WHERE es.event_id = ? AND es.seat_id = ?
			FOR UPDATE
		`, eventID, seatID).Scan(&esID, &price, &status, &reservedUntil)
		if err != nil {
			return nil, fmt.Errorf("место %d не найдено", seatID)
		}

		if status == "booked" {
			return nil, fmt.Errorf("место %d уже куплено", seatID)
		}
		if status == "reserved" && reservedUntil.Valid && reservedUntil.Time.After(time.Now()) {
			return nil, fmt.Errorf("место %d сейчас резервируется другим пользователем", seatID)
		}

		seats = append(seats, seatInfo{esID, price})
		totalPrice += price
	}

	// Создаём заказ
	result, err := tx.Exec(
		`INSERT INTO orders (user_id, event_id, total_price, status) VALUES (?, ?, ?, 'pending')`,
		userID, eventID, totalPrice,
	)
	if err != nil {
		return nil, err
	}
	orderID, _ := result.LastInsertId()

	reservedUntil := time.Now().Add(reservationDuration)

	for _, s := range seats {
		// Резервируем место
		_, err = tx.Exec(`
			UPDATE event_seats
			SET status='reserved', reserved_until=?, reserved_by=?
			WHERE id=?
		`, reservedUntil, userID, s.eventSeatID)
		if err != nil {
			return nil, err
		}

		// Добавляем позицию заказа
		_, err = tx.Exec(`
			INSERT INTO order_items (order_id, event_seat_id, price) VALUES (?, ?, ?)
		`, orderID, s.eventSeatID, s.price)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &models.ReserveResponse{
		OrderID:       int(orderID),
		ReservedUntil: reservedUntil.UTC().Format(time.RFC3339),
	}, nil
}

func (r *OrderRepository) Pay(orderID, userID int) (*models.Order, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var dbUserID int
	var status string
	err = tx.QueryRow(`SELECT user_id, status FROM orders WHERE id = ? FOR UPDATE`, orderID).
		Scan(&dbUserID, &status)
	if err != nil {
		return nil, errors.New("заказ не найден")
	}
	if dbUserID != userID {
		return nil, errors.New("нет доступа")
	}
	if status != "pending" {
		return nil, errors.New("заказ уже обработан")
	}

	// Обновляем заказ
	_, err = tx.Exec(`UPDATE orders SET status='paid' WHERE id=?`, orderID)
	if err != nil {
		return nil, err
	}

	// Помечаем места как купленные
	_, err = tx.Exec(`
		UPDATE event_seats es
		JOIN order_items oi ON oi.event_seat_id = es.id
		SET es.status='booked', es.reserved_until=NULL, es.reserved_by=NULL
		WHERE oi.order_id=?
	`, orderID)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return r.GetByID(orderID, userID)
}

func (r *OrderRepository) GetByID(orderID, userID int) (*models.Order, error) {
	var o models.Order
	err := r.db.QueryRow(`
		SELECT id, user_id, event_id, total_price, status, created_at
		FROM orders WHERE id=? AND user_id=?
	`, orderID, userID).Scan(&o.ID, &o.UserID, &o.EventID, &o.TotalPrice, &o.Status, &o.CreatedAt)
	if err != nil {
		return nil, errors.New("заказ не найден")
	}

	rows, err := r.db.Query(`
		SELECT oi.id, oi.event_seat_id, s.row_label, s.seat_number, s.type, oi.price
		FROM order_items oi
		JOIN event_seats es ON es.id = oi.event_seat_id
		JOIN seats s ON s.id = es.seat_id
		WHERE oi.order_id=?
		ORDER BY s.row_label, s.seat_number
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item models.OrderItem
		rows.Scan(&item.ID, &item.EventSeatID, &item.RowLabel, &item.SeatNumber, &item.SeatType, &item.Price)
		o.Items = append(o.Items, item)
	}

	return &o, nil
}

func (r *OrderRepository) GetUserOrders(userID int) ([]models.Order, error) {
	rows, err := r.db.Query(`
		SELECT o.id, o.user_id, o.event_id, o.total_price, o.status, o.created_at,
		       e.title
		FROM orders o
		JOIN events e ON e.id = o.event_id
		WHERE o.user_id=?
		ORDER BY o.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		rows.Scan(&o.ID, &o.UserID, &o.EventID, &o.TotalPrice, &o.Status, &o.CreatedAt, &o.EventTitle)
		orders = append(orders, o)
	}
	return orders, nil
}
