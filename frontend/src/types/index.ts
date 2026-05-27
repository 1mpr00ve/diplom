export interface Venue {
  id: number
  name: string
  address: string
}

export interface Event {
  id: number
  title: string
  description: string
  event_date: string
  poster_url: string
  venue: Venue
}

export interface Seat {
  id: number
  row_label: string
  seat_number: number
  x: number
  y: number
  type: string
  price: number
  status: 'available' | 'reserved' | 'booked'
}

export interface EventDetail extends Event {
  seats: Seat[]
}

export interface User {
  id: number
  email: string
  name: string
  role: 'buyer' | 'organizer' | 'admin'
}

export interface CartItem {
  seatId: number
  eventId: number
  rowLabel: string
  seatNumber: number
  type: 'standard' | 'vip'
  price: number
}

export interface OrderItem {
  id: number
  row_label: string
  seat_number: number
  type: string
  price: number
}

export interface Order {
  id: number
  event_id: number
  event_title: string
  total_price: number
  status: string
  created_at: string
  items?: OrderItem[]
}
