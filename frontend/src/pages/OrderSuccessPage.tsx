import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Ticket, Calendar } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api'
import Header from '../components/Header'

interface OrderItem {
  id: number
  row_label: string
  seat_number: number
  type: string
  price: number
}

interface Order {
  id: number
  event_id: number
  total_price: number
  status: string
  created_at: string
  items: OrderItem[]
}

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/orders/${id}`)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">Загрузка...</div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Заказ не найден.</p>
        <Link to="/" className="mt-4 inline-block text-teal-500 hover:underline">На главную</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Success banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/10 border-2 border-teal-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-teal-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Оплата прошла успешно!</h1>
          <p className="text-muted-foreground">Заказ №{order.id} подтверждён</p>
        </div>

        {/* QR-код билета */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 flex flex-col items-center">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-teal-500" />
            Электронный билет
          </h2>
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={`${window.location.origin}/orders/${order.id}?token=${order.id}-${order.total_price}`}
              size={180}
              level="M"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Предъявите этот код на входе. Заказ №{order.id}
          </p>
        </div>

        {/* Order details */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-teal-500" />
            Ваши билеты
          </h2>
          <div className="space-y-0 mb-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">
                    Ряд <b>{item.row_label}</b>, место <b>{item.seat_number}</b>
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
            <span className="text-muted-foreground text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(order.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-2xl font-bold text-foreground">{order.total_price} ₽</span>
          </div>
        </div>

        <Link
          to="/"
          className="block w-full text-center py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)]"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
