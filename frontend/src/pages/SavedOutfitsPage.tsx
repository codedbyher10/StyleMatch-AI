// frontend/src/pages/SavedOutfitsPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react'; 
import { Heart, X, Sparkles, Loader2, MessageCircle, ChevronLeft, ChevronRight, Bookmark, Calendar, Check, Shirt } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

interface SavedOutfit {
  id: string; // The database Outfit ID
  name: string;
  description: string;
  occasion: string;
  compatibility_score: number;
  items: ClothingItem[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 22 } }
};

export default function SavedOutfitsPage() {
  // Live database states
  const [savedLooks, setSavedLooks] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel slider indices map (Key: outfitId -> Value: current active image index)
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  
  // Double-tap heart splash indicator map
  const [doubleTapHearts, setDoubleTapHearts] = useState<Record<string, boolean>>({});

  // Individual post "Wear This" success state trackers
  const [wornOutfits, setWornOutfits] = useState<Record<string, boolean>>({});

  const fetchSavedLooks = async () => {
    const token = sessionStorage.getItem('stylematch_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/outfits/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedLooks(data);
      }
    } catch (e) {
      console.error("Failed to load saved outfits", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedLooks();
  }, []);

  // Next/Prev photo inside specific outfit carousels
  const handleNextSlide = (lookId: string, itemsLength: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndices(prev => ({
      ...prev,
      [lookId]: ((prev[lookId] || 0) + 1) % itemsLength
    }));
  };

  const handlePrevSlide = (lookId: string, itemsLength: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndices(prev => ({
      ...prev,
      [lookId]: ((prev[lookId] || 0) - 1 + itemsLength) % itemsLength
    }));
  };

  // Click on a specific garment row to jump the slider directly to that item
  const handleJumpToSlide = (lookId: string, itemIdx: number) => {
    setCarouselIndices(prev => ({
      ...prev,
      [lookId]: itemIdx
    }));
  };

  // Double-tap image to trigger like animation
  const handleDoubleTap = (lookId: string) => {
    setDoubleTapHearts(prev => ({ ...prev, [lookId]: true }));
    setTimeout(() => {
      setDoubleTapHearts(prev => ({ ...prev, [lookId]: false }));
    }, 1000);
  };

  // Log outfit as worn (increments wear count on backend)
  const handleWearOutfit = async (look: SavedOutfit, e: React.MouseEvent) => {
    e.stopPropagation();
    setWornOutfits(prev => ({ ...prev, [look.id]: true }));

    const token = sessionStorage.getItem('stylematch_token');
    look.items.forEach(async (item) => {
      try {
        await fetch(`http://127.0.0.1:8000/api/wardrobe/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ wears_count: 1 })
        });
      } catch (e) {
        console.error(e);
      }
    });

    setTimeout(() => {
      setWornOutfits(prev => ({ ...prev, [look.id]: false }));
    }, 2500);
  };

  // Calls the DELETE endpoint on your backend to unsave/unlike the outfit
  const handleUnsaveLook = async (lookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmUnsave = window.confirm("Do you want to remove this outfit from your Saved Looks?");
    if (!confirmUnsave) return;

    const token = sessionStorage.getItem('stylematch_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/outfits/saved/${lookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSavedLooks(prev => prev.filter(look => look.id !== lookId));
      } else {
        alert("Failed to unsave look.");
      }
    } catch (err) {
      console.error("Failed to unsave look", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-violet-primary animate-spin" />
        <p className="text-white/40 text-sm uppercase tracking-wider">Loading your saved outfits...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-medium text-white/90 mb-2">Saved Looks</h1>
        <p className="text-white/60">{savedLooks.length} curated outfit combinations</p>
      </div>

      {savedLooks.length === 0 ? (
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center text-white/40">
          <Heart className="w-12 h-12 opacity-30 mb-4" />
          <p className="text-lg font-medium text-white/80">No saved outfits yet.</p>
          <p className="text-sm mt-1 mb-6">Generate and save your first personalized outfit coordinates.</p>
          <Link to="/app/outfits/generate">
            <Button size="sm">Style an Outfit</Button>
          </Link>
        </div>
      ) : (
        /* INSTAGRAM DESKTOP SPLIT-CARD FEEDS */
        <motion.div 
          className="max-w-4xl mx-auto space-y-12 w-full pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {savedLooks.map((look) => {
            // Sort items vertically prior to rendering (Tops/Dresses -> Bottoms -> Outerwear -> Accessories -> Shoes)
            const categoryOrder = ["dresses", "one-piece", "dresses/one-piece", "tops", "bottoms", "outerwear", "accessories", "shoes"];
            const sortedItems = [...look.items].sort((a, b) => {
              const indexA = categoryOrder.indexOf(a.category.toLowerCase());
              const indexB = categoryOrder.indexOf(b.category.toLowerCase());
              return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
            });

            const activeSlideIndex = carouselIndices[look.id] || 0;
            const currentItem = sortedItems[activeSlideIndex] || sortedItems[0];
            const isHeartAnimating = doubleTapHearts[look.id] || false;
            const isOutfitWorn = wornOutfits[look.id] || false;

            return (
              <motion.div
                key={look.id}
                variants={itemVariants}
                className="bg-[#0b0713]/85 border border-white/5 rounded-3xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row w-full max-h-[600px] md:max-h-[500px]"
              >
                {/* LEFT COLUMN: SWIPEABLE CAROUSEL */}
                <div 
                  className="w-full md:w-1/2 aspect-square relative bg-charcoal overflow-hidden select-none shrink-0"
                  onDoubleClick={() => handleDoubleTap(look.id)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={activeSlideIndex}
                      src={currentItem.image_url} 
                      alt={currentItem.name} 
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Active Item Name Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 z-10 pointer-events-none">
                    <p className="text-xs font-semibold text-white/90 truncate leading-snug">{currentItem.name}</p>
                    <p className="text-[10px] text-violet-light font-bold uppercase tracking-widest mt-0.5">{currentItem.category}</p>
                  </div>

                  {/* Left/Right Carousel Sliders */}
                  {sortedItems.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => handlePrevSlide(look.id, sortedItems.length, e)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleNextSlide(look.id, sortedItems.length, e)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Double-Tap Heart Pop Splash Animation */}
                  <AnimatePresence>
                    {isHeartAnimating && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                        exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.3 } }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                      >
                        <Heart className="w-20 h-24 text-red-500 fill-current drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* RIGHT COLUMN: INFORMATION & INTERACTION PANEL */}
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 bg-black/40 overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shrink-0">
                        AI
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white/90 truncate">Aria AI Stylist</div>
                        <div className="text-[10px] text-white/40 truncate mt-0.5">StyleMatch AI Studio · Location</div>
                      </div>
                    </div>
                    
                    {/* Unsave Bookmark Button */}
                    <button 
                      onClick={(e) => handleUnsaveLook(look.id, e)}
                      className="p-2 rounded-full hover:bg-white/5 text-violet-light hover:text-red-400 transition-colors shrink-0"
                      title="Unsave Outfit"
                    >
                      <Bookmark className="w-4.5 h-4.5 fill-current" />
                    </button>
                  </div>

                  {/* Scrollable Center: Caption, Hashtags, and Clickable Composed List */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 hide-scrollbar">
                    
                    {/* Outfit Title & Compatibility */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-violet-primary shrink-0" />
                        <span className="text-violet-light font-bold text-xs">{look.compatibility_score}% Style Match</span>
                      </div>
                      <h4 className="text-lg font-display font-medium text-white leading-tight">
                        {look.name}
                      </h4>
                    </div>

                    {/* Instagram-style Caption Description */}
                    <p className="text-xs text-white/60 leading-relaxed font-normal">
                      <span className="text-violet-light font-semibold mr-1">aria_stylist</span>
                      {look.description}
                    </p>

                    {/* Occasion / Style Hashtags */}
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-violet-light/90">
                      <span>#{look.occasion.toLowerCase()}</span>
                      <span>#minimalist</span>
                      <span>#aesthetic</span>
                      <span>#{look.compatibility_score}match</span>
                    </div>

                    {/* CLICKABLE GARMENT CATALOG: Click any clothing item to jump the slider directly to it */}
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                        <Shirt className="w-3.5 h-3.5 text-violet-light" /> Composed Of (Click to View)
                      </div>
                      <div className="space-y-1.5">
                        {sortedItems.map((item, itemIdx) => (
                          <div 
                            key={item.id} 
                            onClick={() => handleJumpToSlide(look.id, itemIdx)}
                            className={`flex justify-between items-center text-[11px] p-2 rounded-lg border cursor-pointer transition ${
                              activeSlideIndex === itemIdx 
                                ? 'bg-violet-primary/10 border-violet-primary/30 text-white font-medium' 
                                : 'bg-white/[0.01] border-white/5 text-white/70 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span className="truncate max-w-[170px]">{item.name}</span>
                            <span className="text-[9px] uppercase tracking-wider text-violet-light font-semibold shrink-0">{item.category}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Dot indicators & Interactive Wear button */}
                  <div className="pt-4 border-t border-white/5 shrink-0 space-y-4">
                    {/* Carousel Dot Indicators */}
                    {sortedItems.length > 1 && (
                      <div className="flex justify-center gap-1.5 py-0.5">
                        {sortedItems.map((_, dotIdx) => (
                          <div 
                            key={dotIdx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              activeSlideIndex === dotIdx ? 'w-4 bg-violet-primary' : 'w-1.5 bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Wear This Outfit Trigger */}
                    <button 
                      onClick={(e) => handleWearOutfit(look, e)}
                      disabled={isOutfitWorn}
                      className="w-full py-3 rounded-xl bg-violet-primary hover:bg-violet-light disabled:bg-emerald-500/20 disabled:text-emerald-400 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition shadow-[0_0_20px_rgba(138,43,226,0.4)]"
                    >
                      {isOutfitWorn ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" /> Outfit Logged! Have a stylish day! ✨
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" /> Wear This Outfit
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}