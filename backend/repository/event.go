package repository

import (
	"database/sql"
	"tickets/models"
)

type EventRepository struct {
	db *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) GetAll() ([]models.Event, error) {
	rows, err := r.db.Query(`
		SELECT e.id, e.title, e.description, e.event_date, COALESCE(e.poster_url, ''),
		       v.id, v.name, v.address
		FROM events e
		JOIN venues v ON e.venue_id = v.id
		ORDER BY e.event_date
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		err := rows.Scan(
			&e.ID, &e.Title, &e.Description, &e.EventDate, &e.PosterURL,
			&e.Venue.ID, &e.Venue.Name, &e.Venue.Address,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, nil
}

func (r *EventRepository) GetByID(id int) (*models.EventDetail, error) {
	var detail models.EventDetail

	err := r.db.QueryRow(`
		SELECT e.id, e.title, e.description, e.event_date, COALESCE(e.poster_url, ''),
		       v.id, v.name, v.address
		FROM events e
		JOIN venues v ON e.venue_id = v.id
		WHERE e.id = ?
	`, id).Scan(
		&detail.ID, &detail.Title, &detail.Description, &detail.EventDate, &detail.PosterURL,
		&detail.Venue.ID, &detail.Venue.Name, &detail.Venue.Address,
	)
	if err != nil {
		return nil, err
	}

	rows, err := r.db.Query(`
		SELECT s.id, s.row_label, s.seat_number, s.x, s.y, s.type,
		       es.price,
		       CASE
		           WHEN es.status = 'reserved' AND (es.reserved_until IS NULL OR es.reserved_until < NOW()) THEN 'available'
		           ELSE es.status
		       END as status
		FROM seats s
		JOIN event_seats es ON es.seat_id = s.id
		WHERE es.event_id = ?
		ORDER BY s.row_label, s.seat_number
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var s models.SeatWithStatus
		err := rows.Scan(
			&s.ID, &s.RowLabel, &s.SeatNumber, &s.X, &s.Y, &s.Type,
			&s.Price, &s.Status,
		)
		if err != nil {
			return nil, err
		}
		detail.Seats = append(detail.Seats, s)
	}

	return &detail, nil
}
