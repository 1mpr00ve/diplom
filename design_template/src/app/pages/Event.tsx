import { useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Calendar, MapPin, Building2, Ticket, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

// Mock Event
const EVENT = {
  id: "1",
  title: "NEON Nights: Electronic Music Festival",
  date: "Aug 12, 2026 • 22:00",
  venue: "Main Stage Arena",
  address: "123 Entertainment Blvd, Metropolis",
  priceFrom: 85.00,
  availableSeats: 432,
};

type SeatStatus = "free" | "vip" | "booked";

interface Seat {
  id: string;
  row: string;
  col: number;
  status: SeatStatus;
  price: number;
  x: number;
  y: number;
}

// Generate arced seats
const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const ROWS = ["A", "B", "C", "D", "E", "F"];
  const cx = 400;
  const cy = -50; // Center is above the stage so the arc curves around it (U-shape)
  
  ROWS.forEach((row, rIndex) => {
    const numSeats = 14;
    const radius = 220 + rIndex * 50; // Distance from center
    const startAngle = 145; // Degrees
    const endAngle = 35; // Degrees
    const angleStep = (startAngle - endAngle) / (numSeats - 1);
    
    for (let c = 1; c <= numSeats; c++) {
      const angleDeg = startAngle - (c - 1) * angleStep;
      const angleRad = (angleDeg * Math.PI) / 180;
      
      const x = cx + radius * Math.cos(angleRad);
      const y = cy + radius * Math.sin(angleRad);
      
      let status: SeatStatus = "free";
      let price = EVENT.priceFrom;

      // VIP for first two rows
      if (rIndex < 2) {
        status = "vip";
        price = EVENT.priceFrom * 1.5;
      }

      // Randomly book some seats
      if (Math.random() < 0.4) {
        status = "booked";
      }

      seats.push({ id: `${row}${c}`, row, col: c, status, price, x, y });
    }
  });
  return seats;
};

const INITIAL_SEATS = generateSeats();

export function EventPage() {
  const { id } = useParams();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

  const toggleSeat = (seat: Seat) => {
    if (seat.status === "booked") return;
    
    const newSelected = new Set(selectedSeatIds);
    if (newSelected.has(seat.id)) {
      newSelected.delete(seat.id);
    } else {
      newSelected.add(seat.id);
    }
    setSelectedSeatIds(newSelected);
  };

  const selectedSeats = useMemo(() => INITIAL_SEATS.filter(s => selectedSeatIds.has(s.id)), [selectedSeatIds]);
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)] flex flex-col relative pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
        
        {/* Breadcrumb */}
        <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-foreground mb-8 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground leading-tight">
            {EVENT.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Date & Time</div>
                <div className="font-medium text-foreground">{EVENT.date}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Venue</div>
                <div className="font-medium text-foreground">{EVENT.venue}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">Location</div>
                <div className="font-medium text-foreground">{EVENT.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Starting from</div>
            <div className="text-2xl font-bold">${EVENT.priceFrom.toFixed(2)}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Available Seats</div>
            <div className="text-2xl font-bold">{EVENT.availableSeats}</div>
          </div>
        </div>

        {/* Seat Map Area */}
        <div className="bg-card rounded-[12px] border border-border shadow-sm overflow-hidden flex flex-col items-center p-8 relative min-h-[500px]">
          
          <h2 className="text-xl font-bold mb-8 text-foreground">Select Your Seats</h2>
          
          {/* Stage Label */}
          <div className="w-64 h-12 bg-gradient-to-b from-teal-500/20 to-transparent border-t-4 border-teal-500 rounded-t-lg flex items-center justify-center mb-8 relative">
            <span className="text-teal-700 dark:text-teal-300 font-bold tracking-[0.2em] text-sm">STAGE</span>
            {/* Soft glow for dark theme */}
            <div className="absolute inset-0 bg-teal-500/10 blur-xl pointer-events-none dark:block hidden" />
          </div>

          {/* SVG Interactive Map */}
          <div className="w-full max-w-3xl overflow-x-auto custom-scrollbar flex justify-center pb-10">
            <svg viewBox="0 0 800 500" className="w-[800px] h-[500px] select-none" style={{ minWidth: '800px' }}>
              {/* Definitions for Glow Filter */}
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Row Letters (Left Side) */}
              {["A", "B", "C", "D", "E", "F"].map((row, i) => {
                const radius = 220 + i * 50;
                const angleRad = (152 * Math.PI) / 180;
                const x = 400 + radius * Math.cos(angleRad);
                const y = -50 + radius * Math.sin(angleRad);
                return (
                  <text
                    key={`label-${row}`}
                    x={x - 20}
                    y={y}
                    className="text-sm font-bold fill-slate-400 dark:fill-slate-500"
                    alignmentBaseline="middle"
                    textAnchor="middle"
                  >
                    {row}
                  </text>
                );
              })}

              {/* Seats */}
              {INITIAL_SEATS.map((seat) => {
                const isSelected = selectedSeatIds.has(seat.id);
                
                // Determine styling based on status
                let fill = "transparent";
                let stroke = "currentColor"; // Will be overridden by className
                let strokeWidth = "2";
                let filter = "none";
                let className = "transition-all duration-200 cursor-pointer hover:stroke-teal-400";
                let textFill = "currentColor";

                if (isSelected) {
                  fill = "#14b8a6"; // Teal
                  stroke = "#14b8a6";
                  filter = "url(#glow)";
                  textFill = "#ffffff";
                } else if (seat.status === "booked") {
                  fill = "var(--color-muted-foreground)";
                  stroke = "transparent";
                  className = "cursor-not-allowed opacity-30";
                  textFill = "transparent"; // Hide text for booked
                } else if (seat.status === "vip") {
                  fill = "#f59e0b"; // Amber/Gold
                  stroke = "#f59e0b";
                  textFill = "#ffffff";
                  className = "transition-all duration-200 cursor-pointer hover:brightness-110";
                } else {
                  // Available Standard
                  stroke = "var(--color-muted-foreground)";
                  textFill = "var(--color-muted-foreground)";
                  className = "transition-all duration-200 cursor-pointer hover:stroke-teal-500 hover:fill-teal-500/10";
                }

                return (
                  <g 
                    key={seat.id} 
                    onClick={() => toggleSeat(seat)}
                    className={className}
                  >
                    <circle
                      cx={seat.x}
                      cy={seat.y}
                      r="14"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      filter={filter}
                    />
                    <text
                      x={seat.x}
                      y={seat.y + 1} // small optical tweak
                      fontSize="10"
                      fontWeight="bold"
                      fill={textFill}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="pointer-events-none"
                    >
                      {seat.col}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-border w-full mt-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 bg-transparent"></div>
              <span className="text-sm font-medium text-muted-foreground">Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-500"></div>
              <span className="text-sm font-medium text-muted-foreground">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-500 border-2 border-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              <span className="text-sm font-medium text-muted-foreground">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <span className="text-sm font-medium text-muted-foreground">Booked</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cart Summary Panel */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 pointer-events-none">
          <div className="max-w-4xl mx-auto bg-card rounded-[12px] border-l-4 border-l-teal-500 border-y border-r border-border shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col md:flex-row p-6 gap-6 items-center transform transition-all animate-in slide-in-from-bottom-10">
            
            <div className="flex-1 w-full">
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Ticket className="w-4 h-4 text-teal-500" />
                Selected Seats ({selectedSeats.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                {selectedSeats.map(s => (
                  <div key={s.id} className="bg-muted px-3 py-1.5 rounded-md text-sm flex items-center gap-2 border border-border">
                    <span className="font-bold text-foreground">{s.row}-{s.col}</span>
                    {s.status === "vip" && <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">VIP</span>}
                    <span className="text-muted-foreground">${s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block w-px h-16 bg-border mx-2"></div>

            <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-8">
              <div className="flex flex-col md:items-end">
                <span className="text-sm font-medium text-muted-foreground">Total Price</span>
                <span className="text-3xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
              </div>
              <button className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-2 hover:scale-[1.02]">
                Checkout <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
