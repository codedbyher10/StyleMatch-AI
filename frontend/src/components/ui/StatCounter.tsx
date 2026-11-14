import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'motion/react';

interface StatCounterProps {
  target: number;      // The end number (e.g. 50, 98, 4.9)
  decimals?: number;   // Number of decimals (optional, default: 0)
  suffix?: string;     // Text appended after number (optional, e.g. "K+", "%")
  duration?: number;   // Duration in seconds (optional, default: 2)
}

export default function StatCounter({ target, decimals = 0, suffix = '', duration = 2 }: StatCounterProps) {
  const ref = useRef(null);
  
  // Triggers once: true when at least 30% of the element is visible on screen
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  // Motion value starting at 0
  const count = useMotionValue(0);
  
  // Reactively format and append suffix as the number counts up
  const formattedCount = useTransform(count, (latestValue) => {
    return latestValue.toFixed(decimals) + suffix;
  });

  useEffect(() => {
    if (isInView) {
      // Smooth "ease-out" curve starts fast and slows down gracefully toward the target
      const controls = animate(count, target, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1], 
      });
      return controls.stop;
    }
  }, [isInView, target, duration, count]);

  return (
    // tabular-nums prevents horizontal layout shifting/jittering as numbers change sizes
    <motion.span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formattedCount}
    </motion.span>
  );
}