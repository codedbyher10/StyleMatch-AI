import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import InteractiveBackground from '../components/ui/InteractiveBackground';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [styles, setStyles] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [avoidColors, setAvoidColors] = useState<string[]>([]);

  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const finishOnboarding = async () => {
    const onboardingPreferences = {
      styles,
      occasions,
      colors,
      avoidColors
    };

    const token = localStorage.getItem('stylematch_token');
    
    // If the user is already logged in, write onboarding straight to Supabase
    if (token) {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            styles: styles,
            occasions: occasions,
            preferred_colors: colors,
            avoided_colors: avoidColors
          })
        });
        if (res.ok) {
          navigate('/app');
          return;
        }
      } catch (err) {
        console.error("Failed to save onboarding directly to database", err);
      }
    }

    // Otherwise, temporarily store locally as guest and redirect to signup
    localStorage.setItem('stylematch_onboarding', JSON.stringify(onboardingPreferences));
    navigate('/signup'); 
  };

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">
      <InteractiveBackground />
      
      <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-display tracking-[0.2em] text-white/50">
            0{step} <span className="text-white/20">/</span> 0{totalSteps}
          </span>
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition transform-gpu duration-500 ${i + 1 <= step ? 'w-8 bg-violet-primary box-glow' : 'w-4 bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepContent key="1" title="STEP 01 — YOUR STYLE" question="How would you describe your style?">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['Casual', 'Minimal', 'Streetwear', 'Formal', 'Sporty', 'Vintage', 'Elegant'].map(s => (
                  <SelectCard 
                    key={s} 
                    label={s} 
                    selected={styles.includes(s)} 
                    onClick={() => toggleSelection(s, styles, setStyles)} 
                  />
                ))}
              </div>
            </StepContent>
          )}

          {step === 2 && (
            <StepContent key="2" title="STEP 02 — YOUR OCCASIONS" question="Where do you dress for most?">
              <div className="grid grid-cols-2 gap-4">
                {['College', 'Office', 'Daily Life', 'Party', 'Gym', 'Travel'].map(o => (
                  <SelectCard 
                    key={o} 
                    label={o} 
                    selected={occasions.includes(o)} 
                    onClick={() => toggleSelection(o, occasions, setOccasions)} 
                  />
                ))}
              </div>
            </StepContent>
          )}

          {step === 3 && (
            <StepContent key="3" title="STEP 03 — YOUR COLORS" question="What colors do you love wearing?">
              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  { name: 'Black', hex: '#000' },
                  { name: 'White', hex: '#fff' },
                  { name: 'Navy', hex: '#1e3a8a' },
                  { name: 'Olive', hex: '#4d7c0f' },
                  { name: 'Beige', hex: '#f5f5dc' },
                  { name: 'Gray', hex: '#6b7280' },
                  { name: 'Burgundy', hex: '#7f1d1d' },
                  { name: 'Pastel', hex: '#fbcfe8' }
                ].map(c => (
                  <ColorCircle 
                    key={c.name} 
                    color={c} 
                    selected={colors.includes(c.name)} 
                    onClick={() => toggleSelection(c.name, colors, setColors)} 
                  />
                ))}
              </div>
            </StepContent>
          )}

          {step === 4 && (
            <StepContent key="4" title="STEP 04 — COLORS TO AVOID" question="Anything you don't like wearing?">
              <p className="text-white/40 text-sm mb-6 text-center">We'll keep these out of your recommendations.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {[
                  { name: 'Neon', hex: '#a3e635' },
                  { name: 'Yellow', hex: '#fef08a' },
                  { name: 'Orange', hex: '#fb923c' },
                  { name: 'Red', hex: '#f87171' },
                  { name: 'Pink', hex: '#f472b6' },
                  { name: 'Purple', hex: '#c084fc' }
                ].map(c => (
                  <ColorCircle 
                    key={c.name} 
                    color={c} 
                    selected={avoidColors.includes(c.name)} 
                    onClick={() => toggleSelection(c.name, avoidColors, setAvoidColors)} 
                  />
                ))}
              </div>
            </StepContent>
          )}

          {step === 5 && (
            <StepContent key="5" title="STEP 05 — BUILD YOUR WARDROBE" question="Ready to bring your wardrobe into StyleMatch?">
              <div className="flex flex-col gap-4 mt-8">
                <Button size="lg" className="w-full" onClick={finishOnboarding} icon={<ArrowRight className="w-5 h-5"/>}>
                  Explore Demo Wardrobe
                </Button>
                <Button variant="secondary" size="lg" className="w-full" onClick={finishOnboarding}>
                  Add My First Piece
                </Button>
              </div>
            </StepContent>
          )}
        </AnimatePresence>

        {/* Bottom Actions */}
        {step < 5 && (
          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button onClick={nextStep}>
              Continue
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StepContent({ title, question, children }: { title: string, question: string, children: React.ReactNode, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="glass-panel p-8 md:p-12 rounded-3xl w-full relative"
    >
      <div className="text-center mb-8">
        <h3 className="text-violet-primary text-xs font-display tracking-[0.2em] mb-4">{title}</h3>
        <h2 className="text-2xl md:text-4xl font-medium font-display leading-tight">{question}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function SelectCard({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void, key?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl border text-center transition transform-gpu duration-300 ${
        selected 
          ? 'bg-violet-primary/20 border-violet-primary text-white box-glow' 
          : 'bg-charcoal border-white/10 text-white/60 hover:border-white/30 hover:text-white'
      }`}
    >
      {selected && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-violet-primary flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
      <span className="font-medium text-sm">{label}</span>
    </motion.button>
  );
}

function ColorCircle({ color, selected, onClick }: { color: {name: string, hex: string}, selected: boolean, onClick: () => void, key?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center transition transform-gpu duration-300 ${
        selected ? 'ring-2 ring-violet-primary ring-offset-2 ring-offset-black box-glow' : ''
      }`}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    >
      {selected && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full"
        >
          <Check className="w-6 h-6 text-white drop-shadow-md" />
        </motion.div>
      )}
    </motion.button>
  );
}