import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store'
import type { Seat } from '../types'
import { addSeat, removeSeat } from '../store/cartSlice'

interface Props {
  seats: Seat[]
  eventId: number
}

export default function SeatMap({ seats, eventId }: Props) {
  const dispatch = useDispatch()
  const cartItems = useSelector((s: RootState) => s.cart.items)

  const isSelected = (id: number) => cartItems.some(i => i.seatId === id)

  const handleClick = (seat: Seat) => {
    if (seat.status === 'booked') return
    if (isSelected(seat.id)) {
      dispatch(removeSeat(seat.id))
    } else {
      dispatch(addSeat({
        seatId: seat.id,
        eventId,
        rowLabel: seat.row_label,
        seatNumber: seat.seat_number,
        type: seat.type,
        price: seat.price,
      }))
    }
  }

  const getFill = (seat: Seat) => {
    if (seat.status === 'booked') return '#94a3b8'
    if (isSelected(seat.id)) return '#14b8a6'
    if (seat.type === 'vip') return '#f59e0b'
    return 'transparent'
  }

  const getStroke = (seat: Seat) => {
    if (seat.status === 'booked') return 'transparent'
    if (isSelected(seat.id)) return '#14b8a6'
    if (seat.type === 'vip') return '#f59e0b'
    return '#94a3b8'
  }

  const getTextFill = (seat: Seat) => {
    if (seat.status === 'booked') return 'transparent'
    if (isSelected(seat.id)) return '#ffffff'
    if (seat.type === 'vip') return '#ffffff'
    return '#64748b'
  }

  const rows = [...new Set(seats.map(s => s.row_label))].sort()

  return (
    <div>
      {/* Stage */}
      <div className="w-64 mx-auto h-12 bg-gradient-to-b from-teal-500/20 to-transparent border-t-4 border-teal-500 rounded-t-lg flex items-center justify-center mb-8">
        <span className="text-teal-700 dark:text-teal-300 font-bold tracking-[0.2em] text-sm">СЦЕНА</span>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="50 40 660 400" className="w-full block select-none" style={{ minWidth: '600px' }}>
          <defs>
            <filter id="seat-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {rows.map(row => {
            const s = seats.find(s => s.row_label === row)!
            return (
              <text key={row} x="68" y={s.y + 5} textAnchor="middle" fontSize="13" fill="#94a3b8" fontWeight="600">
                {row}
              </text>
            )
          })}

          {seats.map(seat => {
            const selected = isSelected(seat.id)
            return (
              <g
                key={seat.id}
                onClick={() => handleClick(seat)}
                style={{ cursor: seat.status === 'booked' ? 'not-allowed' : 'pointer' }}
                className={seat.status !== 'booked' ? 'hover:opacity-80 transition-opacity' : 'opacity-40'}
              >
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={16}
                  fill={getFill(seat)}
                  stroke={getStroke(seat)}
                  strokeWidth={2}
                  filter={selected ? 'url(#seat-glow)' : undefined}
                />
                <text
                  x={seat.x}
                  y={seat.y + 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={getTextFill(seat)}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {seat.seat_number}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border mt-4">
        <div className="flex items-center gap-2">
          <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="transparent" stroke="#94a3b8" strokeWidth="2" /></svg>
          <span className="text-sm text-muted-foreground">Стандарт</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" /></svg>
          <span className="text-sm text-muted-foreground">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="#14b8a6" stroke="#14b8a6" strokeWidth="2" /></svg>
          <span className="text-sm text-muted-foreground">Выбрано</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="#94a3b8" strokeWidth="0" className="opacity-40" /></svg>
          <span className="text-sm text-muted-foreground">Занято</span>
        </div>
      </div>
    </div>
  )
}
