import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Ticket, Clock, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react'
import type { RootState } from '../store'
import { clearCart } from '../store/cartSlice'
import api from '../api'
import Header from '../components/Header'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const cart = useSelector((s: RootState) => s.cart)
  const token = useSelector((s: RootState) => s.auth.token)

  const [orderId, setOrderId] = useState<number | null>(null)
  const [reservedUntil, setReservedUntil] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [reserving, setReserving] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const total = cart.items.reduce((s, i) => s + i.price, 0)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (!cart.eventId || cart.items.length === 0) { navigate('/'); return }

    api.post('/api/orders/reserve', {
      event_id: cart.eventId,
      seat_ids: cart.items.map(i => i.seatId),
    }).then(r => {
      setOrderId(r.data.order_id)
      setReservedUntil(new Date(r.data.reserved_until))
    }).catch(err => {
      setError(err.response?.data?.error || 'Не удалось зарезервировать места')
    }).finally(() => setReserving(false))
  }, [])

  useEffect(() => {
    if (!reservedUntil) return
    const tick = () => {
      const left = Math.max(0, Math.floor((reservedUntil.getTime() - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0) setError('Время резервации истекло. Пожалуйста, выберите места заново.')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [reservedUntil])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId) return
    setPaying(true)
    try {
      await api.post(`/api/orders/${orderId}/pay`)
      dispatch(clearCart())
      navigate(`/orders/${orderId}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка оплаты')
    } finally {
      setPaying(false)
    }
  }

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/^(.{2})(.+)/, '$1/$2')

  if (reserving) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        Резервируем места...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Оформление заказа</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              {timeLeft === 0 && (
                <button onClick={() => navigate(-1)} className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                  ← Вернуться к выбору мест
                </button>
              )}
            </div>
          </div>
        )}

        {reservedUntil && timeLeft > 0 && (
          <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
            timeLeft < 120
              ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-400'
          }`}>
            <Clock className="w-4 h-4 flex-shrink-0" />
            Места зарезервированы. Времени для оплаты:
            <span className="font-bold ml-1 font-mono">{formatTime(timeLeft)}</span>
          </div>
        )}

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-teal-500" />
              Выбранные места
            </h2>
            <div className="space-y-0 mb-4">
              {cart.items.map(item => (
                <div key={item.seatId} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">
                      Ряд <b>{item.rowLabel}</b>, место <b>{item.seatNumber}</b>
                    </span>
                    {item.type === 'vip' && (
                      <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">VIP</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground">{item.price} ₽</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-muted-foreground text-sm">Итого</span>
              <span className="text-2xl font-bold text-foreground">{total} ₽</span>
            </div>
          </div>

          {(!error || timeLeft > 0) && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-500" />
                Данные карты (тестовый режим)
              </h2>
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Номер карты</label>
                  <input
                    className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors font-mono tracking-widest"
                    placeholder="0000 0000 0000 0000"
                    value={cardNum}
                    onChange={e => setCardNum(formatCard(e.target.value))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Срок действия</label>
                    <input
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors font-mono"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
                    <input
                      className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors font-mono"
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  Тестовый режим — реальные деньги не списываются
                </div>

                <button
                  type="submit"
                  disabled={paying || timeLeft === 0}
                  className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)] text-sm"
                >
                  {paying ? 'Обработка...' : `Оплатить ${total} ₽`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
