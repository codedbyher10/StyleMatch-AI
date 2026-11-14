import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import ParticleSystem from '../components/ui/ParticleSystem';
import { useState } from 'react';

export default function GetStartedPage() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Background Layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Layer 1: Gradient */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-violet-primary/20 blur-[120px] mix-blend-screen"
          animate={isTransitioning ? { scale: 3, opacity: 0 } : { scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: isTransitioning ? 1.5 : 8, repeat: isTransitioning ? 0 : Infinity }}
        />
        
        {/* Layer 2: Particles */}
        <ParticleSystem />

        {/* Layer 3: AI Network Lines (Simplified with CSS background) */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at center, rgba(138,43,226,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
             
        {/* Layer 6: Grain */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
             style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      <motion.div 
        className="relative z-10 max-w-2xl mx-auto px-6 py-12 text-center my-auto"
        animate={isTransitioning ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-400/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium leading-tight mb-3 text-white">
            Your wardrobe.<br />
            Your style.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-fuchsia-300 to-purple-400">Your AI stylist.</span>
          </h1>
          
          <p className="text-sm md:text-base text-white/60 mb-6">
            Let's build a wardrobe that understands you.
          </p>

          <div className="flex flex-col gap-3.5 text-left max-w-xs mx-auto mb-8">
            {[
              { num: '01', text: 'Discover your style' },
              { num: '02', text: 'Build your wardrobe' },
              { num: '03', text: 'Let AI style you' }
            ].map((step, i) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (i * 0.15) }}
                className="flex items-center gap-4 group"
              >
                <span className="text-xs font-bold text-purple-400 font-display tracking-widest">{step.num}</span>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">{step.text}</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent group-hover:from-purple-500/40 transition-colors" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button 
              size="lg" 
              onClick={handleStart}
              className="w-full sm:w-auto text-base py-3.5 px-8 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 text-white font-semibold shadow-[0_0_35px_rgba(168,85,247,0.7)] hover:shadow-[0_0_50px_rgba(168,85,247,0.9)]"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Start Your Style Journey
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
