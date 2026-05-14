import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  eventId: number | null
}

const initialState: CartState = {
  items: [],
  eventId: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addSeat(state, action: PayloadAction<CartItem>) {
      if (state.eventId && state.eventId !== action.payload.eventId) return
      const exists = state.items.find(i => i.seatId === action.payload.seatId)
      if (!exists) {
        state.eventId = action.payload.eventId
        state.items.push(action.payload)
      }
    },
    removeSeat(state, action: PayloadAction<number>) {
      state.items = state.items.filter(i => i.seatId !== action.payload)
      if (state.items.length === 0) state.eventId = null
    },
    clearCart(state) {
      state.items = []
      state.eventId = null
    },
  },
})

export const { addSeat, removeSeat, clearCart } = cartSlice.actions
export default cartSlice.reducer
