// frontend/src/pages/TravelModePage.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  ChevronLeft,
  ArrowLeft, 
  Luggage, 
  ThermometerSun, 
  Compass, 
  Heart, 
  Briefcase, 
  Camera, 
  PartyPopper, 
  Sparkle, 
  Shirt, 
  Layers, 
  Maximize2,
  X,
  Palette,
  Tag,
  CheckCheck,
  Ticket
} from 'lucide-react';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  color?: string;
  brand?: string;
  style_tag?: string;
  image_url: string;
  wears_count: number;
  is_favorite: boolean;
}

interface DayOutfitPlan {
  day: number;
  title: string;
  description: string;
  items: ClothingItem[];
}

interface TravelPlanResponse {
  weather: {
    destination_display: string;
    avg_temp_c: number;
    min_temp_c: number;
    max_temp_c: number;
    condition: string;
    summary: string;
  };
  counts: {
    tops: number;
    bottoms: number;
    shoes: number;
    outerwear: number;
    total_pieces: number;
  };
  packed_items: ClothingItem[];
  itinerary: DayOutfitPlan[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const TRIP_TYPES = [
  { id: 'Leisure', label: 'Casual / Explorer', icon: Camera },
  { id: 'Date', label: 'Romantic / Date', icon: Heart },
  { id: 'Business', label: 'Business / Work', icon: Briefcase },
  { id: 'Party', label: 'Nightlife / Party', icon: PartyPopper },
  { id: 'Adventure', label: 'Outdoor / Adventure', icon: Compass }
];

const POPULAR_DESTINATIONS = ['Kashmir', 'Goa', 'Paris', 'Tokyo', 'Manali', 'Dubai'];

function getGarmentRoleBadge(item: ClothingItem) {
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (cat.includes('dress') || name.includes('dress') || name.includes('gown') || name.includes('jumpsuit')) {
    return { label: 'ONE-PIECE', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' };
  }
  if (cat.includes('accessor') || name.includes('bracelet') || name.includes('watch') || name.includes('sunglass')) {
    return { label: 'ACCENT', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
  }
  if (cat.includes('shoe') || cat.includes('footwear') || name.includes('sneaker') || name.includes('shoe')) {
    return { label: 'FOOTWEAR', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  }
  if (cat.includes('bottom') || name.includes('pant') || name.includes('jean') || name.includes('sweatpant') || name.includes('skirt')) {
    return { label: 'BOTTOM', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
  }
  if (cat.includes('outer') || name.includes('jacket') || name.includes('coat') || name.includes('cardigan')) {
    return { label: 'LAYER', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
  }
  return { label: 'TOP', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' };
}

export default function TravelModePage() {
  const [destination, setDestination] = useState('Kashmir');
  const [duration, setDuration] = useState('5');
  const [tripType, setTripType] = useState('Leisure');

  const [loading, setLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Connecting to satellite climate sensors...');
  const [plan, setPlan] = useState<TravelPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Flashcard Day index (1-based)
  const [activeDay, setActiveDay] = useState<number>(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  
  // Inspection & Journey Celebration Modal States
  const [inspectItem, setInspectItem] = useState<ClothingItem | null>(null);
  const [showJourneyCelebration, setShowJourneyCelebration] = useState(false);

  // Ref to smoothly auto-scroll day pills into view on phone/tablet
  const dayButtonsRef = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (plan && dayButtonsRef.current[activeDay]) {
      dayButtonsRef.current[activeDay]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeDay, plan]);

  // Dynamic Ticker Loading Steps
  useEffect(() => {
    if (!loading) return;
    const steps = [
      `Connecting to satellite climate sensors for ${destination || 'Destination'}...`,
      'Analyzing wardrobe color palette & fabric weights...',
      'Assembling mix-and-match daily looks from your closet...',
      'Optimizing capsule efficiency & accessory pairings...'
    ];
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % steps.length;
      setLoadingStepText(steps[current]);
    }, 750);
    return () => clearInterval(interval);
  }, [loading, destination]);

  const toggleItemCheck = (id: string) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (plan && plan.packed_items.length > 0 && plan.packed_items.every(it => updated[it.id])) {
        setShowJourneyCelebration(true);
      }
      return updated;
    });
  };

  const handlePackAllToggle = () => {
    if (!plan) return;
    const allChecked = plan.packed_items.every(it => checkedItems[it.id]);
    if (allChecked) {
      setCheckedItems({});
    } else {
      const all: Record<string, boolean> = {};
      plan.packed_items.forEach(it => { all[it.id] = true; });
      setCheckedItems(all);
      setShowJourneyCelebration(true);
    }
  };

  const handlePack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination city or country.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
      if (!token) throw new Error('Authentication session expired. Please log in again.');

      const res = await fetch('http://localhost:8000/api/travel/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: destination.trim(),
          duration: parseInt(duration, 10) || 5,
          trip_type: tripType
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to generate travel packing plan.');
      }

      const planData: TravelPlanResponse = await res.json();
      setPlan(planData);
      setActiveDay(1);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string, temp: number) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (c.includes('snow')) return <Snowflake className="w-5 h-5 text-cyan-300" />;
    if (temp < 15) return <ThermometerSun className="w-5 h-5 text-indigo-300" />;
    return <Sun className="w-5 h-5 text-amber-400 animate-pulse" />;
  };

  const packedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalPacked = plan?.packed_items.length || 0;
  const packedPercentage = totalPacked > 0 ? Math.round((packedCount / totalPacked) * 100) : 0;

  const currentDayPlan = plan?.itinerary.find(d => d.day === activeDay) || plan?.itinerary[0];

  const filteredSuitcaseItems = plan?.packed_items.filter(item => {
    if (selectedCategoryFilter === 'All') return true;
    const role = getGarmentRoleBadge(item).label;
    return role.toLowerCase() === selectedCategoryFilter.toLowerCase();
  }) || [];

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-8 md:space-y-10 pb-16 px-2 sm:px-4 overflow-hidden">
      {/* Ambient Runway Lighting Orbs */}
      <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-600/15 via-violet-600/8 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* =========================================================
          CINEMATIC FULLSCREEN LOADING DEPARTURE LOUNGE
         ========================================================= */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-zinc-950/95 backdrop-blur-3xl overflow-hidden"
          >
            {/* Pulsing Layered Aurora Rings */}
            <div className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] bg-gradient-to-tr from-violet-600/25 via-fuchsia-600/20 to-indigo-600/20 rounded-full blur-[130px] animate-pulse pointer-events-none" />
            <div className="absolute w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full space-y-7 px-4">
              
              {/* Floating Luggage & Airplane Beacon */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -14, 0],
                    rotate: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 3.2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-violet-950 via-violet-800 to-fuchsia-600 border-2 border-violet-400/50 flex items-center justify-center text-white shadow-[0_0_60px_rgba(138,43,226,0.7)]"
                >
                  <Luggage className="w-14 h-14 sm:w-16 sm:h-16" />
                </motion.div>

                {/* Orbiting Plane */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 flex items-start justify-end"
                >
                  <div className="p-2 rounded-full bg-zinc-900 border border-violet-400 text-violet-300 shadow-[0_0_15px_rgba(138,43,226,0.9)]">
                    <Plane className="w-4 h-4" />
                  </div>
                </motion.div>
              </div>

              {/* Dynamic Loading Text */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-[11px] font-semibold tracking-wider uppercase">
                  <Ticket className="w-3.5 h-3.5 text-amber-300" />
                  <span>Curating Capsule Deck</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-display text-white font-medium tracking-tight">
                  Packing for {destination || 'Your Trip'}...
                </h2>

                <div className="h-6 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingStepText}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs sm:text-sm text-violet-300 font-light"
                    >
                      {loadingStepText}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Glowing Runway Progress Bar */}
              <div className="w-64 sm:w-72 h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(138,43,226,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* =========================================================
            STATE 1: TRIP BUILDER FORM
           ========================================================= */}
        {!plan && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full relative z-10 space-y-8 md:space-y-10 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(138,43,226,0.2)] mb-2">
                <Compass className="w-3.5 h-3.5 text-violet-300 animate-pulse" />
                <span>INTELLIGENT TRAVEL PACKING</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-medium text-white tracking-tight">
                Pack My Wardrobe
              </h1>
              <p className="text-xs sm:text-sm text-white/60 font-light">
                Tell us about your trip. Aria coordinates a weather-matched capsule from your real closet.
              </p>
            </div>

            <form onSubmit={handlePack} className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-semibold text-white/50 block">Destination</label>
                <div className="relative flex items-center bg-black/50 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30 transition">
                  <MapPin className="w-4 h-4 text-violet-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Kashmir, Goa, Paris, Tokyo"
                    className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-white/40 uppercase font-semibold">Popular:</span>
                  {POPULAR_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] transition border ${
                        destination.toLowerCase() === dest.toLowerCase()
                          ? 'bg-violet-500/25 border-violet-400 text-violet-200 font-semibold'
                          : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-white/50 block">Duration (Days)</label>
                  <div className="relative flex items-center bg-black/50 border border-white/10 rounded-2xl px-4 py-2.5">
                    <Calendar className="w-4 h-4 text-violet-400 mr-2.5 shrink-0" />
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                    >
                      {[...Array(14)].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-zinc-900 text-white">
                          {i + 1} {i + 1 === 1 ? 'Day' : 'Days'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-white/50 block">Trip Aesthetic</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TRIP_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = tripType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTripType(t.id)}
                          className={`p-2 rounded-xl text-left border flex items-center gap-2 transition text-xs ${
                            isSelected
                              ? 'bg-violet-600/30 border-violet-400 text-white font-medium shadow-[0_0_15px_rgba(138,43,226,0.3)]'
                              : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                          <span className="truncate">{t.label.split(' / ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 text-white font-semibold text-sm transition shadow-[0_0_30px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Build My Packing List 🧳 ✨</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* =========================================================
            STATE 2: FIRST-CLASS BOARDING PASS & 3D FLASHCARD DECK
           ========================================================= */}
        {plan && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative z-10 space-y-8"
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
              <button
                onClick={() => setPlan(null)}
                className="flex items-center gap-2 text-violet-400 hover:text-violet-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-4 h-4" /> Pack for another trip
              </button>

              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-950/80 border border-white/10 text-xs text-white shadow-lg">
                {getWeatherIcon(plan.weather.condition, plan.weather.avg_temp_c)}
                <span className="font-semibold">{plan.weather.destination_display}</span>
                <span className="text-white/40">•</span>
                <span className="text-violet-300 font-bold">{plan.weather.avg_temp_c}°C</span>
                <span className="text-white/60 hidden sm:inline">({plan.weather.condition})</span>
              </div>
            </div>

            {/* First-Class Digital Boarding Pass Weather Card */}
            <div className="rounded-3xl p-6 border border-violet-500/30 bg-gradient-to-r from-violet-950/50 via-zinc-950/95 to-zinc-950 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                  <Sun className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Destination Climate Forecast
                    </span>
                    <span className="text-xs text-white/50">{plan.itinerary.length} Days Planned</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-medium text-white">
                    {plan.weather.destination_display} · {plan.weather.avg_temp_c}°C ({plan.weather.condition})
                  </h2>
                  <p className="text-xs text-white/70 leading-relaxed font-light max-w-2xl">
                    {plan.weather.summary}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 shrink-0 text-left md:text-right space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-violet-300 tracking-wider block">
                  Capsule Versatility
                </span>
                <div className="text-base font-semibold text-white font-display">
                  {plan.itinerary.length} Looks / {plan.counts.total_pieces} Pieces
                </div>
              </div>
            </div>

            {/* MAIN BENTO GRID: Flashcard Deck Left + Luggage Checklist Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* =========================================================
                  LEFT: FLASHCARD RUNWAY DECK WITH RESPONSIVE DAY TABS
                 ========================================================= */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* DAY SELECTOR TOOLBAR 
                    - Desktop / Laptop (lg+): Full wrap grid (all boxes fully visible)
                    - Phone / Tablet (<lg): Touch slide carousel (swipeable horizontal strip)
                */}
                <div className="flex items-center justify-between gap-2.5 bg-zinc-950/80 p-2 sm:p-2.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg w-full">
                  
                  {/* Days Container */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-nowrap lg:flex-wrap overflow-x-auto lg:overflow-visible scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 px-0.5">
                    {plan.itinerary.map((dayPlan) => {
                      const isActive = activeDay === dayPlan.day;
                      return (
                        <button
                          key={dayPlan.day}
                          ref={(el) => { dayButtonsRef.current[dayPlan.day] = el; }}
                          onClick={() => setActiveDay(dayPlan.day)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all text-center whitespace-nowrap shrink-0 lg:shrink ${
                            isActive
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)] border border-violet-400/50'
                              : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent'
                          }`}
                        >
                          Day {dayPlan.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Prev / Next Arrows */}
                  <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-white/10 self-center">
                    <button
                      onClick={() => setActiveDay(prev => Math.max(1, prev - 1))}
                      disabled={activeDay === 1}
                      className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 transition cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveDay(prev => Math.min(plan.itinerary.length, prev + 1))}
                      disabled={activeDay === plan.itinerary.length}
                      className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 transition cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Active Outfit Flashcard */}
                <AnimatePresence mode="wait">
                  {currentDayPlan && (
                    <motion.div
                      key={currentDayPlan.day}
                      initial={{ opacity: 0, scale: 0.96, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -12 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="rounded-3xl p-6 sm:p-8 border border-violet-500/30 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-violet-950/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/25 inline-block mb-1">
                            Day {currentDayPlan.day} · Curated Look
                          </span>
                          <h3 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight">
                            {currentDayPlan.title}
                          </h3>
                        </div>

                        <span className="text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto flex items-center gap-1.5">
                          <Sparkle className="w-3.5 h-3.5 text-violet-300 fill-current" />
                          <span>{currentDayPlan.items.length} Coordinated Pieces</span>
                        </span>
                      </div>

                      {/* Narrative Quote */}
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white/80 leading-relaxed font-light italic">
                        "{currentDayPlan.description}"
                      </div>

                      {/* Garment Grid with Exact Roles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                        {currentDayPlan.items.map((item, itemIdx) => {
                          const badge = getGarmentRoleBadge(item);

                          return (
                            <motion.div
                              key={item.id || itemIdx}
                              whileHover={{ y: -6, scale: 1.02 }}
                              onClick={() => setInspectItem(item)}
                              className="group relative rounded-2xl border border-white/10 bg-black/60 overflow-hidden p-3 text-center flex flex-col justify-between cursor-pointer hover:border-violet-400/60 hover:shadow-[0_0_30px_rgba(138,43,226,0.35)] transition-all"
                            >
                              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 mb-2.5 relative">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                />
                                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${badge.color}`}>
                                  {badge.label}
                                </div>
                                <div className="absolute inset-0 bg-violet-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-white truncate" title={item.name}>
                                {item.name}
                              </div>
                              <div className="text-[10px] text-white/50 capitalize mt-0.5">
                                {item.category} {item.color ? `• ${item.color}` : ''}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* =========================================================
                  RIGHT: SUITCASE LUGGAGE PACKING CHECKLIST
                 ========================================================= */}
              <div className="lg:col-span-4 rounded-3xl p-5 sm:p-6 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl space-y-4 sticky top-6">
                
                {/* Station Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold text-white text-sm">Luggage Checklist</h3>
                  </div>
                  <button
                    onClick={handlePackAllToggle}
                    className="text-[11px] text-violet-300 hover:text-white flex items-center gap-1 font-medium transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{packedPercentage === 100 ? 'Unpack All' : 'Pack All'}</span>
                  </button>
                </div>

                {/* Progress Bar & Capacity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>{packedCount} of {totalPacked} items packed</span>
                    <span className="text-emerald-400 font-semibold">{packedPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${packedPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {['All', 'Top', 'Bottom', 'Footwear', 'Layer', 'Accent'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold transition border ${
                        selectedCategoryFilter === cat
                          ? 'bg-violet-600 text-white border-violet-400 shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Packed Items Checklist */}
                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-1">
                  {filteredSuitcaseItems.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    const badge = getGarmentRoleBadge(item);

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemCheck(item.id)}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-white/40'
                            : 'bg-white/5 border-white/10 hover:border-violet-500/30 text-white'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/30 shrink-0" />
                        )}
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={`w-10 h-10 rounded-xl object-cover border border-white/10 ${isChecked ? 'opacity-40' : ''}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isChecked ? 'line-through text-white/40' : 'text-white'}`}>
                            {item.name}
                          </p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          HAPPY JOURNEY / TRIP-READY CELEBRATION MODAL
         ========================================================= */}
      <AnimatePresence>
        {showJourneyCelebration && plan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJourneyCelebration(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-black border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(138,43,226,0.35)] z-10 overflow-hidden text-center space-y-5"
            >
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <button
                onClick={() => setShowJourneyCelebration(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-emerald-400 p-0.5 shadow-[0_0_30px_rgba(138,43,226,0.6)]">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-white">
                  <Plane className="w-8 h-8 text-violet-300 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>100% Suitcase Packed</span>
                </div>
                <h3 className="font-display font-medium text-2xl text-white tracking-tight">
                  You're All Set! ✈️
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  Everything is packed for <strong className="text-white font-semibold">{plan.weather.destination_display}</strong>. All {plan.counts.total_pieces} capsule pieces and {plan.itinerary.length} daily looks are prepared in your luggage.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-violet-200/90 italic font-light">
                "Everything is packed. Your journey awaits! Have a wonderful and stylish trip. 💜"
              </div>

              <button
                onClick={() => setShowJourneyCelebration(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold shadow-[0_0_20px_rgba(138,43,226,0.5)] transition"
              >
                View My Travel Itinerary
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          HIGH-RES CLOTH INSPECTION MODAL
         ========================================================= */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectItem(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/20 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
            >
              <button
                onClick={() => setInspectItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="w-40 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-zinc-900 relative shadow-xl">
                  <img
                    src={inspectItem.image_url}
                    alt={inspectItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white uppercase">
                    {getGarmentRoleBadge(inspectItem).label}
                  </div>
                </div>

                <div className="flex-1 space-y-3.5 text-left w-full">
                  <div>
                    <h3 className="font-display font-medium text-xl text-white leading-snug">
                      {inspectItem.name}
                    </h3>
                    <p className="text-xs text-violet-400 font-semibold uppercase mt-0.5">
                      {inspectItem.subcategory || inspectItem.category}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    {inspectItem.color && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-violet-300" /> Color Tone
                        </span>
                        <span className="font-semibold text-white">{inspectItem.color}</span>
                      </div>
                    )}

                    {inspectItem.brand && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-violet-300" /> Brand
                        </span>
                        <span className="font-semibold text-white">{inspectItem.brand}</span>
                      </div>
                    )}

                    {inspectItem.style_tag && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-violet-300" /> Style Code
                        </span>
                        <span className="font-semibold text-violet-300">{inspectItem.style_tag}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectItem(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-lg"
                  >
                    Back to Capsule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}