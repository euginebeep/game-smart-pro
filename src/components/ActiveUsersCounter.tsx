import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

/**
 * Realistic "active users online" counter.
 * Simulates organic fluctuation with smooth number transitions.
 */
export function ActiveUsersCounter() {
  const [count, setCount] = useState(() => {
    // Seed based on current hour so it feels consistent on reload
    const hour = new Date().getHours();
    const base = hour >= 8 && hour <= 23 ? 40 + (hour % 12) * 5 : 15 + (hour % 6) * 3;
    return base + Math.floor(Math.random() * 15);
  });

  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    // Fluctuate every 3-8 seconds with small organic changes
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        setCount(prev => {
          const hour = new Date().getHours();
          // Higher baseline during peak hours (10-22)
          const peakMultiplier = hour >= 10 && hour <= 22 ? 1.5 : 0.7;
          const baseTarget = Math.round(35 * peakMultiplier);
          
          // Small random walk: -3 to +5 bias upward
          const delta = Math.floor(Math.random() * 9) - 3;
          let next = prev + delta;
          
          // Gently pull toward base target
          if (next < baseTarget - 10) next += Math.floor(Math.random() * 4) + 1;
          if (next > baseTarget + 40) next -= Math.floor(Math.random() * 4) + 1;
          
          // Clamp between 8 and 97
          return Math.max(8, Math.min(97, next));
        });
      }, delay);
    };

    let timer = scheduleNext();
    const interval = setInterval(() => {
      clearTimeout(timer);
      timer = scheduleNext();
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Smooth number animation
  useEffect(() => {
    if (displayCount === count) return;
    
    const diff = count - displayCount;
    const step = diff > 0 ? 1 : -1;
    const speed = Math.max(40, 120 / Math.abs(diff));
    
    const timer = setTimeout(() => {
      setDisplayCount(prev => prev + step);
    }, speed);
    
    return () => clearTimeout(timer);
  }, [count, displayCount]);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Users className="w-3.5 h-3.5 animate-pulse" style={{ color: '#39FF14', filter: 'drop-shadow(0 0 4px #39FF14)' }} />
      <span
        className="text-xs font-medium text-white tabular-nums"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {displayCount} usuários online agora
      </span>
    </div>
  );
}
