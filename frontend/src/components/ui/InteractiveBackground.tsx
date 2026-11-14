import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const updatePosition = () => {
      // Smooth lerp without React state updates
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0)`;
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#08040d]">
      {/* Base Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-70" />
      
      {/* Elegant Glowing Ambient Waves - Hardware Accelerated CSS opacity */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" fill="none">
          <path
            d="M-100 200 C 300 400, 700 0, 1100 350 C 1300 500, 1500 100, 1600 300"
            stroke="url(#purpleGlow1)"
            strokeWidth="3.5"
            className="animate-pulse duration-[8000ms]"
          />
          <path
            d="M-100 600 C 200 300, 600 800, 1000 450 C 1200 250, 1400 700, 1600 500"
            stroke="url(#purpleGlow2)"
            strokeWidth="3"
            className="animate-pulse duration-[10000ms]"
          />
          <defs>
            <linearGradient id="purpleGlow1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="purpleGlow2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e879f9" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Direct DOM Mouse Follow Spotlight - buttery smooth GPU translate3d */}
      <div
        ref={spotlightRef}
        className="hidden md:block absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[90px] pointer-events-none will-change-transform"
      />
      
      {/* Static Subtle Grain overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
}

