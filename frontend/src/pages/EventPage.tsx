import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Calendar, Building2, MapPin, Ticket } from 'lucide-react'
import type { EventDetail } from '../types'
import type { RootState } from '../store'
import { removeSeat } from '../store/cartSlice'
import api from '../api'
import Header from '../components/Header'
import SeatMap from '../components/SeatMap'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s: RootState) => s.cart)

  useEffect(() => {
    api.get(`/api/events/${id}`)
      .then(r => setEvent(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16 text-muted-foreground">Загрузка...</div>
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-muted-foreground">Событие не найдено. <Link to="/" className="text-teal-500 hover:underline">На главную</Link></p>
      </div>
    </div>
  )

  const minPrice = Math.min(...event.seats.map(s => s.price))
  const available = event.seats.filter(s => s.status === 'available').length
  const cartItems = cart.eventId === event.id ? cart.items : []
  const total = cartItems.reduce((s, i) => s + i.price, 0)

  return (
    <div className="min-h-screen bg-background pb-36">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Все мероприятия
        </Link>

        {/* Event Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight text-foreground leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 sm:gap-10 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Дата и время</div>
                <div className="font-medium text-foreground">{formatDate(event.event_date)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Площадка</div>
                <div className="font-medium text-foreground">{event.venue.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Адрес</div>
                <div className="font-medium text-foreground">{event.venue.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">От</div>
            <div className="text-2xl font-bold text-foreground">{minPrice} ₽</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Свободных мест</div>
            <div className="text-2xl font-bold text-foreground">{available}</div>
          </div>
          {event.description && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm col-span-2 md:col-span-1">
              <div className="text-sm font-medium text-muted-foreground mb-1">О событии</div>
              <div className="text-sm text-foreground line-clamp-2">{event.description}</div>
            </div>
          )}
        </div>

        {/* Seat Map */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-6 text-foreground">Выберите места</h2>
          <SeatMap seats={event.seats} eventId={event.id} />
        </div>
      </div>

      {/* Fixed Cart Panel */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pointer-events-none">
          <div className="max-w-4xl mx-auto bg-card rounded-xl border-l-4 border-l-teal-500 border border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pointer-events-auto flex flex-col md:flex-row p-6 gap-6 items-center">
            <div className="flex-1 w-full">
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-500" />
                Выбранные места ({cartItems.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {cartItems.map(item => (
                  <div key={item.seatId} className="bg-muted px-3 py-1.5 rounded-md text-sm flex items-center gap-2 border border-border">
                    <span className="font-bold text-foreground">Ряд {item.rowLabel}, м. {item.seatNumber}</span>
                    {item.type === 'vip' && (
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">VIP</span>
                    )}
                    <span className="text-muted-foreground">{item.price} ₽</span>
                    <button
                      onClick={() => dispatch(removeSeat(item.seatId))}
                      className="text-slate-400 hover:text-red-500 transition-colors text-base leading-none ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border mx-2" />

            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex flex-col md:items-end">
                <span className="text-sm font-medium text-muted-foreground">Итого</span>
                <span className="text-3xl font-bold text-foreground">{total} ₽</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-2 hover:scale-[1.02] whitespace-nowrap"
              >
                Оформить <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
