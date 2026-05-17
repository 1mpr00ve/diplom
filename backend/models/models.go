package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	CreatedAt    time.Time `json:"created_at"`
}

type Venue struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
}

type Event struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	EventDate   time.Time `json:"event_date"`
	PosterURL   string    `json:"poster_url"`
	Venue       Venue     `json:"venue"`
}

type SeatWithStatus struct {
	ID         int     `json:"id"`
	RowLabel   string  `json:"row_label"`
	SeatNumber int     `json:"seat_number"`
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	Type       string  `json:"type"`
	Price      float64 `json:"price"`
	Status     string  `json:"status"`
}

type EventDetail struct {
	Event
	Seats []SeatWithStatus `json:"seats"`
}

type OrderItem struct {
	ID         int     `json:"id"`
	EventSeatID int    `json:"event_seat_id"`
	RowLabel   string  `json:"row_label"`
	SeatNumber int     `json:"seat_number"`
	SeatType   string  `json:"type"`
	Price      float64 `json:"price"`
}

type Order struct {
	ID          int         `json:"id"`
	UserID      int         `json:"user_id"`
	EventID     int         `json:"event_id"`
	TotalPrice  float64     `json:"total_price"`
	Status      string      `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	Items       []OrderItem `json:"items,omitempty"`
}

type ReserveRequest struct {
	EventID int   `json:"event_id"`
	SeatIDs []int `json:"seat_ids"`
}

type ReserveResponse struct {
	OrderID       int    `json:"order_id"`
	ReservedUntil string `json:"reserved_until"`
}
