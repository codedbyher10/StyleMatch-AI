// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion, Variants } from 'motion/react';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Moon, 
  Layers, 
  Wand2, 
  MessageSquare, 
  Plus, 
  Plane, 
  Sparkles, 
  Loader2,
  ArrowUpRight,
  Sparkle,
  Flame,
  Shirt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLiveWeather, getDynamicGreeting, WeatherData } from '../lib/weather';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

const quickActions = [
  { 
    icon: <Plus className="w-4 h-4" />, 
    label: 'Add Clothing', 
    desc: 'Digitize your closet', 
    path: '/app/wardrobe/add',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    border: 'hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]'
  },
  { 
    icon: <Wand2 className="w-4 h-4" />, 
    label: 'Generate Outfit', 
    desc: 'AI curated looks', 
    path: '/app/outfits/generate',
    gradient: 'from-violet-500/15 via-violet-500/5 to-transparent',
    border: 'hover:border-violet-500/40',
    iconBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(138,43,226,0.15)]'
  },
  { 
    icon: <MessageSquare className="w-4 h-4" />, 
    label: 'AI Stylist', 
    desc: 'Chat with Aria', 
    path: '/app/stylist',
    gradient: 'from-fuchsia-500/15 via-fuchsia-500/5 to-transparent',
    border: 'hover:border-fuchsia-500/40',
    iconBg: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(217,70,239,0.15)]'
  },
  { 
    icon: <Layers className="w-4 h-4" />, 
    label: 'My Wardrobe', 
    desc: 'Browse inventory', 
    path: '/app/wardrobe',
    gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    border: 'hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]'
  },
  { 
    icon: <Plane className="w-4 h-4" />, 
    label: 'Pack for Travel', 
    desc: 'Vacation capsules', 
    path: '/app/travel',
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    border: 'hover:border-amber-500/40',
    iconBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]'
  },
];

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
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function renderWeatherIcon(weatherCode?: number, isDay = true) {
  if (weatherCode === undefined || weatherCode === 0) {
    return isDay ? (
      <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
    ) : (
      <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
    );
  }
  if (weatherCode >= 1 && weatherCode <= 3) return <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />;
  if (weatherCode >= 45 && weatherCode <= 48) return <CloudFog className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />;
  if (weatherCode >= 51 && weatherCode <= 67) return <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />;
  if (weatherCode >= 71 && weatherCode <= 77) return <CloudSnow className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />;
  if (weatherCode >= 95) return <CloudLightning className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />;
  return <CloudSun className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />;
}

export default function DashboardPage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Greeting & Weather States
  const [greeting, setGreeting] = useState('Good morning.');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  // Custom user name state extracted from profile cache
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    setGreeting(getDynamicGreeting());

    fetchLiveWeather().then((data) => {
      setWeather(data);
    });

    // Retrieve name from Style Profile cache to personalize your greetings
    const savedProfile = localStorage.getItem('stylematch_user_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        if (parsedProfile.name && parsedProfile.name !== 'Guest User') {
          // Extract first name (e.g., "Sreyashi" from "Sreyashi Choudhury")
          const namePart = parsedProfile.name.trim().split(/\s+/)[0];
          setFirstName(namePart);
        }
      } catch (e) {
        console.error("Failed to parse local profile details", e);
      }
    }

    const fetchHighlights = async () => {
      const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('http://127.0.0.1:8000/api/wardrobe', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to load wardrobe highlights", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  // Remove the trailing period from the greeting string dynamically to ensure clean punctuation
  const cleanGreeting = greeting.replace(/\.$/, '');

  return (
    <div className="relative w-full max-w-6xl mx-auto space-y-7 md:space-y-9 pb-16 px-2 sm:px-4">
      {/* Ambient Background Illumination */}
      <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[480px] h-[480px] bg-gradient-to-bl from-indigo-600/15 via-violet-600/8 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        className="w-full relative z-10 space-y-7 md:space-y-9"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* HEADER: Personal Greeting & Live Atmospheric Capsule */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.07]"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
              <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-violet-300/90">
                AI Personal Stylist OS
              </span>
            </div>
            {/* Renders properly without punctuation conflicts */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-none">
              {firstName ? `${cleanGreeting}, ${firstName}.` : greeting}
            </h1>
            <p className="text-xs sm:text-sm text-white/55 font-light flex items-center gap-1.5 pt-0.5">
              <span>What are we curating for you today?</span>
              <Sparkle className="w-3 h-3 text-violet-400/80 inline animate-pulse" />
            </p>
          </div>
          
          {/* Glowing Weather Capsule */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-3.5 bg-zinc-950/70 border border-white/10 hover:border-violet-500/40 p-2.5 sm:p-3 rounded-2xl backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all self-start sm:self-auto shrink-0 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-950 via-violet-900/60 to-zinc-900 border border-violet-500/30 flex items-center justify-center text-violet-300 shadow-[0_0_15px_rgba(138,43,226,0.3)]">
              {renderWeatherIcon(weather?.weatherCode, weather?.isDay)}
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-semibold text-white tracking-tight leading-tight font-display">
                {weather ? `${weather.temperature}°C` : '28°C'}
              </div>
              <div className="text-[11px] text-white/60 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                <span>
                  {weather
                    ? `${weather.condition} · ${weather.humidity < 50 ? 'Low Humidity' : 'High Humidity'}`
                    : 'Sunny · Low Humidity'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* HERO SPOTLIGHT: Today's AI Match */}
        <motion.div variants={itemVariants}>
          <div className="rounded-3xl p-6 sm:p-8 md:p-9 border border-violet-500/25 bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-violet-950/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] relative overflow-hidden group hover:border-violet-500/45 transition-all duration-500">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-bl from-violet-600/30 via-fuchsia-600/15 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex flex-col lg:flex-row gap-7 md:gap-9 items-start lg:items-center justify-between relative z-10">
              <div className="flex-1 w-full text-left space-y-3.5 sm:space-y-4">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 via-violet-500/10 to-fuchsia-500/15 border border-violet-500/40 text-violet-300 text-[11px] font-semibold tracking-wide shadow-[0_0_15px_rgba(138,43,226,0.2)]">
                  <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>TODAY'S AI MATCH · 98% MATCH</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-white tracking-tight leading-[1.15]">
                  Monochrome Autumn Flatlay Look
                </h2>

                <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-light">
                  Tailored black blazer paired with crisp cotton crewneck, tapered trousers, and sleek leather boots. Perfect for your{' '}
                  <span className="text-violet-200 font-medium bg-violet-500/15 px-2 py-0.5 rounded-md border border-violet-400/30">
                    {weather ? `${weather.temperature}°C ${weather.condition.toLowerCase()}` : '28°C sunny'}
                  </span>{' '}
                  {greeting.toLowerCase().includes('afternoon') ? 'afternoon' : greeting.toLowerCase().includes('evening') ? 'evening' : 'day'}.
                </p>

                <div className="pt-1.5 flex items-center gap-3">
                  <Link to="/app/stylist" className="inline-block w-full sm:w-auto">
                    <button className="w-full sm:w-auto h-11 sm:h-12 px-6 rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 hover:brightness-110 text-white font-medium text-xs sm:text-sm transition shadow-[0_0_25px_rgba(138,43,226,0.45)] flex items-center justify-center gap-2 group/btn">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span>Ask AI Stylist</span>
                      <ArrowUpRight className="w-4 h-4 opacity-75 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="w-full lg:w-72 h-48 sm:h-52 rounded-2xl overflow-hidden relative border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.65)] shrink-0 group/img">
                <img 
                  src="/src/assets/images/curated_outfit_board_1786447675731.jpg" 
                  alt="Today's Look" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-700 brightness-95 group-hover/img:brightness-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-3 text-xs text-white font-medium bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 shadow-lg flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-violet-300" />
                  <span>4 Pieces Combined</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CUSTOM OUTFIT GENERATOR */}
        <motion.div variants={itemVariants}>
          <Link to="/app/outfits/generate">
            <motion.div 
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-7 md:p-8 group cursor-pointer border border-violet-500/40 shadow-[0_0_35px_-8px_rgba(138,43,226,0.35)] hover:shadow-[0_0_55px_-5px_rgba(138,43,226,0.6)] transition-all duration-500 bg-gradient-to-r from-violet-950 via-violet-700 to-indigo-900"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
                    <span>Custom Outfit Generator</span>
                  </h3>
                  <p className="text-white/85 text-xs sm:text-sm font-light max-w-xl">
                    Pick your vibe, weather, or event and let Gemini curate a head-turning look.
                  </p>
                </div>
                
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/25 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0">
                  <Wand2 className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div variants={itemVariants} className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-medium text-white/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Quick Actions</span>
            </h3>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5"
            variants={containerVariants}
          >
            {quickActions.map((action) => (
              <motion.div
                key={action.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <Link to={action.path} className="block h-full">
                  <div className={`glass-panel h-full p-4 rounded-2xl border border-white/10 bg-gradient-to-b ${action.gradient} hover:bg-zinc-900/90 transition-all group flex flex-col justify-between gap-3.5 shadow-md backdrop-blur-xl ${action.border} ${action.glow}`}>
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-all shadow-sm ${action.iconBg}`}>
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-white group-hover:text-white transition flex items-center justify-between">
                        <span>{action.label}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white/60" />
                      </div>
                      <div className="text-[11px] text-white/50 leading-snug mt-0.5">
                        {action.desc}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* WARDROBE HIGHLIGHTS */}
        <motion.div variants={itemVariants} className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-medium text-white/90">Your Wardrobe Highlights</h3>
              <p className="text-[11px] text-white/50">Recent staples in your digital closet</p>
            </div>
            <Link 
              to="/app/wardrobe" 
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium flex items-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-full border border-violet-500/25 group"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12 gap-3 min-h-[170px] glass-panel rounded-2xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Syncing closet...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[...Array(4)].map((_, i) => (
                <Link to="/app/wardrobe/add" key={i} className="block">
                  <div className="glass-panel h-48 rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 flex flex-col items-center justify-center gap-2.5 group transition-all duration-300 cursor-pointer bg-zinc-950/40">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-violet-300 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300 shadow-md">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-white/40 group-hover:text-white transition duration-300 font-medium">Add Item</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 md:gap-5">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-violet-500/60 hover:shadow-[0_0_30px_rgba(138,43,226,0.3)] transition-all transform-gpu duration-300 cursor-pointer bg-zinc-950/70"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-zinc-900 relative">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] text-white/80 uppercase tracking-wider font-semibold">
                      {item.category}
                    </div>
                  </div>
                  
                  <div className="p-3 relative bg-zinc-950/80 backdrop-blur-md border-t border-white/5">
                    <h3 className="font-medium text-xs sm:text-sm text-white truncate group-hover:text-violet-300 transition-colors">
                      {item.name}
                    </h3>
                    <div className="text-[10px] text-white/40 mt-0.5 flex items-center justify-between">
                      <span>Digitized Piece</span>
                      <Sparkle className="w-2.5 h-2.5 text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}