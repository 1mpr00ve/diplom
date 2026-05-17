import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Ticket, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import api from '../api'
import { setAuth } from '../store/authSlice'
import Header from '../components/Header'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'buyer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const { data } = await api.post(url, form)
      dispatch(setAuth({ token: data.token, user: data.user }))
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[400px] w-full bg-card p-8 sm:p-10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-border relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <Ticket className="w-8 h-8 text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              <span className="font-bold text-2xl tracking-tight text-foreground">TicketShop</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === 'login' ? 'Войдите, чтобы купить билеты.' : 'Зарегистрируйтесь для покупки билетов.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 space-x-1 bg-muted rounded-lg mb-8">
            <button
              onClick={() => { setMode('login'); setError('') }}
              className={clsx(
                'w-full py-2 text-sm font-medium rounded-md transition-all duration-200',
                mode === 'login'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Вход
            </button>
            <button
              onClick={() => { setMode('register'); setError('') }}
              className={clsx(
                'w-full py-2 text-sm font-medium rounded-md transition-all duration-200',
                mode === 'register'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Имя</label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={set('name')}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Я хочу</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['buyer', 'organizer'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={clsx(
                        'py-3 text-sm font-medium rounded-lg border transition-all',
                        form.role === r
                          ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                          : 'border-border text-muted-foreground hover:border-teal-500/50'
                      )}
                    >
                      {r === 'buyer' ? 'Покупать билеты' : 'Продавать билеты'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm text-foreground bg-[var(--input-background)] placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition-all shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
              >
                {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
            >
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
