import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Sparkles, Scan, Smartphone, Cloud, Layers, Play, Star, Users, Target, Shirt, FolderOpen, PieChart, Image as ImageIcon, CloudUpload, Grid, Brain, BarChart2, Heart, Plus, ChevronDown, Plane } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import InteractiveBackground from '../components/ui/InteractiveBackground';
import StatCounter from '../components/ui/StatCounter';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col pt-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Core background glows */}
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] bg-violet-primary/20 rounded-full blur-[120px] transform-gpu"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] min-w-[600px] min-h-[600px] bg-fuchsia-600/10 rounded-full blur-[150px] transform-gpu"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Magical Glowing Pedestal / Stage */}
        <div className="absolute bottom-32 md:bottom-20 right-0 md:right-10 lg:right-40 w-full max-w-[800px] h-[400px] pointer-events-none flex items-end justify-center">
          {/* Base glow */}
          <div className="absolute bottom-[5%] w-[70%] h-[120px] bg-violet-primary/40 rounded-[100%] blur-[80px]" />
          
          {/* Intense center light */}
          <div className="absolute bottom-[10%] w-[30%] h-[20px] bg-white/30 rounded-[100%] blur-[15px] shadow-[0_0_80px_30px_rgba(138,43,226,0.8)]" />
          
          {/* Sharp stage rim */}
          <div className="absolute bottom-[12%] w-[50%] h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px] shadow-[0_0_15px_#fff]" />
          
          {/* Magical ascending light beams */}
          <div className="absolute bottom-[13%] w-[40%] h-[150px] bg-gradient-to-t from-violet-primary/20 to-transparent blur-[20px]" style={{ clipPath: 'polygon(20% 100%, 80% 100%, 100% 0, 0 0)' }} />

          {/* Floating light particles (stars) */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff,0_0_24px_#8A2BE2]"
              style={{
                left: `${10 + Math.random() * 80}%`,
                bottom: `${10 + Math.random() * 20}%`,
              }}
              animate={{
                y: [0, -200 - Math.random() * 200],
                x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 150],
                opacity: [0, 1, 1, 0],
                scale: [0, Math.random() * 1.5 + 0.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      </div>

      <motion.div style={{ opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-center">
        <div className="flex flex-col lg:flex-row items-center w-full">
          {/* Left Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-primary/10 border border-violet-primary/50 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <Sparkles className="w-4 h-4 text-violet-light" />
              <span className="text-xs uppercase tracking-widest text-white font-bold">MEET YOUR NEW PERSONAL STYLIST</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl lg:text-7xl font-display font-semibold leading-[1.1] mb-6 text-white"
            >
              Your Wardrobe,<br />
              Reimagined by{' '}
              <span className="relative inline-block ml-1 group">
                <span className="bg-gradient-to-r from-purple-200 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_25px_rgba(168,85,247,0.9)]">
                  AI.
                </span>
                <svg className="absolute -left-2 -bottom-3 w-[calc(100%+16px)] h-5 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 10 C 25 22, 45 2, 65 18 C 80 24, 90 2, 100 10" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed font-normal"
            >
              Turn the clothes you already own into outfits you'll actually want to wear. Organize, style, and discover new looks instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/get-started">
                <Button size="lg" className="rounded-full px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 text-white font-semibold shadow-[0_0_35px_rgba(168,85,247,0.8)] hover:shadow-[0_0_50px_rgba(168,85,247,0.95)] hover:brightness-110 transition flex items-center gap-2">
                  Build My Wardrobe <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works" className="flex items-center gap-3 px-6 py-4 rounded-full bg-black/60 border border-white/15 text-white/90 hover:text-white hover:border-white/30 transition backdrop-blur-md font-medium text-sm">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-400/60 flex items-center justify-center">
                  <Play className="w-3 h-3 text-purple-200 fill-purple-200 ml-0.5" />
                </div>
                <span>See How It Works</span>
              </a>
            </motion.div>
          </div>

          {/* Right Stage & Floating Elements */}
          <div className="w-full lg:w-1/2 h-[480px] relative hidden lg:block mt-12 lg:mt-0">
            
            {/* Radial Purple Glow backdrop for cards cluster */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-violet-600/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Card 1: TOPS */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-[120px] w-40 rounded-2xl overflow-hidden glass-card border border-purple-500/50 p-1.5 shadow-[0_15px_35px_rgba(168,85,247,0.35)] z-20 group hover:scale-105 transition duration-300"
            >
              <div className="relative h-40 rounded-xl overflow-hidden bg-charcoal">
                <img 
                  src="/src/assets/images/flatlay_tops_knitwear_1786448101319.jpg" 
                  alt="Flatlay Tops" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                  TOPS
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">Oversized Lavender Hoo...</p>
                </div>
              </div>
            </motion.div>

            {/* Card 2: OUTERWEAR */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-8 left-[270px] w-40 rounded-2xl overflow-hidden glass-card border border-purple-500/50 p-1.5 shadow-[0_15px_35px_rgba(168,85,247,0.35)] z-20 group hover:scale-105 transition duration-300"
            >
              <div className="relative h-44 rounded-xl overflow-hidden bg-charcoal">
                <img 
                  src="/src/assets/images/outerwear_bomber_jacket_1786448115219.jpg" 
                  alt="Outerwear Bomber Jacket" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                  OUTERWEAR
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">Tailored Velvet Bl...</p>
                </div>
              </div>
            </motion.div>

            {/* Card 3: BOTTOMS */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute top-36 left-[30px] w-36 rounded-2xl overflow-hidden glass-card border border-white/20 p-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] z-10 group hover:scale-105 transition duration-300"
            >
              <div className="relative h-36 rounded-xl overflow-hidden bg-charcoal">
                <img 
                  src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop" 
                  alt="Straight Leg Denim Pants" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-white shadow-md">
                  BOTTOMS
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">High-Waisted Straig...</p>
                </div>
              </div>
            </motion.div>

            {/* Card 4: SHOES */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute bottom-2 left-[180px] w-40 rounded-2xl overflow-hidden glass-card border border-purple-500/70 p-1.5 shadow-[0_20px_45px_rgba(168,85,247,0.6)] z-30 group hover:scale-105 transition duration-300"
            >
              <div className="relative h-40 rounded-xl overflow-hidden bg-charcoal">
                <img 
                  src="/src/assets/images/shoes_minimalist_sneakers_1786448129907.jpg" 
                  alt="Minimalist White Leather Sneakers" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(168,85,247,0.9)]">
                  SHOES
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">Minimalist White Leather...</p>
                </div>
              </div>
            </motion.div>

            {/* Card 5: ACCESSORIES */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-10 left-[320px] w-36 rounded-2xl overflow-hidden glass-card border border-purple-500/50 p-1.5 shadow-[0_15px_35px_rgba(168,85,247,0.35)] z-20 group hover:scale-105 transition duration-300"
            >
              <div className="relative h-36 rounded-xl overflow-hidden bg-charcoal">
                <img 
                  src="/src/assets/images/sculptural_red_bag_1786448142897.jpg" 
                  alt="Sculptural Red Leather Bag" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-purple-600 text-[9px] font-bold uppercase tracking-wider text-white shadow-md">
                  ACCESSORIES
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] font-semibold text-white truncate">Sculptural Leather S...</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Banner with Interactive Animated Counter Props */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto mt-20 mb-8 z-20"
        >
          <div className="glass-panel bg-[#120a21]/80 border border-purple-500/40 rounded-2xl p-6 lg:p-8 flex flex-wrap justify-between items-center gap-8 backdrop-blur-md shadow-[0_20px_45px_rgba(168,85,247,0.25)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">
                  <StatCounter target={50} suffix="K+" />
                </div>
                <div className="text-xs uppercase tracking-wider text-white/60">Wardrobes Styled</div>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">
                  <StatCounter target={98} suffix="%" />
                </div>
                <div className="text-xs uppercase tracking-wider text-white/60">Style Match Accuracy</div>
              </div>
            </div>
            <div className="hidden lg:block w-px h-12 bg-white/10"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">
                  <StatCounter target={4.9} decimals={1} />
                </div>
                <div className="text-xs uppercase tracking-wider text-white/60">User Rating</div>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 border border-purple-400/60 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                <Shirt className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-white">
                  <StatCounter target={10} suffix="K+" />
                </div>
                <div className="text-xs uppercase tracking-wider text-white/60">Outfits Created</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.a 
          href="#how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: 1, duration: 0.5 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
          className="flex flex-col items-center gap-1.5 pb-6 text-white/60 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest cursor-pointer self-center group"
        >
          <span className="group-hover:text-purple-300 transition-colors">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 text-purple-400 group-hover:scale-125 transition-transform" />
        </motion.a>
      </motion.div>
      
      {/* Decorative blurred elements in hero */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01", 
      title: "Upload", 
      desc: "Upload photos of your clothes in seconds. Our background eraser cleans up every shot.",
      visual: (
        <div className="relative w-full h-44 bg-[#08040d]/90 rounded-2xl border border-white/10 p-3 flex items-center justify-center">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.4)] group">
            <img 
              src="/src/assets/images/flatlay_tops_knitwear_1786448101319.jpg" 
              alt="Uploaded Item" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
          </div>
          <button className="absolute bottom-3 right-4 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.9)] hover:scale-110 transition">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )
    },
    { 
      num: "02", 
      title: "Organize", 
      desc: "We automatically categorize, color-tag, and classify your wardrobe seamlessly.",
      visual: (
        <div className="relative w-full h-44 bg-[#08040d]/90 rounded-2xl border border-white/10 p-3 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-1.5 w-full mt-1">
            <div className="h-20 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-sm hover:border-purple-400 transition">
              <img src="/src/assets/images/outerwear_bomber_jacket_1786448115219.jpg" alt="Top" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="h-20 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-sm hover:border-purple-400 transition">
              <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=200&auto=format&fit=crop" alt="Bottoms" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="h-20 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-sm hover:border-purple-400 transition">
              <img src="/src/assets/images/shoes_minimalist_sneakers_1786448129907.jpg" alt="Shoes" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="h-20 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-sm hover:border-purple-400 transition">
              <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop" alt="Dresses" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center mb-1">
            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-tight">TOPS</span>
            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-tight">BOTTOMS</span>
            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-tight">SHOES</span>
            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-tight">DRESSES</span>
          </div>
        </div>
      )
    },
    { 
      num: "03", 
      title: "Discover", 
      desc: "Discover your style insights, color harmony, and wardrobe versatility index.",
      visual: (
        <div className="relative w-full h-44 bg-[#08040d]/90 rounded-2xl border border-white/10 p-4 flex items-center justify-between gap-3">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
              <motion.circle 
                cx="40" cy="40" r="32" 
                stroke="#c084fc" 
                strokeWidth="6" 
                fill="none" 
                strokeDasharray="201" 
                strokeDashoffset="26" 
                strokeLinecap="round" 
                initial={{ strokeDashoffset: 201 }}
                whileInView={{ strokeDashoffset: 26 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                viewport={{ once: true }}
                className="drop-shadow-[0_0_12px_rgba(192,132,252,0.9)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-sans text-white leading-none">87</span>
              <span className="text-[8px] uppercase tracking-wider font-bold text-purple-300 mt-0.5">SCORE</span>
            </div>
          </div>
          <div className="flex-1 pr-1">
            <span className="text-xs font-bold text-white tracking-wide uppercase block mb-1">STYLE SCORE</span>
            <span className="text-[11px] text-white/60 block mb-3">High Versatility</span>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.9)]"
                initial={{ width: 0 }}
                whileInView={{ width: "87%" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </div>
          </div>
        </div>
      )
    },
    { 
      num: "04", 
      title: "Style", 
      desc: "Get AI-curated outfit ideas tailored strictly for your event, mood, or weather.",
      visual: (
        <div className="relative w-full h-44 bg-[#08040d]/90 rounded-2xl border border-white/10 p-3 flex items-center justify-center gap-3">
          <div className="w-14 h-24 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-md">
            <img src="/src/assets/images/outerwear_bomber_jacket_1786448115219.jpg" alt="Outfit Jacket" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div className="w-14 h-24 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-md">
            <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop" alt="Outfit Dress" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
          <div className="w-14 h-24 rounded-xl overflow-hidden bg-charcoal border border-purple-500/30 shadow-md">
            <img src="/src/assets/images/shoes_minimalist_sneakers_1786448129907.jpg" alt="Outfit Sneaker" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-600/20 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-4">
            <span className="text-[11px] uppercase tracking-widest text-purple-200 font-bold">HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-4">Your Style Journey in 4 Simple Steps</h2>
          <p className="text-white/70 max-w-lg mx-auto text-sm md:text-base">From closet clutter to effortless everyday elegance in less than two minutes.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-[28px] bg-[#120a21]/90 backdrop-blur-md border border-white/10 hover:border-purple-500/60 transition-all duration-300 flex flex-col justify-between shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.35)] group"
            >
              <div>
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white mb-6 shadow-[0_0_18px_rgba(168,85,247,0.9)]">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed min-h-[48px] mb-6">{step.desc}</p>
              </div>
              
              <div className="w-full mt-auto">
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <InteractiveBackground />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeatureShowcase />
        <InteractivePreview />
        <AboutSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

function FeatureShowcase() {
  const features = [
    {
      title: "Digital Wardrobe",
      description: "Store all your clothes in one secure place.",
      icon: <FolderOpen className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Clothing Upload",
      description: "Easily add photos and details of your clothes.",
      icon: <CloudUpload className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Clothing Organization",
      description: "Smart categories to keep your wardrobe tidy.",
      icon: <Grid className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Outfit Discovery",
      description: "Discover new looks from your own clothes.",
      icon: <Shirt className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Personal Style Analysis",
      description: "Understand your style and preferences.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "AI Styling",
      description: "AI-powered outfit ideas just for you.",
      icon: <Brain className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Wardrobe Insights",
      description: "Track usage, favorites and wardrobe stats.",
      icon: <BarChart2 className="w-5 h-5 text-purple-400" />,
    },
    {
      title: "Outfit Recommendations",
      description: "Get the perfect outfit for any occasion.",
      icon: <Heart className="w-5 h-5 text-purple-400" />,
    }
  ];

  return (
    <section id="features" className="py-20 px-6 relative z-10 bg-transparent">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-600/20 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)] mb-4">
            <span className="text-[11px] uppercase tracking-widest text-purple-200 font-bold">CORE FEATURES</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-4">Everything You Need To Master Your Style</h2>
        </motion.div>

        {/* Feature Grid with Scroll Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="bg-[#120a21]/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-purple-600/0 to-purple-600/0 group-hover:from-purple-600/15 group-hover:to-transparent transition-all duration-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 rounded-bl-[100px] group-hover:bg-purple-600/25 transition-colors duration-500 blur-2xl" />
              
              <div className="relative z-10 flex flex-col items-start gap-4 h-full">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#1c1030] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-purple-500/60 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:bg-purple-600/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-semibold mb-2 text-white/90 group-hover:text-white transition-colors">{feature.title}</h3>
                  <p className="text-white/50 text-[13px] leading-relaxed flex-1">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-32 px-6 md:px-12 relative z-10 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-600/20 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)] mb-6">
              <span className="text-[11px] uppercase tracking-widest text-purple-200 font-bold">WHY CHOOSE STYLEMATCH AI</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-6 leading-tight">Your personal stylist, always in your pocket.</h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10">
              StyleMatch AI was built to solve the age-old problem of "having a closet full of clothes and nothing to wear". We combine your actual wardrobe with advanced AI to eliminate daily decision fatigue and help you step out with confidence.
            </p>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-colors duration-300">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Intelligent AI Styling</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Our AI analyzes your unique style profile, the local weather, and your specific occasion to curate the perfect outfit directly from your digitized wardrobe.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-colors duration-300">
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Effortless Wardrobe Organization</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Instantly upload and categorize your clothing. Rediscover forgotten pieces and maximize the potential of the items you already own, promoting sustainable fashion.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition-colors duration-300">
                  <Plane className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Smart Travel Packing</h4>
                  <p className="text-sm text-white/60 leading-relaxed">Never overpack again. Generate precision packing lists based on your destination's climate, duration of stay, and scheduled events.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 relative flex justify-center items-center h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative w-full max-w-[450px] aspect-[4/5]">
              {/* Back Card (Wardrobe) */}
              <motion.div 
                animate={{ rotate: [-4, -2, -4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[85%] aspect-[3/4] glass-panel p-2 rounded-[2rem] border border-white/10 shadow-2xl z-0 origin-bottom-right"
              >
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative border border-white/5">
                  <img src="/src/assets/images/flatlay_tops_knitwear_1786448101319.jpg" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700" alt="Wardrobe items" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
                  <div className="absolute bottom-6 left-5 right-5 backdrop-blur-md bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                       <Layers className="w-4 h-4 text-white/80" />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">Digitized Wardrobe</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                       <div className="w-[68%] h-full bg-white/80 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Front Card (AI Stylist) */}
              <motion.div 
                animate={{ rotate: [2, 4, 2], y: [0, -12, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 right-0 w-[85%] aspect-[3/4] glass-panel p-2 rounded-[2rem] border border-purple-500/30 shadow-[0_20px_60px_rgba(168,85,247,0.2)] z-10 origin-bottom-left"
              >
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative border border-white/5">
                  <img src="/src/assets/images/hero_fashion_outfit_1786447643921.jpg" className="w-full h-full object-cover" alt="AI Generated Outfit" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-white">98% Match</span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="font-display font-bold text-white text-2xl mb-1">Evening Ensemble</h3>
                    <p className="text-sm text-white/70 mb-4 font-medium flex items-center gap-2">
                       Dinner Date <span className="w-1 h-1 rounded-full bg-white/30"></span> 65°F
                    </p>
                    
                    <div className="flex gap-2 p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                       <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                          <img src="/src/assets/images/outerwear_bomber_jacket_1786448115219.jpg" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 shadow-sm">
                          <img src="/src/assets/images/sculptural_red_bag_1786448142897.jpg" className="w-full h-full object-cover" />
                       </div>
                       <div className="w-10 h-10 rounded-lg border border-white/20 flex items-center justify-center bg-white/10 shadow-sm">
                          <span className="text-xs font-bold text-white/90">+2</span>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#08040d] z-0" />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/25 blur-[160px] z-0"
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-6xl font-display font-medium mb-6 leading-tight text-white">
          Your wardrobe has more potential than you think.
        </h2>
        <p className="text-xl text-white/70 mb-10">
          Let AI help you discover it.
        </p>
        <Link to="/get-started">
          <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 text-white shadow-[0_0_45px_rgba(168,85,247,0.8)] hover:shadow-[0_0_60px_rgba(168,85,247,1)]">
            Start Styling — It's Free
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

function InteractivePreview() {
  return (
    <section className="py-16 sm:py-24 px-3 sm:px-6 md:px-12 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-600/20 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)] mb-4">
            <span className="text-[11px] uppercase tracking-widest text-purple-200 font-bold">PREVIEW</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-medium mb-3 sm:mb-4 text-white">Experience the magic.</h2>
          <p className="text-white/70 text-sm sm:text-base">A glimpse into your future digital wardrobe.</p>
        </div>
        
        <div className="glass-panel rounded-[1.75rem] md:rounded-[2rem] p-2.5 sm:p-4 md:p-5 border-purple-500/50 bg-[#120a21]/90 backdrop-blur-2xl mx-auto relative group shadow-[0_12px_45px_rgba(168,85,247,0.35)] border-2 md:border">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-violet-600/20 opacity-100 group-hover:opacity-100 transition-opacity duration-700 rounded-[1.75rem] md:rounded-[2rem] pointer-events-none" />
          
          {/* Mock App UI Container */}
          <div className="bg-[#0f091a] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden relative min-h-[500px] md:min-h-0 md:aspect-[16/10] flex flex-col md:flex-row border border-purple-500/30 md:border-white/5 shadow-inner">
            
            {/* Sidebar mock */}
            <div className="w-64 bg-black/60 border-r border-white/5 p-6 hidden md:flex flex-col backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-semibold text-lg tracking-wide text-white">StyleMatch</span>
              </div>
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 cursor-pointer">
                  <Grid className="w-4 h-4" />
                  <span className="text-sm font-medium">Wardrobe</span>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">Outfits</span>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors cursor-pointer">
                  <Cloud className="w-4 h-4" />
                  <span className="text-sm font-medium">Weather</span>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors cursor-pointer">
                  <BarChart2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Insights</span>
                </div>
              </div>
              
              <div className="mt-auto bg-gradient-to-r from-purple-600/20 to-transparent p-4 rounded-xl border border-purple-500/30">
                <p className="text-[10px] uppercase text-purple-300 font-semibold mb-1">Style Score</p>
                <div className="text-2xl font-bold text-white">87<span className="text-sm text-white/50 font-normal">/100</span></div>
              </div>
            </div>
            
            {/* Main content mock */}
            <div className="flex-1 p-3.5 sm:p-6 md:p-8 relative overflow-hidden flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 sm:mb-8 relative z-10">
                <div>
                  <h3 className="text-lg sm:text-2xl font-display font-semibold mb-0.5 sm:mb-1 text-white">Morning Collection</h3>
                  <p className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-purple-300" /> 72°F · Sunny — Perfect for light layers
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600/30 border border-purple-400/50 rounded-lg text-[10px] sm:text-xs font-semibold text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                    <Smartphone className="w-3 h-3 text-purple-300" /> Sync Active
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-purple-500/70 overflow-hidden shadow-lg">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              {/* Filter Pills */}
              <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide relative z-10 -mx-1 px-1">
                {['All Items', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'].map((tag, i) => (
                  <div key={tag} className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${i === 0 ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'}`}>
                    {tag}
                  </div>
                ))}
              </div>
              
              {/* Grid Content */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar relative z-10 pb-16 md:pb-0">
                {[
                  { name: "Oversized Hoodie", category: "Tops", color: "Purple", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop" },
                  { name: "Classic Denim", category: "Bottoms", color: "Blue", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=200&auto=format&fit=crop" },
                  { name: "Air Max Sneakers", category: "Shoes", color: "White", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&auto=format&fit=crop" },
                  { name: "Tailored Blazer", category: "Outerwear", color: "Purple", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200&auto=format&fit=crop" },
                  { name: "Evening Dress", category: "Dresses", color: "Black", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=200&auto=format&fit=crop" },
                  { name: "Leather Tote", category: "Accessories", color: "Purple", img: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop" },
                  { name: "Linen Shirt", category: "Tops", color: "White", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=200&auto=format&fit=crop" },
                  { name: "Chelsea Boots", category: "Shoes", color: "Black", img: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=200&auto=format&fit=crop" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="bg-[#1c122e]/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-purple-500/20 overflow-hidden group hover:border-purple-500/60 hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all cursor-pointer flex flex-col"
                    whileHover={{ y: -4 }}
                  >
                    <div className="h-28 sm:h-36 md:h-40 w-full relative overflow-hidden bg-black/30 p-1.5 sm:p-2">
                       <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-lg sm:rounded-xl opacity-90 group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                         <Heart className="w-3.5 h-3.5 text-white/80 hover:text-red-400 transition-colors" />
                       </div>
                    </div>
                    <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent">
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white/95 truncate mb-0.5 group-hover:text-purple-300 transition-colors">{item.name}</h4>
                        <p className="text-[9px] sm:text-[10px] text-purple-300/90 font-bold uppercase tracking-wider">{item.category}</p>
                      </div>
                      <div className="mt-2 sm:mt-3 flex gap-1">
                         <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/30" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                      </div>
                    </div>
                  </motion.div>
                )) /* Typo Fixed: Changed `}))` to `))` and closed the JSX wrapper `{}` below */}
              </div>

              {/* Floating action button mock */}
              <motion.div 
                className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.85)] flex items-center justify-center cursor-pointer z-20 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
              </motion.div>
              
              {/* Bottom gradient fade for scrolling */}
              <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-gradient-to-t from-[#0f091a] to-transparent pointer-events-none z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}