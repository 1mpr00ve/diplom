import { Link } from "react-router";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const EVENTS = [
  {
    id: "1",
    title: "NEON Nights: Electronic Music Festival",
    date: "Aug 12 • 22:00",
    venue: "Main Stage Arena",
    price: "85.00",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBjb25jZXJ0JTIwbGFzZXJzfGVufDF8fHx8MTc3ODc4MjYwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    available: 432
  },
  {
    id: "2",
    title: "Phantom of the Opera: Modern Revival",
    date: "Sep 05 • 19:30",
    venue: "Grand Theater Hall",
    price: "120.00",
    image: "https://images.unsplash.com/photo-1615754890634-69ac8bca7189?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0aGVhdGVyJTIwc3RhZ2UlMjBzcG90bGlnaHR8ZW58MXx8fHwxNzc4NzgyNjA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    available: 89
  },
  {
    id: "3",
    title: "FutureTech Summit 2026",
    date: "Oct 15 • 09:00",
    venue: "Convention Center",
    price: "450.00",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMGtleW5vdGUlMjBzcGVha2VyfGVufDF8fHx8MTc3ODc4MjYwNnww&ixlib=rb-4.1.0&q=80&w=1080",
    available: 1024
  },
];

export function Home() {
  return (
    <div className="w-full flex-1">
      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Discover the best <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              live experiences.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mb-10">
            Secure your spot at the most anticipated concerts, theater performances, and tech conferences worldwide with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="Search events, artists, or venues..." 
              className="px-6 py-4 rounded-lg bg-[#1e293b] border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent flex-1 max-w-md shadow-inner"
            />
            <button className="px-8 py-4 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-400 transition-colors shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Trending Events</h2>
          <a href="#" className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline flex items-center">
            View all <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className="group relative bg-card rounded-[12px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border flex flex-col h-full"
            >
              {/* Gradient Stripe */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400 z-10" />
              
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-muted">
                <ImageWithFallback
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm">
                  {event.available} seats left
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-bold text-xl mb-4 leading-snug text-card-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-3 mb-6 mt-auto">
                  <div className="flex items-center text-muted-foreground text-sm font-medium">
                    <Calendar className="w-4 h-4 mr-3 flex-shrink-0 text-slate-400" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-border flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">From</span>
                    <span className="font-bold text-lg text-foreground">${event.price}</span>
                  </div>
                  <Link
                    to={`/event/${event.id}`}
                    className="bg-teal-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-400 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(20,184,166,0.4)] inline-flex items-center justify-center text-sm"
                  >
                    Get Tickets
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
