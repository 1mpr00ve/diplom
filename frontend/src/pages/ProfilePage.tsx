import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { User, ShoppingBag, Ticket, ChevronRight, Calendar, MapPin } from 'lucide-react'
import type { RootState } from '../store'
import type { Order } from '../types'
import api from '../api'
import Header from '../components/Header'

export default function ProfilePage() {
  const { user, token } = useSelector((s: RootState) => s.auth)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.get('/api/me/orders')
      .then(r => setOrders(r.data ?? []))
      .finally(() => setLoading(false))
  }, [token])

  const statusLabel: Record<string, string> = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    cancelled: 'Отменён',
  }
  const statusColor: Record<string, string> = {
    pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    paid: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full border bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400">
              {user?.role === 'organizer' ? 'Организатор' : 'Покупатель'}
            </span>
          </div>
          {user?.role === 'organizer' && (
            <Link
              to="/dashboard"
              className="ml-auto flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
            >
              Мои события
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Orders */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-500" />
            История заказов
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground">У вас ещё нет заказов</p>
              <Link to="/" className="mt-4 inline-block text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors">
                Найти мероприятия
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-card border border-border rounded-xl p-5 hover:border-teal-500/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate group-hover:text-teal-500 transition-colors">
                        {order.event_title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </span>
                        <span>Заказ #{order.id}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor[order.status] ?? 'text-muted-foreground bg-muted border-border'}`}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {order.total_price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
