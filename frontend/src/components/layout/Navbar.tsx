import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-[#08040d]/40 backdrop-blur-xl border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-semibold tracking-wider uppercase text-lg text-white flex items-center gap-1.5">
            STYLEMATCH
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600/50 border border-purple-400/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.6)]">
              AI
            </span>
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm text-white/80">
            {links.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  link.active 
                    ? 'bg-purple-600 text-white font-semibold shadow-[0_0_15px_rgba(168,85,247,0.7)]' 
                    : 'hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-900/80 border border-purple-400/40 flex items-center justify-center text-purple-200">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Log in</span>
            </Link>
            <Link to="/get-started">
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white/80 hover:text-white z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-2xl font-display text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col items-center gap-6 mt-8">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg text-white/80">Log in</Link>
              <Link to="/get-started" onClick={() => setIsOpen(false)}>
                <Button size="lg">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
