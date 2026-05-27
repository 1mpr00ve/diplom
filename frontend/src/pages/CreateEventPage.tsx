import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus, AlertCircle, ImageIcon } from 'lucide-react'
import type { RootState } from '../store'
import type { Venue } from '../types'
import api from '../api'
import Header from '../components/Header'

interface FormState {
  title: string
  description: string
  event_date: string
  venue_id: string
  poster_url: string
}

export default function CreateEventPage() {
  const { token } = useSelector((s: RootState) => s.auth)
  const navigate = useNavigate()
  const [venues, setVenues] = useState<Venue[]>([])
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    event_date: '',
    venue_id: '',
    poster_url: '',
  })
  const [seatTypes, setSeatTypes] = useState<string[]>([])
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/venues').then(r => {
      const data: Venue[] = r.data ?? []
      setVenues(data)
      if (data.length) {
        const firstId = String(data[0].id)
        setForm(f => ({ ...f, venue_id: firstId }))
        loadSeatTypes(data[0].id)
      }
    })
  }, [])

  const loadSeatTypes = (venueId: number) => {
    api.get(`/api/venues/${venueId}/seat-types`).then(r => {
      const types: string[] = r.data ?? []
      setSeatTypes(types)
      setPrices(Object.fromEntries(types.map(t => [t, ''])))
    })
  }

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    setForm(f => ({ ...f, venue_id: id }))
    if (id) loadSeatTypes(parseInt(id))
  }

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const pricesMap: Record<string, number> = {}
    for (const t of seatTypes) {
      const val = parseFloat(prices[t])
      if (!val || val <= 0) {
        setError(`Укажите корректную цену для типа "${t}"`)
        return
      }
      pricesMap[t] = val
    }

    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        event_date: new Date(form.event_date).toISOString(),
        venue_id: parseInt(form.venue_id),
        poster_url: form.poster_url.trim() || '',
        prices: pricesMap,
      }
      const { data } = await api.post('/api/events', payload)
      navigate(`/events/${data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать мероприятие')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <Plus className="w-6 h-6 text-teal-500" />
          Новое мероприятие
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">Основное</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Название</label>
              <input type="text" placeholder="Концерт Земфиры" value={form.title} onChange={set('title')} required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Описание</label>
              <textarea
                placeholder="Расскажите о мероприятии..."
                value={form.description}
                onChange={set('description')}
                rows={4}
                className={inputClass + ' resize-none'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Дата и время</label>
              <input type="datetime-local" value={form.event_date} onChange={set('event_date')} required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Площадка</label>
              <select value={form.venue_id} onChange={handleVenueChange} required className={inputClass}>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} — {v.address}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Постер (URL)</span>
              </label>
              <input type="url" placeholder="https://example.com/poster.jpg" value={form.poster_url} onChange={set('poster_url')} className={inputClass} />
              {form.poster_url && (
                <div className="mt-3 h-40 rounded-lg overflow-hidden border border-border">
                  <img src={form.poster_url} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
          </div>

          {seatTypes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Цены на билеты</h2>
              <div className="grid grid-cols-2 gap-4">
                {seatTypes.map(t => (
                  <div key={t}>
                    <label className="block text-sm font-medium text-foreground mb-1.5 capitalize">{t} (₽)</label>
                    <input
                      type="number"
                      placeholder="500"
                      min="1"
                      step="0.01"
                      value={prices[t] ?? ''}
                      onChange={e => setPrices(p => ({ ...p, [t]: e.target.value }))}
                      required
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || seatTypes.length === 0}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          >
            {loading ? 'Создание...' : 'Создать мероприятие'}
          </button>
        </form>
      </main>
    </div>
  )
}
