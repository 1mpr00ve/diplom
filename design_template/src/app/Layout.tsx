import { Outlet, Link } from "react-router";
import { Ticket, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground transition-colors duration-300">
      <header className="bg-[#0f172a] border-b border-[#1e293b] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-teal-400 group-hover:text-teal-300 transition-colors drop-shadow-[0_0_8px_rgba(20,184,166,0.4)]">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">
              TicketFlow
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Events
            </Link>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Venues
            </a>
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Support
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <Link
              to="/auth"
              className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
