import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { LayoutDashboard, Plus, Trash2, Calendar, MapPin, Ticket } from 'lucide-react'
import type { RootState } from '../store'
import type { Event } from '../types'
import api from '../api'
import Header from '../components/Header'

export default function OrganizerDashboard() {
  const { token } = useSelector((s: RootState) => s.auth)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    api.get('/api/me/events')
      .then(r => setEvents(r.data ?? []))
      .finally(() => setLoading(false))
  }, [token])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить мероприятие? Это действие нельзя отменить.')) return
    setDeleting(id)
    try {
      await api.delete(`/api/events/${id}`)
      setEvents(ev => ev.filter(e => e.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-teal-500" />
            Мои мероприятия
          </h1>
          <Link
            to="/events/new"
            className="flex items-center gap-2 text-sm font-bold text-white px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Создать мероприятие
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold text-foreground mb-2">Нет мероприятий</p>
            <p className="text-sm text-muted-foreground mb-6">Создайте первое мероприятие, чтобы начать продажи</p>
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать мероприятие
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {events.map(event => (
              <div key={event.id} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-teal-500/40 transition-colors">
                {event.poster_url && (
                  <div className="h-36 overflow-hidden">
                    <img
                      src={event.poster_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2">{event.title}</h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      {new Date(event.event_date).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        {event.venue.name}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex-1 py-2 text-center text-xs font-medium text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors"
                    >
                      Открыть
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deleting === event.id}
                      className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-border hover:border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
