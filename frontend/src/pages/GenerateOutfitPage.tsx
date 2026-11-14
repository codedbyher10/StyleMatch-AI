// frontend/src/pages/GenerateOutfitPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react'; 
import { 
  Sparkles, 
  Sun, 
  MapPin, 
  Droplets, 
  Wand2, 
  RefreshCcw, 
  Save, 
  Loader2, 
  Check, 
  X, 
  Maximize2, 
  Tag, 
  Palette, 
  Shirt, 
  Layers, 
  ArrowLeft,
  Sparkle,
  Flame,
  CheckCircle2,
  Compass,
  Heart,
  Sliders,
  Plus as PlusIcon,
  Minus,
  CloudRain,
  CloudSun,
  Snowflake
} from 'lucide-react';
import Button from '../components/ui/Button';
import { fetchLiveWeather, WeatherData } from '../lib/weather';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  color: string;
  brand: string;
  style_tag: string;
  image_url: string;
  wears_count: number;
  is_favorite: boolean;
}

interface Outfit {
  name: string;
  description: string;
  occasion: string;
  compatibility_score: number;
  items: ClothingItem[];
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  emoji: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }
};

const steps = [
  "Analyzing your wardrobe...",
  "Checking the live weather...",
  "Matching colors & silhouettes...",
  "Understanding your style DNA...",
  "Curating your look..."
];

export default function GenerateOutfitPage() {
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(false);

  // User input states
  const [selectedOccasion, setSelectedOccasion] = useState('Casual');
  const [selectedStyle, setSelectedStyle] = useState('Minimal');
  
  // Live & Custom Weather states
  const [temperature, setTemperature] = useState(24);
  const [weatherCondition, setWeatherCondition] = useState('Sunny');
  const [cityName, setCityName] = useState('Current Location');
  const [humidity, setHumidity] = useState(45);
  const [isEditingWeather, setIsEditingWeather] = useState(false);

  // API outputs
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Floating Heart Particle state
  const [floatingHearts, setFloatingHearts] = useState<HeartParticle[]>([]);

  // Modal State for Individual Clothing Inspection
  const [selectedCloth, setSelectedCloth] = useState<ClothingItem | null>(null);

  // ⛅ Auto-Detect Live Weather On Mount
  useEffect(() => {
    fetchLiveWeather().then((data: WeatherData) => {
      if (data) {
        setTemperature(data.temperature);
        setWeatherCondition(data.condition || 'Sunny');
        setCityName(data.city || 'Current Location');
        setHumidity(data.humidity || 45);
      }
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(false);
    setStepIndex(0);

    const token = sessionStorage.getItem('stylematch_token');
    let apiData: Outfit[] = [];
    let apiFailed = false;

    const apiCallPromise = fetch('http://127.0.0.1:8000/api/outfits/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        occasion: selectedOccasion,
        style: selectedStyle,
        temperature_c: temperature,
        weather_condition: weatherCondition
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Closet is empty or incomplete.');
      }
      return res.json();
    })
    .then(data => { apiData = data; })
    .catch(err => {
      console.error(err);
      apiFailed = true;
    });

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStepIndex(currentStep);
      } else {
        clearInterval(interval);
        
        apiCallPromise.finally(() => {
          setGenerating(false);
          if (apiFailed || apiData.length === 0) {
            alert('Could not coordinate outfits. Please ensure you have added at least one Top, one Bottom, and one pair of Shoes to your wardrobe!');
            setResult(false);
          } else {
            setOutfits(apiData);
            setCurrentOutfitIndex(0);
            setResult(true);
          }
        });
      }
    }, 1200);
  };

  const handleSaveOutfit = async () => {
    if (outfits.length === 0) return;

    // Trigger Floating Hearts Burst Animation
    const heartEmojis = ['💖', '✨', '💜', '💕', '🤍', '🥰'];
    const burstParticles: HeartParticle[] = Array.from({ length: 9 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 140,
      y: -(Math.random() * 85 + 50),
      rotate: (Math.random() - 0.5) * 60,
      scale: Math.random() * 0.5 + 0.9,
      emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
    }));

    setFloatingHearts(burstParticles);
    setTimeout(() => setFloatingHearts([]), 1500);

    setIsSaving(true);
    setIsSaved(false);

    const categoryOrder = ["dresses", "one-piece", "dresses/one-piece", "tops", "bottoms", "outerwear", "accessories", "shoes"];
    const activeOutfit = outfits[currentOutfitIndex];
    const sortedItems = [...activeOutfit.items].sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category.toLowerCase());
      const indexB = categoryOrder.indexOf(b.category.toLowerCase());
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });

    const token = sessionStorage.getItem('stylematch_token');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/outfits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: activeOutfit.name,
          description: activeOutfit.description,
          occasion: activeOutfit.occasion,
          compatibility_score: activeOutfit.compatibility_score,
          item_ids: sortedItems.map(item => item.id)
        })
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      } else {
        alert('Failed to save outfit.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAnother = () => {
    if (outfits.length > 0) {
      setCurrentOutfitIndex((prevIndex) => (prevIndex + 1) % outfits.length);
      setIsSaved(false);
    }
  };

  const handleBackToSettings = () => {
    setResult(false);
    setOutfits([]);
    setCurrentOutfitIndex(0);
    setSelectedCloth(null);
  };

  const activeOutfit = outfits[currentOutfitIndex];

  const categoryOrder = ["dresses", "one-piece", "dresses/one-piece", "tops", "bottoms", "outerwear", "accessories", "shoes"];
  const sortedItems = activeOutfit ? [...activeOutfit.items].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.category.toLowerCase());
    const indexB = categoryOrder.indexOf(b.category.toLowerCase());
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  }) : [];

  return (
    <div className="relative w-full max-w-7xl mx-auto flex flex-col h-full min-h-[calc(100vh-5rem)] justify-center pb-8 px-2 sm:px-4">
      {/* Dynamic Ambient Lighting */}
      <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-28 w-[550px] h-[550px] bg-gradient-to-bl from-indigo-600/15 via-violet-600/8 to-transparent rounded-full blur-[160px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* =========================================================
            STATE 1: PREFERENCES & IN-UI WEATHER CONTROLS
           ========================================================= */}
        {!generating && !result && (
          <motion.div
            key="controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-8 relative z-10"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(138,43,226,0.2)] mb-4">
                <Compass className="w-3.5 h-3.5 animate-pulse" />
                <span>AI LOOKBOOK CURATION</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-medium text-white mb-3 tracking-tight">
                What should I wear today?
              </h1>
              <p className="text-white/60 text-sm md:text-base font-light">
                Configure your vibe and let Aria curate an effortless runway ensemble.
              </p>
            </div>

            <div className="w-full space-y-6 mb-8">
              {/* Occasion */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-white/50 mb-2.5">Occasion</label>
                <div className="flex flex-wrap gap-2">
                  {['Casual', 'College', 'Office', 'Formal', 'Party', 'Date', 'Gym', 'Travel'].map((occ) => (
                    <button 
                      key={occ} 
                      onClick={() => setSelectedOccasion(occ)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                        selectedOccasion === occ 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-400 text-white shadow-[0_0_20px_rgba(138,43,226,0.5)]' 
                          : 'bg-zinc-900/80 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-white/50 mb-2.5">Style Aesthetic</label>
                <div className="flex flex-wrap gap-2">
                  {['Minimal', 'Streetwear', 'Smart Casual', 'Vintage', 'Elegant'].map((style) => (
                    <button 
                      key={style} 
                      onClick={() => setSelectedStyle(style)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                        selectedStyle === style 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-400 text-white shadow-[0_0_20px_rgba(138,43,226,0.5)]' 
                          : 'bg-zinc-900/80 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-UI Weather Context (No Popups) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs uppercase tracking-wider font-semibold text-white/50">
                    Weather Context
                  </label>
                  <span className="text-[11px] text-violet-400/80 font-medium">
                    Auto-Synced with Live Climate
                  </span>
                </div>

                <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-xl transition-all space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <Sun className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                        <span className="font-medium text-lg text-white font-display">
                          {temperature}°C
                        </span>
                        <span className="text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                          {weatherCondition}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        <span>{humidity < 50 ? 'Low Humidity' : 'High Humidity'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-white/50 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-violet-400" />
                        <span>{cityName}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsEditingWeather(!isEditingWeather)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
                        isEditingWeather 
                          ? 'bg-violet-600 text-white border-violet-400 shadow-[0_0_12px_rgba(138,43,226,0.4)]' 
                          : 'bg-white/5 hover:bg-white/10 text-violet-300 border-white/10'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isEditingWeather ? 'Done' : 'Customize'}</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {isEditingWeather && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-white/10 space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <span className="text-[11px] text-white/60 font-medium block">
                            Adjust Temperature (°C)
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setTemperature(prev => Math.max(-10, prev - 1))}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-16 text-center font-display font-semibold text-lg text-white">
                              {temperature}°C
                            </span>

                            <button
                              onClick={() => setTemperature(prev => Math.min(50, prev + 1))}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1.5 ml-2 overflow-x-auto">
                              {[
                                { label: '❄️ 14°C Cold', val: 14 },
                                { label: '🌤️ 22°C Mild', val: 22 },
                                { label: '☀️ 28°C Warm', val: 28 },
                                { label: '🔥 35°C Hot', val: 35 }
                              ].map(preset => (
                                <button
                                  key={preset.val}
                                  onClick={() => setTemperature(preset.val)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                                    temperature === preset.val 
                                      ? 'bg-violet-500/25 border-violet-400 text-violet-200' 
                                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] text-white/60 font-medium block">
                            Climate Condition
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'Sunny ☀️', icon: Sun },
                              { label: 'Cloudy ⛅', icon: CloudSun },
                              { label: 'Rainy 🌧️', icon: CloudRain },
                              { label: 'Snowy ❄️', icon: Snowflake }
                            ].map(cond => (
                              <button
                                key={cond.label}
                                onClick={() => setWeatherCondition(cond.label.split(' ')[0])}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border flex items-center gap-1.5 ${
                                  weatherCondition.toLowerCase().includes(cond.label.split(' ')[0].toLowerCase())
                                    ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                                }`}
                              >
                                <span>{cond.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full sm:w-auto px-10 py-3.5 shadow-[0_0_30px_rgba(138,43,226,0.5)] bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 hover:brightness-110" onClick={handleGenerate} icon={<Wand2 className="w-5 h-5"/>}>
              ✨ Curate My Outfit
            </Button>
          </motion.div>
        )}

        {/* =========================================================
            STATE 2: AI CURATION STEPS / LOADING
           ========================================================= */}
        {generating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative min-h-[480px] z-10"
          >
            <motion.div 
              className="absolute w-80 h-80 bg-violet-primary/20 rounded-full blur-[110px] pointer-events-none"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-16 h-16 text-violet-primary mb-8 drop-shadow-[0_0_20px_rgba(138,43,226,0.7)]" />
              </motion.div>
              <div className="h-9 overflow-hidden relative w-full text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl md:text-2xl font-display text-white absolute inset-x-0"
                  >
                    {steps[stepIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="w-56 h-1.5 bg-white/10 rounded-full mt-8 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 1.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================
            STATE 3: FIXED FULL-IMAGE CARDS (NO EXTRA BLACK VOIDS)
           ========================================================= */}
        {result && activeOutfit && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-6 pt-2 pb-6 relative z-10"
          >
            {/* Header: Title & Back Navigation */}
            <div className="text-center flex flex-col items-center gap-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-tight">
                {activeOutfit.name}
              </h2>
              <button 
                onClick={handleBackToSettings}
                className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors mt-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Preferences</span>
              </button>
            </div>
            
            {/* Main Balanced Bento Grid */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {/* Left/Center: Full-Cover Clothing Cards (No Dead Black Space) */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 items-stretch">
                {sortedItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    onClick={() => setSelectedCloth(item)}
                    className="group relative rounded-3xl overflow-hidden border border-white/10 hover:border-violet-500/60 hover:shadow-[0_0_35px_rgba(138,43,226,0.35)] transition-all cursor-pointer bg-zinc-950 backdrop-blur-2xl flex flex-col h-full min-h-[380px] sm:min-h-[420px] justify-between"
                  >
                    {/* Full-Bleed Image Background */}
                    <div className="absolute inset-0 w-full h-full bg-zinc-900 overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105" 
                      />
                      {/* Gradient Shade for Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                    </div>

                    {/* Top Badges */}
                    <div className="relative z-10 p-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest shadow-md">
                        {item.category}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-violet-600/80 transition-all shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="relative z-10 p-4 space-y-0.5">
                      <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1 group-hover:text-violet-300 transition-colors drop-shadow-md">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-white/60 uppercase tracking-wider font-medium drop-shadow-sm">
                        {item.subcategory || item.category}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: Haute-Couture Intelligence Panel */}
              <motion.div variants={itemVariants} className="lg:col-span-4 w-full flex flex-col">
                <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-violet-950/25 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between space-y-6 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-primary/25 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-5">
                    {/* Score Header */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                        <span className="font-display font-medium text-2xl md:text-3xl text-white tracking-tight">
                          {activeOutfit.compatibility_score}% Style Match
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 uppercase font-semibold text-white/80">
                          {activeOutfit.occasion}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-semibold text-white/80">
                          {temperature}°C
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-violet-primary/25 border border-violet-primary/40 text-violet-300 font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(138,43,226,0.3)]">
                          <Sparkles className="w-3 h-3 fill-current" />
                          <span>AI Suggested</span>
                        </span>
                      </div>
                    </div>

                    {/* Narrative Description */}
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-white/60">
                        Why this works
                      </h3>
                      <p className="text-white/75 text-xs sm:text-sm leading-relaxed font-light">
                        {activeOutfit.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons: Save & Try Another */}
                  <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 relative overflow-visible">
                    
                    {/* Floating Hearts Particle Canvas */}
                    <AnimatePresence>
                      {floatingHearts.map((heart) => (
                        <motion.span
                          key={heart.id}
                          initial={{ opacity: 1, scale: 0.2, x: 0, y: 0 }}
                          animate={{
                            opacity: [1, 1, 0],
                            scale: [0.2, heart.scale, heart.scale * 1.2],
                            x: heart.x,
                            y: heart.y,
                            rotate: heart.rotate
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.3, ease: [0.23, 1, 0.32, 1] }}
                          className="pointer-events-none absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl z-50 select-none drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                        >
                          {heart.emoji}
                        </motion.span>
                      ))}
                    </AnimatePresence>

                    {/* Save Look Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={handleSaveOutfit}
                      disabled={isSaving}
                      className={`relative group overflow-hidden flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 shadow-xl ${
                        isSaved 
                          ? 'bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.4)]' 
                          : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white border border-white/20 shadow-[0_0_30px_rgba(138,43,226,0.5)] hover:shadow-[0_0_45px_rgba(217,70,239,0.7)]'
                      }`}
                    >
                      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : isSaved ? (
                        <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                      ) : (
                        <Heart className="w-4 h-4 text-white fill-white/20 group-hover:fill-white group-hover:scale-115 transition-all duration-300" />
                      )}
                      
                      <span className="relative z-10">
                        {isSaving ? 'Saving...' : isSaved ? 'Saved to Closet ✨' : 'Save Look'}
                      </span>
                    </motion.button>
                    
                    {/* Try Another Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={handleTryAnother}
                      className="group relative overflow-hidden flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-semibold tracking-wide bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-violet-400/50 text-white/90 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(138,43,226,0.25)] backdrop-blur-xl"
                    >
                      <RefreshCcw className="w-4 h-4 text-violet-300 group-hover:rotate-180 transition-transform duration-500 ease-out" />
                      <span>Try Another</span>
                    </motion.button>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          4. STUDIO-GRADE CLOTHING DETAIL MODAL (With Close 'X' Button)
         ========================================================= */}
      <AnimatePresence>
        {selectedCloth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCloth(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/98 to-black border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] z-10 overflow-hidden"
            >
              <div className="absolute -top-32 -right-32 w-72 h-72 bg-violet-600/30 rounded-full blur-[100px] pointer-events-none" />

              <button
                onClick={() => setSelectedCloth(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition z-20 shadow-md"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
                <div className="w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shrink-0 bg-zinc-900 relative shadow-2xl group">
                  <img
                    src={selectedCloth.image_url}
                    alt={selectedCloth.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white uppercase tracking-wider">
                    {selectedCloth.category}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-[10px] font-semibold text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      Digitized Wardrobe Piece
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 text-left w-full">
                  <div>
                    <h3 className="font-display font-medium text-xl md:text-2xl text-white tracking-tight leading-snug">
                      {selectedCloth.name}
                    </h3>
                    <p className="text-xs text-violet-300 font-semibold uppercase tracking-wider mt-1">
                      {selectedCloth.subcategory || selectedCloth.category}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 text-xs">
                    {selectedCloth.color && (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <Palette className="w-4 h-4 text-violet-400" /> Color Tone
                        </span>
                        <span className="font-semibold text-white">{selectedCloth.color}</span>
                      </div>
                    )}

                    {selectedCloth.brand && (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <Tag className="w-4 h-4 text-violet-400" /> Brand Heritage
                        </span>
                        <span className="font-semibold text-white">{selectedCloth.brand}</span>
                      </div>
                    )}

                    {selectedCloth.style_tag && (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-violet-400" /> Aesthetic Tag
                        </span>
                        <span className="font-semibold text-violet-300">{selectedCloth.style_tag}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <span className="text-white/50 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Availability
                      </span>
                      <span className="font-semibold text-emerald-300">Ready in Closet</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCloth(null)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold transition shadow-[0_0_20px_rgba(138,43,226,0.4)] mt-2"
                  >
                    Back to Outfit
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