import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, ChevronRight } from 'lucide-react'
import type { Event } from '../types'
import api from '../api'
import Header from '../components/Header'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/events')
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <div className="bg-[#0f172a] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Лучшие события —<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              у вас в руках.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mb-10">
            Концерты, спектакли, фестивали — выбирайте места и покупайте билеты онлайн за пару кликов.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ближайшие мероприятия</h2>
          <span className="text-teal-600 dark:text-teal-400 text-sm font-medium flex items-center gap-1">
            {events.length} событий <ChevronRight className="w-4 h-4" />
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-card rounded-xl border border-border h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div
                key={event.id}
                className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border flex flex-col"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400" />

                {/* Placeholder image area */}
                <div className="h-44 bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-teal-500/5" />
                  <span className="text-4xl">🎭</span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl mb-4 leading-snug text-card-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-6 mt-auto">
                    <div className="flex items-center text-muted-foreground text-sm font-medium gap-3">
                      <Calendar className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm font-medium gap-3">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{event.venue.name}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Адрес</div>
                      <div className="text-sm text-foreground font-medium">{event.venue.address}</div>
                    </div>
                    <Link
                      to={`/events/${event.id}`}
                      className="bg-teal-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-teal-400 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] text-sm whitespace-nowrap"
                    >
                      Выбрать →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
