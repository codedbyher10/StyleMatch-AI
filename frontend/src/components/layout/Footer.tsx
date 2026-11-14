import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-primary" />
            <span className="font-display font-semibold tracking-wider uppercase text-xl">
              StyleMatch<span className="text-violet-primary">AI</span>
            </span>
          </Link>
          <p className="text-white/50 max-w-xs text-sm">
            Your Wardrobe. Your Style. Your AI Stylist.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-12 md:gap-24 text-sm">
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Product</h4>
            <Link to="/features" className="text-white/50 hover:text-violet-light transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-white/50 hover:text-violet-light transition-colors">How It Works</Link>
            <Link to="/ai-stylist" className="text-white/50 hover:text-violet-light transition-colors">AI Stylist</Link>
            <Link to="/wardrobe" className="text-white/50 hover:text-violet-light transition-colors">Wardrobe</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-medium mb-2">Company</h4>
            <a href="#about" className="text-white/50 hover:text-violet-light transition-colors">About</a>
            <Link to="/privacy" className="text-white/50 hover:text-violet-light transition-colors">Privacy</Link>
            <Link to="/terms" className="text-white/50 hover:text-violet-light transition-colors">Terms</Link>
            <Link to="/contact" className="text-white/50 hover:text-violet-light transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-white/30 text-xs">
        &copy; {new Date().getFullYear()} StyleMatch AI. All rights reserved.
      </div>
    </footer>
  );
}
