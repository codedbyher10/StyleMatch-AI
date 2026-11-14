import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import InteractiveBackground from '../components/ui/InteractiveBackground';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const base_url = 'http://127.0.0.1:8000';

  // INITIALIZE GOOGLE SIGN-IN BUTTON
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Reads your Client ID securely from .env
          callback: handleGoogleCallback,
        });

        (window as any).google.accounts.id.renderButton(
          document.getElementById('google-btn-container'),
          {
            theme: 'outline',
            size: 'large',
            shape: 'pill',
            width: 368, // Aligned with other inputs
          }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [mode]);

  // Google authentication callback
  const handleGoogleCallback = async (response: any) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${base_url}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const loginData = await res.json();
      if (!res.ok) {
        throw new Error(loginData.detail || 'Google Sign-In failed.');
      }

      sessionStorage.setItem('stylematch_token', loginData.access_token);

      const pendingOnboarding = sessionStorage.getItem('stylematch_onboarding');
      if (pendingOnboarding) {
        try {
          const parsed = JSON.parse(pendingOnboarding);
          await fetch(`${base_url}/api/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.access_token}`
            },
            body: JSON.stringify({
              gender: parsed.gender,
              styles: parsed.styles,
              occasions: parsed.occasions,
              preferred_colors: parsed.colors,
              avoided_colors: parsed.avoidColors
            })
          });
          sessionStorage.removeItem('stylematch_onboarding');
        } catch (e) {
          console.error("Failed to sync onboarding data", e);
        }
      }

      navigate('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred with Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        const signupRes = await fetch(`${base_url}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
          }),
        });

        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          throw new Error(signupData.detail || 'Failed to create your account.');
        }
      }

      const formParams = new URLSearchParams();
      formParams.append('username', email);
      formParams.append('password', password);

      const loginRes = await fetch(`${base_url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formParams,
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error(loginData.detail || 'Authentication failed. Please verify your password.');
      }

      sessionStorage.setItem('stylematch_token', loginData.access_token);

      const pendingOnboarding = sessionStorage.getItem('stylematch_onboarding');
      if (pendingOnboarding && mode === 'signup') {
        try {
          const parsed = JSON.parse(pendingOnboarding);
          await fetch(`${base_url}/api/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.access_token}`
            },
            body: JSON.stringify({
              gender: parsed.gender,
              styles: parsed.styles,
              occasions: parsed.occasions,
              preferred_colors: parsed.colors,
              avoided_colors: parsed.avoidColors
            })
          });
          sessionStorage.removeItem('stylematch_onboarding');
        } catch (e) {
          console.error("Failed to sync onboarding data on signup", e);
        }
      }

      navigate('/app');

    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent">
      <InteractiveBackground />
      
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-primary/10 blur-[120px]"
        />
        
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px]"
        />

        <svg className="absolute inset-0 w-full h-full opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)" />
        </svg>
      </div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group z-20">
        <Sparkles className="w-5 h-5 text-violet-primary group-hover:animate-pulse" />
        <span className="font-display font-semibold tracking-wider uppercase text-lg">
          StyleMatch<span className="text-violet-primary">AI</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute inset-0 bg-violet-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden group shadow-[0_0_50px_-10px_rgba(138,43,226,0.3)] hover:shadow-[0_0_80px_-15px_rgba(138,43,226,0.4)] transition-shadow duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-primary/0 via-transparent to-violet-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-3xl font-display font-medium mb-2 text-white">
              {mode === 'login' ? 'Welcome back.' : 'Join StyleMatch AI.'}
            </h2>
            <p className="text-white/60 text-sm">
              {mode === 'login' ? 'Enter your details to access your wardrobe.' : 'Create an account to start styling.'}
            </p>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium text-center relative z-10"
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="space-y-4"
            >
              {mode === 'signup' && (
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <motion.input 
                    whileFocus={{ scale: 1.02 }}
                    type="text" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/30 transition transform-gpu duration-300 disabled:opacity-50"
                  />
                </motion.div>
              )}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <motion.input 
                  whileFocus={{ scale: 1.02 }}
                  type="email" 
                  placeholder="Email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/30 transition transform-gpu duration-300 disabled:opacity-50"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <motion.input 
                  whileFocus={{ scale: 1.02 }}
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-charcoal/80 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-primary/50 text-white placeholder:text-white/30 transition transform-gpu duration-300 disabled:opacity-50"
                />
              </motion.div>
              
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Button 
                  type="submit" 
                  className="w-full mt-4 flex items-center justify-center gap-2" 
                  size="lg" 
                  disabled={isLoading}
                  icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4"/>}
                >
                  {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          {/* SIGN IN/UP WITH GOOGLE SECTOR */}
          <div className="relative my-6 z-10 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-white/10" />
            <span className="relative px-3 text-xs uppercase tracking-wider text-white/40 bg-[#0c0813] backdrop-blur-md rounded-md">
              or continue with
            </span>
          </div>

          {/* Elegant Glassmorphic Google Button Wrapper */}
          <div className="relative z-10 w-full flex justify-center max-w-[368px] mx-auto group">
            {/* 1. Custom Styled Glassmorphic Button (Visible) */}
            <div className="w-full flex items-center justify-center gap-2 bg-white/[0.03] border border-white/10 rounded-full py-3 text-sm font-medium text-white/80 transition transform-gpu duration-300 group-hover:bg-white/[0.08] group-hover:border-violet-primary/30 group-active:scale-[0.98] shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:shadow-[0_4px_20px_rgba(138,43,226,0.15)]">
              <GoogleIcon />
              <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </div>

            {/* 2. Real Google Iframe (Invisible, Layered on Top to capture clicks) */}
            <div 
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer [&_iframe]:w-full [&_iframe]:h-full" 
              id="google-btn-container"
            />
          </div>

          <div className="mt-8 text-center text-sm text-white/50 relative z-10">
            {mode === 'login' ? (
              <p>Don't have an account? <Link to="/signup" className="text-violet-light hover:text-white transition-colors">Sign up</Link></p>
            ) : (
              <p>Already have an account? <Link to="/login" className="text-violet-light hover:text-white transition-colors">Sign in</Link></p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}