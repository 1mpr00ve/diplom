package repository

import (
	"database/sql"
	"errors"
	"time"
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

func (r *EventRepository) GetByOrganizer(organizerID int) ([]models.Event, error) {
	rows, err := r.db.Query(`
		SELECT e.id, e.title, e.description, e.event_date, COALESCE(e.poster_url, ''),
		       v.id, v.name, v.address
		FROM events e
		JOIN venues v ON e.venue_id = v.id
		WHERE e.organizer_id = ?
		ORDER BY e.event_date
	`, organizerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var e models.Event
		rows.Scan(
			&e.ID, &e.Title, &e.Description, &e.EventDate, &e.PosterURL,
			&e.Venue.ID, &e.Venue.Name, &e.Venue.Address,
		)
		events = append(events, e)
	}
	return events, nil
}

func (r *EventRepository) Create(req *models.CreateEventRequest, organizerID int) (*models.Event, error) {
	var eventDate time.Time
	var err error
	for _, layout := range []string{time.RFC3339, "2006-01-02T15:04:05Z", "2006-01-02T15:04", "2006-01-02 15:04:05"} {
		eventDate, err = time.Parse(layout, req.EventDate)
		if err == nil {
			break
		}
	}
	if err != nil {
		return nil, errors.New("неверный формат даты")
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	result, err := tx.Exec(`
		INSERT INTO events (venue_id, organizer_id, title, description, event_date, poster_url)
		VALUES (?, ?, ?, ?, ?, ?)
	`, req.VenueID, organizerID, req.Title, req.Description, eventDate, req.PosterURL)
	if err != nil {
		return nil, err
	}
	eventID, _ := result.LastInsertId()

	for seatType, price := range req.Prices {
		_, err = tx.Exec(`
			INSERT INTO event_seats (event_id, seat_id, price, status)
			SELECT ?, s.id, ?, 'available'
			FROM seats s WHERE s.venue_id = ? AND s.type = ?
		`, eventID, price, req.VenueID, seatType)
		if err != nil {
			return nil, err
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	var e models.Event
	r.db.QueryRow(`
		SELECT e.id, e.title, e.description, e.event_date, COALESCE(e.poster_url, ''),
		       v.id, v.name, v.address
		FROM events e JOIN venues v ON e.venue_id = v.id
		WHERE e.id = ?
	`, eventID).Scan(
		&e.ID, &e.Title, &e.Description, &e.EventDate, &e.PosterURL,
		&e.Venue.ID, &e.Venue.Name, &e.Venue.Address,
	)
	return &e, nil
}

func (r *EventRepository) Delete(eventID, organizerID int) error {
	result, err := r.db.Exec(
		"DELETE FROM events WHERE id = ? AND organizer_id = ?",
		eventID, organizerID,
	)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return errors.New("событие не найдено или нет доступа")
	}
	return nil
}

func (r *EventRepository) GetVenues() ([]models.Venue, error) {
	rows, err := r.db.Query("SELECT id, name, address FROM venues ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var venues []models.Venue
	for rows.Next() {
		var v models.Venue
		rows.Scan(&v.ID, &v.Name, &v.Address)
		venues = append(venues, v)
	}
	return venues, nil
}

func (r *EventRepository) GetSeatTypes(venueID int) ([]string, error) {
	rows, err := r.db.Query(
		"SELECT DISTINCT type FROM seats WHERE venue_id = ? ORDER BY type",
		venueID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var types []string
	for rows.Next() {
		var t string
		rows.Scan(&t)
		types = append(types, t)
	}
	return types, nil
}

func (r *EventRepository) CreateVenue(req *models.CreateVenueRequest) (*models.Venue, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	result, err := tx.Exec("INSERT INTO venues (name, address) VALUES (?, ?)", req.Name, req.Address)
	if err != nil {
		return nil, err
	}
	venueID, _ := result.LastInsertId()

	for rowIdx, row := range req.Rows {
		y := 80 + rowIdx*60
		for seatNum := 1; seatNum <= req.SeatsPerRow; seatNum++ {
			x := 100 + (seatNum-1)*55
			_, err = tx.Exec(
				"INSERT INTO seats (venue_id, row_label, seat_number, x, y, type) VALUES (?, ?, ?, ?, ?, ?)",
				venueID, row.Label, seatNum, x, y, row.SeatType,
			)
			if err != nil {
				return nil, err
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return &models.Venue{ID: int(venueID), Name: req.Name, Address: req.Address}, nil
}

func (r *EventRepository) DeleteVenue(id int) error {
	result, err := r.db.Exec("DELETE FROM venues WHERE id = ?", id)
	if err != nil {
		return err
	}
	n, _ := result.RowsAffected()
	if n == 0 {
		return errors.New("площадка не найдена")
	}
	return nil
}
