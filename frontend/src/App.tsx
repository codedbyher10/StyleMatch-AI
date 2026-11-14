import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

// Placeholders for pages
import LandingPage from './pages/LandingPage';
import GetStartedPage from './pages/GetStartedPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import WardrobePage from './pages/WardrobePage';
import AddClothingPage from './pages/AddClothingPage';
import GenerateOutfitPage from './pages/GenerateOutfitPage';
import InspirationMatcherPage from './pages/InspirationMatcherPage';
import AIStylistPage from './pages/AIStylistPage';
import StyleProfilePage from './pages/StyleProfilePage';
import SavedOutfitsPage from './pages/SavedOutfitsPage';
import TravelModePage from './pages/TravelModePage';
import AuthPage from './pages/AuthPage';

//  1. PROTECTED ROUTE GUARD: Redirects to login if no token is found in sessionStorage
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('stylematch_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

//  2. PUBLIC ONLY ROUTE GUARD: Redirects to dashboard if user is already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('stylematch_token');
  if (token) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}

function GlobalLoader({ onComplete }: { onComplete: () => void; key?: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 200);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-display text-4xl md:text-6xl text-white tracking-wider">
            STYLEMATCH<span className="text-violet-primary">AI</span>
          </h1>
        </motion.div>
        
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <Sparkles className="w-8 h-8 text-violet-primary" />
          </motion.div>
          <motion.div
            className="absolute inset-0 border-2 border-violet-primary/30 rounded-full"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/60 text-sm uppercase tracking-[0.2em] mb-4"
        >
          Curating your digital wardrobe...
        </motion.p>
        
        <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-violet-primary text-glow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="h-full flex-1 flex flex-col">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          
          {/* Public Only routes */}
          <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><AuthPage mode="signup" /></PublicRoute>} />
          
          {/* Protected routes */}
          <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="wardrobe" element={<WardrobePage />} />
            <Route path="wardrobe/add" element={<AddClothingPage />} />
            <Route path="outfits/generate" element={<GenerateOutfitPage />} />
            <Route path="inspo-match" element={<InspirationMatcherPage />} />
            <Route path="stylist" element={<AIStylistPage />} />
            <Route path="style" element={<StyleProfilePage />} />
            <Route path="outfits" element={<SavedOutfitsPage />} />
            <Route path="travel" element={<TravelModePage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-black text-white font-sans selection:bg-violet-primary/30 selection:text-white">
        <AnimatePresence mode="wait">
          {loading ? (
            <GlobalLoader key="loader" onComplete={() => setLoading(false)} />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="min-h-screen flex flex-col relative"
            >
              <div className="fixed inset-0 pointer-events-none z-[-1] bg-mesh opacity-40"></div>
              <AppRoutes />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}