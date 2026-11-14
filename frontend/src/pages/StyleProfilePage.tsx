// frontend/src/pages/StyleProfilePage.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { 
  Sparkles, 
  Loader2, 
  Palette, 
  Shirt, 
  TrendingUp, 
  Footprints, 
  Sparkle, 
  Compass, 
  Scissors, 
  Ban, 
  Check, 
  Quote,
  Pencil,
  X,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ColorDna {
  name: string;
  hex: string;
  count: number;
  percentage: number;
}

interface CategoryDna {
  category: string;
  count: number;
  percentage: number;
}

interface DnaResponse {
  archetype: {
    title: string;
    badge: string;
    motto: string;
    versatility_score: number;
    total_items: number;
    shirt_size: string;
    shoe_size: string;
  };
  composition: { label: string; value: number }[];
  colors: {
    palette: ColorDna[];
    preferred: string[];
    avoided: string[];
  };
  categories: CategoryDna[];
  insights: string[];
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
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }
};

const PROGRESS_GRADIENTS = [
  'from-violet-600 via-fuchsia-600 to-indigo-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-amber-500 via-orange-500 to-yellow-600',
  'from-cyan-500 via-sky-500 to-blue-600'
];

export default function StyleProfilePage() {
  const [dna, setDna] = useState<DnaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Edit Modal State for Sizing & Motto
  const [isEditingSize, setIsEditingSize] = useState(false);
  const [editShoeSize, setEditShoeSize] = useState('');
  const [editShirtSize, setEditShirtSize] = useState('');
  const [editMotto, setEditMotto] = useState('');
  const [isSavingPref, setIsSavingPref] = useState(false);

  // 🔄 Automated Live-Sync Function
  const fetchStyleDna = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setErrorMsg(null);
    }

    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/preferences/dna?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setDna(data);
      setErrorMsg(null);
      setEditShoeSize((data?.archetype?.shoe_size || 'US 10').replace('US', '').trim());
      setEditShirtSize(data?.archetype?.shirt_size || 'M');
      setEditMotto(data?.archetype?.motto || '');
    } catch (e: any) {
      console.error("Failed to sync Style DNA", e);
      if (!silent) {
        setErrorMsg(e?.message || 'Failed to sync Style DNA from backend.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. Initial load on mount
  useEffect(() => {
    fetchStyleDna();
  }, [fetchStyleDna]);

  // 2. Fully Automatic Background Sync (On tab focus, visibility change, and auto-polling)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStyleDna(true);
    }, 8000);

    const handleFocus = () => fetchStyleDna(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchStyleDna(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStyleDna]);

  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shoe_size: editShoeSize ? `US ${editShoeSize.replace('US', '').trim()}` : 'US 10',
          shirt_size: editShirtSize || 'M',
          bio: editMotto
        })
      });
      if (res.ok) {
        setIsEditingSize(false);
        await fetchStyleDna(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPref(false);
    }
  };

  const categorizeInsight = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('color') || lower.includes('palette') || lower.includes('black') || lower.includes('blue')) {
      return {
        tag: 'Color Harmony DNA',
        icon: <Palette className="w-4 h-4 text-amber-300" />,
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      };
    }
    if (lower.includes('ratio') || lower.includes('bottom') || lower.includes('top') || lower.includes('silhouette')) {
      return {
        tag: 'Proportion Balance',
        icon: <Scissors className="w-4 h-4 text-emerald-300" />,
        badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      };
    }
    if (lower.includes('motto') || lower.includes('shoes') || lower.includes('footwear')) {
      return {
        tag: 'Closet Identity',
        icon: <Footprints className="w-4 h-4 text-cyan-300" />,
        badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
      };
    }
    return {
      tag: 'Aesthetic Evolution',
      icon: <Sparkles className="w-4 h-4 text-violet-300" />,
      badgeBg: 'bg-violet-500/10 text-violet-300 border-violet-500/30'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-violet-primary animate-spin" />
          <div className="absolute inset-0 w-10 h-10 bg-violet-600/30 rounded-full blur-xl animate-pulse" />
        </div>
        <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-medium">
          Sequencing live wardrobe DNA...
        </p>
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-red-500/30 max-w-md space-y-4 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-base font-display font-medium text-white">
              Couldn't Load Style DNA
            </h2>
            <p className="text-red-300 text-xs leading-relaxed">
              {errorMsg || 'The backend did not return Style DNA data.'}
            </p>
          </div>
          <button
            onClick={() => fetchStyleDna(false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Sync</span>
          </button>
        </div>
      </div>
    );
  }

  const archetype = dna.archetype || {
    title: 'Your Style Archetype',
    badge: 'Style Profile',
    motto: 'Curating an effortless wardrobe.',
    versatility_score: 0,
    total_items: 0,
    shirt_size: 'M',
    shoe_size: 'US 10',
  };
  const palette = dna.colors?.palette ?? [];
  const preferredColors = dna.colors?.preferred ?? [];
  const avoidedColors = dna.colors?.avoided ?? [];
  const categories = dna.categories ?? [];
  const composition = dna.composition ?? [];
  const insights = dna.insights ?? [];

  return (
    <div className="relative w-full max-w-6xl mx-auto space-y-8 md:space-y-10 pb-16 px-2 sm:px-4 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-600/15 via-violet-600/8 to-transparent rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        className="w-full relative z-10 space-y-8 md:space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* =========================================================
            1. EDITORIAL HEADER WITH AUTOMATED LIVE STATUS
           ========================================================= */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.07]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-violet-300/90">
                Fashion Identity Matrix
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-none">
              Your Style DNA
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-light flex items-center gap-1.5 pt-0.5">
              <span>Live analysis of your {archetype.total_items} wardrobe pieces and synchronized parameters.</span>
            </p>
          </div>

          {/* Automated Live Pulse Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-lg self-start sm:self-auto text-xs text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="font-medium tracking-wide">Live Synchronized</span>
          </div>
        </motion.div>

        {/* =========================================================
            2. HERO ARCHETYPE BANNER (Live Sizes & Motto)
           ========================================================= */}
        <motion.div variants={itemVariants}>
          <div className="rounded-3xl p-6 sm:p-8 md:p-9 border border-violet-500/25 bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-violet-950/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-violet-500/45 transition-all duration-500">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-600/25 via-fuchsia-600/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 border border-violet-500/40 text-violet-300 text-[11px] font-semibold tracking-wide shadow-[0_0_15px_rgba(138,43,226,0.25)]">
                  <Compass className="w-3.5 h-3.5 animate-pulse text-violet-300" />
                  <span>{archetype.badge}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-white tracking-tight leading-tight">
                  {archetype.title}
                </h2>

                {/* User's Style Motto */}
                <div 
                  onClick={() => setIsEditingSize(true)}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-start gap-3 cursor-pointer group/motto transition"
                  title="Click to edit motto"
                >
                  <Quote className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-white/85 italic font-light flex-1">
                    "{archetype.motto}"
                  </p>
                  <Pencil className="w-3.5 h-3.5 text-white/40 group-hover/motto:text-violet-300 transition shrink-0 mt-0.5" />
                </div>

                {/* Live Sizing & Items Badges */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={() => setIsEditingSize(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-400/40 text-xs text-violet-200 font-semibold flex items-center gap-2 shadow-sm transition group/btn"
                  >
                    <Footprints className="w-3.5 h-3.5 text-violet-300" />
                    <span>Shoe Size: {archetype.shoe_size}</span>
                    <Pencil className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                  
                  <button
                    onClick={() => setIsEditingSize(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 font-medium flex items-center gap-2 transition group/btn"
                  >
                    <Shirt className="w-3.5 h-3.5 text-violet-400" />
                    <span>Shirt Size: {archetype.shirt_size}</span>
                    <Pencil className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>

                  <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-medium">
                    🗄️ {archetype.total_items} Digitized Pieces
                  </span>
                </div>
              </div>

              {/* Dynamic Versatility Gauge Ring */}
              <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl shadow-2xl shrink-0 self-stretch sm:self-auto justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-white/10"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="url(#score-gradient)"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={(2 * Math.PI * 34) * (1 - (archetype.versatility_score || 0) / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      fill="transparent"
                    />
                    <defs>
                      <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-semibold text-lg text-white leading-none">
                      {archetype.versatility_score}
                    </span>
                    <span className="text-[9px] text-white/50 uppercase font-semibold">/100</span>
                  </div>
                </div>

                <div className="text-left space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-violet-300 block">
                    Versatility Index
                  </span>
                  <p className="text-xs font-semibold text-white">Closet Flexibility</p>
                  <p className="text-[11px] text-emerald-400 font-medium">● Live Calculated</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            3. COUTURE STYLING BLUEPRINT & AFFINITY MATRIX
           ========================================================= */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-950/90 to-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                Fit Code
              </span>
              <Shirt className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Relaxed & Straight Silhouette</h3>
              <p className="text-xs text-white/50 font-light mt-1 leading-relaxed">
                Prioritizes modern effortless drapery and boxy top-to-bottom proportional balance.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-950/90 to-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Palette DNA
              </span>
              <Palette className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Live Wardrobe Colors</h3>
              <p className="text-xs text-white/50 font-light mt-1 leading-relaxed">
                Dynamically mapped across all your {archetype.total_items} uploaded items in real time.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-b from-zinc-950/90 to-zinc-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-0.5 rounded-full border border-fuchsia-500/20">
                Aria Signature
              </span>
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Cuffed Hem & Sneaker Break</h3>
              <p className="text-xs text-white/50 font-light mt-1 leading-relaxed">
                Spotlights footwear profiles with French tucks and lightweight layered overshirts.
              </p>
            </div>
          </div>
        </motion.div>

        {/* =========================================================
            4. REAL COLOR DNA & SILHOUETTE PROPORTIONS (Live Swatches)
           ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Bento: Real Swatches dynamically computed */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-7 rounded-3xl p-6 sm:p-7 md:p-8 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl relative overflow-hidden space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-[0_0_12px_rgba(138,43,226,0.3)]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white font-display">
                    Live Color Palette DNA
                  </h2>
                  <p className="text-[11px] text-white/50">Computed frequency of colors across your uploaded items</p>
                </div>
              </div>
            </div>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-2 gap-3">
              {palette.map((swatch) => (
                <div 
                  key={swatch.name}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3.5 hover:border-violet-500/30 transition-all"
                >
                  <div 
                    className="w-7 h-7 rounded-full border border-white/20 shrink-0 shadow-md" 
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">{swatch.name}</div>
                    <div className="text-[11px] text-white/50">{swatch.percentage}% share · {swatch.count} items</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preferred & Avoided Color Tags */}
            <div className="pt-2 border-t border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/50 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Preferred Colors:
                </span>
                {preferredColors.map((col) => (
                  <span key={col} className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                    {col}
                  </span>
                ))}
              </div>

              {avoidedColors.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white/50 font-medium flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5 text-rose-400" /> Avoided Colors:
                  </span>
                  {avoidedColors.map((col) => (
                    <span key={col} className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-medium">
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Bento: Real Silhouette & Category Distribution */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 rounded-3xl p-6 sm:p-7 md:p-8 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl relative overflow-hidden space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.3)]">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white font-display">
                    Closet Proportions
                  </h2>
                  <p className="text-[11px] text-white/50">Live category distribution</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />
                      {cat.category} ({cat.count} items)
                    </span>
                    <span className="text-fuchsia-300 font-semibold">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-500/25 flex items-center justify-between text-xs">
              <span className="text-white/80">Need more balance?</span>
              <Link to="/app/wardrobe/add" className="text-violet-300 font-semibold hover:underline flex items-center gap-1">
                + Add Piece
              </Link>
            </div>
          </motion.div>
        </div>

        {/* =========================================================
            5. REAL STYLE COMPOSITION PILLARS
           ========================================================= */}
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl p-6 sm:p-7 md:p-8 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-[0_0_12px_rgba(138,43,226,0.3)]">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-medium text-white font-display">
                  Style Composition Pillars
                </h2>
                <p className="text-[11px] text-white/50">Aesthetic tags weighted from your uploaded items & preferences</p>
              </div>
            </div>
            <span className="text-xs font-mono text-white/40">{composition.length} Pillars</span>
          </div>

          <div className="space-y-4">
            {composition.map((item, i) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-white/90 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    {item.label}
                  </span>
                  <span className="text-violet-300 font-semibold font-display tracking-wide">
                    {item.value}%
                  </span>
                </div>
                
                <div className="h-2.5 w-full bg-zinc-900 border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <motion.div 
                    className={`h-full rounded-full bg-gradient-to-r ${PROGRESS_GRADIENTS[i % PROGRESS_GRADIENTS.length]} shadow-[0_0_12px_rgba(138,43,226,0.5)]`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* =========================================================
            6. DYNAMIC EVOLUTION FEED
           ========================================================= */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white/90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Your Style Is Evolving</span>
              </h3>
              <p className="text-xs text-white/50">Dynamic AI observations based on your wardrobe rotations</p>
            </div>
            <span className="text-xs text-violet-400 font-medium">Live Intelligence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => {
              const meta = categorizeInsight(insight);
              
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="rounded-3xl p-5 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl flex flex-col justify-between gap-4 shadow-xl hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(138,43,226,0.2)] transition-all group relative overflow-hidden"
                >
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${meta.badgeBg} flex items-center gap-1.5 shadow-sm`}>
                        {meta.icon}
                        <span>{meta.tag}</span>
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">0{i + 1}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light group-hover:text-white transition-colors">
                      {insight}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 group-hover:text-violet-300/80 transition-colors">
                    <span>Aria Observation</span>
                    <Sparkle className="w-3 h-3 fill-current opacity-70" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* =========================================================
          7. IN-PAGE PROFILE QUICK-EDIT MODAL
         ========================================================= */}
      <AnimatePresence>
        {isEditingSize && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingSize(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/15 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  <h3 className="font-medium text-white text-base">Update Style Parameters</h3>
                </div>
                <button 
                  onClick={() => setIsEditingSize(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Shoe Size */}
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Shoe Size</label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 font-semibold">
                      US
                    </span>
                    <input
                      type="text"
                      value={editShoeSize}
                      onChange={(e) => setEditShoeSize(e.target.value)}
                      placeholder="e.g. 7 or 8.5"
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Shirt Size */}
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Shirt Size</label>
                  <div className="flex gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setEditShirtSize(sz)}
                        className={`flex-1 py-1.5 rounded-xl border font-semibold transition ${
                          editShirtSize === sz
                            ? 'bg-violet-600 text-white border-violet-400'
                            : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Motto */}
                <div>
                  <label className="text-white/60 block mb-1 font-medium">Personal Style Motto</label>
                  <textarea
                    rows={2}
                    value={editMotto}
                    onChange={(e) => setEditMotto(e.target.value)}
                    placeholder="e.g. Clean lines with bold accents."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={isSavingPref}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg"
              >
                {isSavingPref ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isSavingPref ? 'Synchronizing...' : 'Save & Update DNA'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}