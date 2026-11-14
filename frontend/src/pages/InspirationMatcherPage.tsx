// frontend/src/pages/InspirationMatcherPage.tsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Loader2, 
  Check, 
  Sparkle, 
  Flame, 
  X, 
  Palette, 
  Maximize2, 
  Layers, 
  RefreshCw,
  ArrowUpRight,
  Zap
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
}

interface PaletteColor {
  name: string;
  hex: string;
  percentage: number;
}

type SlotKey = 'dresses' | 'tops' | 'bottoms' | 'outerwear' | 'shoes';

interface InspoMatchResponse {
  inspo_vibe: string;
  similarity_score: number;
  match_breakdown?: {
    vibe_match: number;
    color_match: number;
    silhouette_match: number;
  };
  detected_tags: string[];
  extracted_palette: PaletteColor[];
  styling_breakdown: string;
  missing_element_tip?: string;
  matched_items: ClothingItem[];
  alternatives?: Partial<Record<SlotKey, ClothingItem[]>>;
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  emoji: string;
}

const getItemSlot = (item: ClothingItem): SlotKey => {
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (
    cat.includes('dress') ||
    cat.includes('one-piece') ||
    cat.includes('onepiece') ||
    ['dress', 'gown', 'onepiece', 'one-piece', 'jumpsuit', 'sundress', 'romper', 'strapless'].some((kw) =>
      name.includes(kw)
    )
  ) {
    return 'dresses';
  }
  if (cat.includes('outerwear') || cat.includes('jacket') || cat.includes('coat') || cat.includes('blazer')) {
    return 'outerwear';
  }
  if (
    cat.includes('bottom') ||
    cat.includes('jean') ||
    cat.includes('pant') ||
    cat.includes('skirt') ||
    cat.includes('trouser') ||
    cat.includes('legging')
  ) {
    return 'bottoms';
  }
  if (
    cat.includes('shoe') ||
    cat.includes('footwear') ||
    cat.includes('sandal') ||
    cat.includes('sneaker') ||
    cat.includes('boot') ||
    cat.includes('heel')
  ) {
    return 'shoes';
  }
  return 'tops';
};

// Curated Haute-Couture Outfit Flat Lays & Styled Garment Moodboards (No Human Portraits)
const TRENDING_MOODBOARDS = [
  { 
    title: 'Minimalist Grey Knit', 
    subtitle: 'Heather Grey Knit · Indigo Denim · Leather Boots',
    vibe: 'Casual Core',
    badge: 'CASUAL CORE',
    palette: ['#6B7280', '#1E3A8A', '#F4F4F5'],
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    title: 'Clean Linen Button-Down', 
    subtitle: 'Crisp Summer Linen · Cotton Chino · Minimal Shades',
    vibe: 'Editorial Clean',
    badge: 'EDITORIAL CLEAN',
    palette: ['#E2E8F0', '#2563EB', '#18181B'],
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    title: '90s Relaxed Streetwear', 
    subtitle: 'Heavyweight Graphic Layer · Vintage Relaxed Bottoms',
    vibe: 'Street Avant-Garde',
    badge: 'STREETWEAR',
    palette: ['#18181B', '#4D7C0F', '#EA580C'],
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    title: 'Old Money Tailored', 
    subtitle: 'Textured Camel Blazer · Italian Loafers · Silk Accent',
    vibe: 'Quiet Luxury',
    badge: 'QUIET LUXURY',
    palette: ['#78350F', '#FEF3C7', '#18181B'],
    url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop' 
  }
];

export default function InspirationMatcherPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [matchResult, setMatchResult] = useState<InspoMatchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPresetTitle, setLoadingPresetTitle] = useState<string | null>(null);
  
  // Interactive Modal & Swapper States
  const [inspectCloth, setInspectCloth] = useState<ClothingItem | null>(null);
  const [swappingSlot, setSwappingSlot] = useState<SlotKey | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<HeartParticle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const scanSteps = [
    "Deconstructing visual cuts & silhouette proportions...",
    "Extracting photo color frequencies & tonal DNA...",
    "Scoring real pieces from your wardrobe database...",
    "Synthesizing Aria's re-creation blueprint..."
  ];

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMatchResult(null);
    setSwappingSlot(null);
    setErrorMsg(null);
  };

  const handlePresetSelect = async (board: typeof TRENDING_MOODBOARDS[0]) => {
    setLoadingPresetTitle(board.title);
    try {
      const res = await fetch(board.url);
      const blob = await res.blob();
      const file = new File([blob], 'preset.jpg', { type: 'image/jpeg' });
      handleFileSelect(file);

      setTimeout(() => {
        uploadSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 80);
    } catch (err) {
      console.error('Failed to load preset outfit', err);
    } finally {
      setLoadingPresetTitle(null);
    }
  };

  const handleMatchInspiration = async () => {
    if (!selectedFile) return;

    setScanning(true);
    setErrorMsg(null);
    setSwappingSlot(null);
    setScanStep(0);

    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');

    const interval = setInterval(() => {
      setScanStep((prev) => (prev + 1) % scanSteps.length);
    }, 450);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/outfits/match-inspiration', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Vision matching failed.');
      }

      const data: InspoMatchResponse = await res.json();
      setMatchResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Vision scan failed.');
    } finally {
      clearInterval(interval);
      setScanning(false);
    }
  };

  const handleSwapItem = (newItem: ClothingItem, categorySlot: SlotKey) => {
    if (!matchResult) return;

    let oldItemToRestore: ClothingItem | null = null;
    const updated = matchResult.matched_items.map((it) => {
      if (getItemSlot(it) === categorySlot) {
        oldItemToRestore = it;
        return newItem;
      }
      return it;
    });

    const currentAlts = matchResult.alternatives?.[categorySlot] ?? [];
    const updatedAlts = [
      ...currentAlts.filter((alt) => alt.id !== newItem.id),
      ...(oldItemToRestore ? [oldItemToRestore] : [])
    ];

    setMatchResult({
      ...matchResult,
      matched_items: updated,
      alternatives: {
        ...matchResult.alternatives,
        [categorySlot]: updatedAlts
      }
    });
    setSwappingSlot(null);
  };

  const handleSaveRecreatedLook = async () => {
    if (!matchResult) return;

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
    const token = sessionStorage.getItem('stylematch_token') || localStorage.getItem('stylematch_token');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/outfits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Recreated: ${matchResult.inspo_vibe}`,
          description: matchResult.styling_breakdown,
          occasion: 'Inspiration Recreated',
          compatibility_score: matchResult.similarity_score,
          item_ids: matchResult.matched_items.map(it => it.id)
        })
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-8 md:space-y-10 pb-16 px-2 sm:px-4 overflow-hidden">
      {/* Ambient Runway Lighting Orbs */}
      <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/15 via-fuchsia-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-600/15 via-violet-600/8 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* =========================================================
          1. EDITORIAL HEADER BAR
         ========================================================= */}
      <div className="text-center space-y-2 pt-2 relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide shadow-[0_0_15px_rgba(138,43,226,0.2)] mb-2">
          <Camera className="w-3.5 h-3.5 animate-pulse text-violet-300" />
          <span>PINT-TO-OUTFIT VISION MATCHER</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-white tracking-tight">
          Inspiration Matcher
        </h1>
        <p className="text-xs sm:text-sm text-white/60 font-light">
          Upload any screenshot from Pinterest, Instagram, or TikTok. Vision AI recreates the look using pieces in your real closet.
        </p>
      </div>

      {/* =========================================================
          2. UPLOAD & SCAN DROPZONE (STATE A)
         ========================================================= */}
      {!matchResult && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10 space-y-8"
        >
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Interactive Luxury Dropzone Card with Ref for Auto-Scroll */}
          <div
            ref={uploadSectionRef}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-3xl p-8 sm:p-12 border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden backdrop-blur-2xl flex flex-col items-center justify-center gap-5 scroll-mt-24 ${
              previewUrl 
                ? 'border-violet-500/60 bg-zinc-950/90 shadow-[0_0_50px_rgba(138,43,226,0.35)]' 
                : 'border-white/15 bg-zinc-950/70 hover:border-violet-500/40 hover:bg-violet-950/15 shadow-2xl'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-52 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-violet-400/50 shadow-2xl group animate-in fade-in zoom-in-95 duration-300">
                <img src={previewUrl} alt="Inspo Preview" className="w-full h-full object-cover" />
                
                {/* Holographic Laser Grid Scanner */}
                {scanning && (
                  <div className="absolute inset-0 bg-violet-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#22d3ee]"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
                  <span className="text-[10px] text-white font-semibold uppercase bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                    Selected Image
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-950 via-violet-800 to-fuchsia-600 border-2 border-violet-400/40 flex items-center justify-center text-white shadow-[0_0_30px_rgba(138,43,226,0.5)]">
                  <Upload className="w-9 h-9 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-medium text-xl sm:text-2xl text-white">
                    Upload Inspiration Screenshot
                  </h3>
                  <p className="text-xs text-white/50">Drag and drop or click to upload from Pinterest, Instagram, or TikTok</p>
                </div>
              </>
            )}

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold border border-white/15 transition shadow-md"
            >
              {previewUrl ? 'Change Screenshot' : 'Browse Files'}
            </button>
          </div>

          {/* Primary Action Button */}
          {previewUrl && (
            <button
              onClick={handleMatchInspiration}
              disabled={scanning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-115 text-white font-semibold text-sm transition shadow-[0_0_35px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{scanSteps[scanStep]}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recreate Look from My Wardrobe ✨</span>
                </>
              )}
            </button>
          )}

          {/* =========================================================
              HIGH-FASHION EDITORIAL RUNWAY MOODBOARDS
             ========================================================= */}
          <div className="space-y-5 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-indigo-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(138,43,226,0.2)]">
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                  <span>EDITORIAL RUNWAY VAULT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-white tracking-tight">
                  Trending Runway Moodboards
                </h2>
                <p className="text-xs text-white/50 font-light">
                  Haute-couture flat-lay ensembles. Tap any look to recreate it using pieces from your closet.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-violet-300 font-semibold bg-violet-950/50 border border-violet-500/40 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(138,43,226,0.2)] shrink-0 self-start sm:self-auto">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>1-Click AI Test</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TRENDING_MOODBOARDS.map((board, index) => {
                const isLoadingThis = loadingPresetTitle === board.title;

                return (
                  <motion.div
                    key={board.title}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    onClick={() => handlePresetSelect(board)}
                    className="group relative rounded-3xl p-3.5 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border border-white/10 hover:border-violet-400/60 shadow-xl hover:shadow-[0_0_40px_rgba(138,43,226,0.35)] cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-zinc-900 relative shadow-inner">
                      <img 
                        src={board.url} 
                        alt={board.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 group-hover:from-black/95 transition-all duration-300" />
                      
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                        <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[9px] font-bold text-white uppercase tracking-wider shadow-lg">
                          {board.badge}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-[10px] font-semibold text-white/70 font-mono">
                          0{index + 1}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/15 shadow-lg group-hover:opacity-0 transition-opacity duration-200">
                        <Palette className="w-3 h-3 text-violet-300 mr-0.5" />
                        {board.palette.map((c, i) => (
                          <span 
                            key={i} 
                            className="w-3 h-3 rounded-full border border-white/30 shadow-sm" 
                            style={{ backgroundColor: c }} 
                          />
                        ))}
                      </div>

                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-3 transition-all duration-300 z-10">
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_25px_rgba(138,43,226,0.8)] border border-violet-300/40 cursor-pointer"
                        >
                          {isLoadingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Loading Look...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
                              <span>Recreate Look</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3.5 pb-1 px-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-display font-medium text-white group-hover:text-violet-300 transition-colors truncate">
                          {board.title}
                        </h4>
                        <span className="text-[9px] uppercase font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/25 shrink-0">
                          {board.vibe}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate font-light">
                        {board.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* =========================================================
          3. SIDE-BY-SIDE RECREATED MATCH CANVAS (STATE B)
         ========================================================= */}
      {matchResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full relative z-10 space-y-6"
        >
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMatchResult(null)}
              className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-violet-500/40 hover:border-violet-400 text-xs text-white font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(138,43,226,0.25)] transition-all self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-violet-300" />
              <span>Match Another Screenshot 📸</span>
            </motion.button>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/90 border border-emerald-500/40 text-xs font-semibold text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>{matchResult.similarity_score}% Aesthetic Match</span>
              </div>
              {matchResult.match_breakdown && (
                <>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                    Silhouette: {matchResult.match_breakdown.silhouette_match}%
                  </span>
                  <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                    Color DNA: {matchResult.match_breakdown.color_match}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Bento Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Original Reference Photo */}
            <div className="lg:col-span-5 rounded-3xl p-6 border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-wider font-bold text-white/50">
                  Original Reference Photo
                </span>
                <span className="text-[10px] text-violet-300 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20">
                  Pinterest / IG Inspo
                </span>
              </div>

              <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 relative shadow-2xl">
                {previewUrl && <img src={previewUrl} alt="Inspo" className="w-full h-full object-cover" />}
              </div>

              {/* Detected Style Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchResult.detected_tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/5 border border-white/10 text-white/80">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Extracted Color Palette */}
              {matchResult.extracted_palette && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-violet-300" />
                    <span>Extracted Photo Palette DNA</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {matchResult.extracted_palette.map((swatch, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: swatch.hex }} />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-semibold text-white block truncate">{swatch.name}</span>
                          <span className="text-[9px] text-white/40">{swatch.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Recreated Closet Outfit */}
            <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 border border-violet-500/30 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-violet-950/30 backdrop-blur-2xl shadow-2xl space-y-6">
              
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-violet-300 font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recreated Closet Ensemble</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-medium text-white tracking-tight">
                  {matchResult.inspo_vibe}
                </h2>
              </div>

              {/* Matched Garments Grid with Dynamic Slot Swapping */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-white/50 tracking-wider block">
                    Matched Pieces from your Wardrobe:
                  </span>
                  <span className="text-[10px] text-violet-300">Click 🔄 to swap piece</span>
                </div>

                <div className={`grid grid-cols-1 ${matchResult.matched_items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                  {matchResult.matched_items.map((item, itemIdx) => {
                    const catSlot = getItemSlot(item);
                    const slotAlts = matchResult.alternatives?.[catSlot] ?? [];
                    const hasAlts = slotAlts.length > 0;

                    return (
                      <motion.div
                        key={item.id || itemIdx}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="p-3 rounded-2xl bg-black/60 border border-white/10 hover:border-violet-400/60 transition-all flex flex-col justify-between group shadow-lg relative"
                      >
                        <div 
                          onClick={() => setInspectCloth(item)}
                          className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 mb-2 relative cursor-pointer"
                        >
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-[8px] font-bold text-white uppercase backdrop-blur-md border border-white/10">
                            {item.category}
                          </span>
                          <div className="absolute inset-0 bg-violet-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">{item.name}</h4>
                          <p className="text-[10px] text-white/50 truncate">{item.subcategory || item.style_tag || item.category}</p>
                        </div>

                        {hasAlts && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwappingSlot(swappingSlot === catSlot ? null : catSlot);
                            }}
                            className="mt-2 w-full py-1 rounded-lg bg-white/5 hover:bg-violet-600/30 border border-white/10 hover:border-violet-400/40 text-[10px] text-violet-200 font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3 text-violet-300" />
                            <span>Swap Alternative</span>
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Alternative Swapper Drawer */}
                <AnimatePresence>
                  {swappingSlot && matchResult.alternatives?.[swappingSlot] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-zinc-950 border border-violet-500/30 space-y-2 mt-2"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-white/10">
                        <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider">
                          Select Alternative {swappingSlot.toUpperCase()}:
                        </span>
                        <button onClick={() => setSwappingSlot(null)} className="text-white/50 hover:text-white cursor-pointer">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {matchResult.alternatives[swappingSlot]!.map((alt) => (
                          <div
                            key={alt.id}
                            onClick={() => handleSwapItem(alt, swappingSlot)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-400 cursor-pointer transition text-center"
                          >
                            <img src={alt.image_url} alt={alt.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                            <span className="text-[10px] font-medium text-white block truncate">{alt.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Aria's Adaptation Strategy */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <h4 className="text-xs uppercase font-bold tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Sparkle className="w-3 h-3 fill-current" />
                  <span>Aria's Re-creation Blueprint</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-light">
                  {matchResult.styling_breakdown}
                </p>
              </div>

              {/* 1:1 Match Tip */}
              {matchResult.missing_element_tip && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center gap-2">
                  <span className="text-base shrink-0">💡</span>
                  <span><strong>1:1 Match Tip:</strong> {matchResult.missing_element_tip}</span>
                </div>
              )}

              {/* Save Look Button with Particle Heart Burst */}
              <div className="pt-2 relative overflow-visible">
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
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl z-50 select-none drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]"
                    >
                      {heart.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>

                <button
                  onClick={handleSaveRecreatedLook}
                  disabled={isSaving}
                  className={`w-full py-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xl cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                      : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 text-white shadow-[0_0_25px_rgba(138,43,226,0.5)]'
                  }`}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                  <span>{isSaved ? 'Saved to Looks! ✨' : 'Save Recreated Look ✨'}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* CLOTH INSPECTION MODAL */}
      <AnimatePresence>
        {inspectCloth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectCloth(null)}
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
                onClick={() => setInspectCloth(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                <div className="w-40 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shrink-0 bg-zinc-900 relative shadow-xl">
                  <img src={inspectCloth.image_url} alt={inspectCloth.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white uppercase">
                    {inspectCloth.category}
                  </div>
                </div>

                <div className="flex-1 space-y-3.5 text-left w-full">
                  <div>
                    <h3 className="font-display font-medium text-xl text-white leading-snug">
                      {inspectCloth.name}
                    </h3>
                    <p className="text-xs text-violet-400 font-semibold uppercase mt-0.5">
                      {inspectCloth.subcategory || inspectCloth.category}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    {inspectCloth.color && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-violet-300" /> Color Tone
                        </span>
                        <span className="font-semibold text-white">{inspectCloth.color}</span>
                      </div>
                    )}
                    {inspectCloth.style_tag && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-violet-300" /> Style Code
                        </span>
                        <span className="font-semibold text-violet-300">{inspectCloth.style_tag}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectCloth(null)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold shadow-lg cursor-pointer"
                  >
                    Back to Match
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