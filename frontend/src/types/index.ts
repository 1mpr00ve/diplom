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
  type: 'standard' | 'vip'
  price: number
  status: 'available' | 'booked'
}

export interface EventDetail extends Event {
  seats: Seat[]
}

export interface User {
  id: number
  email: string
  name: string
}

export interface CartItem {
  seatId: number
  eventId: number
  rowLabel: string
  seatNumber: number
  type: 'standard' | 'vip'
  price: number
}
