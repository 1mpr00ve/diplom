import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Ticket, Sun, Moon, User, ShoppingCart, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react'
import type { RootState } from '../store'
import { logout } from '../store/authSlice'
import { useTheme } from '../contexts/ThemeContext'

export default function Header() {
  const { token, user } = useSelector((s: RootState) => s.auth)
  const cartCount = useSelector((s: RootState) => s.cart.items.length)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="bg-[#0f172a] border-b border-[#1e293b] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Ticket className="w-6 h-6 text-teal-400 group-hover:text-teal-300 transition-colors drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]" />
          <span className="font-bold text-xl tracking-tight text-white">TicketShop</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Мероприятия
          </Link>
          {user?.role === 'organizer' && (
            <Link to="/dashboard" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
              <LayoutDashboard className="w-4 h-4" />
              Мои события
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Администрирование
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {cartCount > 0 && (
            <Link to="/checkout" className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          )}

          {token ? (
            <div className="flex items-center gap-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]"
            >
              <User className="w-4 h-4" />
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
