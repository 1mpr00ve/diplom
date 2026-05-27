import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ShieldCheck, Plus, Trash2, MapPin, X } from 'lucide-react'
import type { RootState } from '../store'
import type { Venue } from '../types'
import api from '../api'
import Header from '../components/Header'

interface VenueRow {
  label: string
  seat_type: string
}

interface VenueForm {
  name: string
  address: string
  seats_per_row: string
  rows: VenueRow[]
}

const emptyForm = (): VenueForm => ({
  name: '',
  address: '',
  seats_per_row: '10',
  rows: [{ label: 'A', seat_type: 'standard' }],
})

export default function AdminDashboard() {
  const { token } = useSelector((s: RootState) => s.auth)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<VenueForm>(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!token) return
    api.get('/api/venues')
      .then(r => setVenues(r.data ?? []))
      .finally(() => setLoading(false))
  }, [token])

  const addRow = () => {
    const next = String.fromCharCode(65 + form.rows.length)
    setForm(f => ({ ...f, rows: [...f.rows, { label: next, seat_type: 'standard' }] }))
  }

  const removeRow = (idx: number) =>
    setForm(f => ({ ...f, rows: f.rows.filter((_, i) => i !== idx) }))

  const updateRow = (idx: number, field: keyof VenueRow, value: string) =>
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === idx ? { ...r, [field]: value } : r),
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.rows.length === 0) { setError('Добавьте хотя бы один ряд'); return }
    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        seats_per_row: parseInt(form.seats_per_row),
        rows: form.rows.map(r => ({ label: r.label.trim(), seat_type: r.seat_type.trim() })),
      }
      const { data } = await api.post('/api/admin/venues', payload)
      setVenues(v => [...v, data])
      setForm(emptyForm())
    } catch (err: any) {
      setError(err.response?.data?.error || 'Не удалось создать площадку')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить площадку? Все связанные мероприятия и места будут удалены.')) return
    setDeleting(id)
    try {
      await api.delete(`/api/admin/venues/${id}`)
      setVenues(v => v.filter(x => x.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось удалить')
    } finally {
      setDeleting(null)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 grid gap-8 lg:grid-cols-2 items-start">

        {/* Список площадок */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-teal-500" />
            Площадки
          </h1>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : venues.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
              Площадок пока нет
            </div>
          ) : (
            <div className="space-y-3">
              {venues.map(v => (
                <div key={v.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3 hover:border-teal-500/30 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {v.address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deleting === v.id}
                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-border hover:border-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Удалить площадку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Форма добавления */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-6">Добавить площадку</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Название</label>
                <input
                  type="text"
                  placeholder="ДК Нефтяник"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Адрес</label>
                <input
                  type="text"
                  placeholder="г. Уфа, ул. Ленина, 1"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Мест в ряду</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.seats_per_row}
                  onChange={e => setForm(f => ({ ...f, seats_per_row: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Ряды и типы мест</p>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить ряд
                </button>
              </div>

              <div className="space-y-2">
                {form.rows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="A"
                      value={row.label}
                      onChange={e => updateRow(idx, 'label', e.target.value)}
                      required
                      className="w-16 px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors text-center font-mono"
                    />
                    <input
                      type="text"
                      placeholder="standard"
                      value={row.seat_type}
                      onChange={e => updateRow(idx, 'seat_type', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                    />
                    {form.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Метка ряда (A, B, ...) и произвольный тип (standard, vip, партер, балкон...)
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)]"
            >
              {submitting ? 'Создание...' : 'Создать площадку'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
