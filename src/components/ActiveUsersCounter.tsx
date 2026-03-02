import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const labels: Record<string, string> = {
  pt: 'Usuários Online Agora',
  en: 'Users Online Now',
  es: 'Usuarios Online Ahora',
  it: 'Utenti Online Ora',
};

/**
 * Realistic "active users online" counter.
 * Simulates organic fluctuation with smooth number transitions.
 */
export function ActiveUsersCounter() {
  const { language } = useLanguage();
  const [count, setCount] = useState(() => {
    const hour = new Date().getHours();
    const base = hour >= 8 && hour <= 23 ? 40 + (hour % 12) * 5 : 15 + (hour % 6) * 3;
    return base + Math.floor(Math.random() * 15);
  });

  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        setCount(prev => {
          const hour = new Date().getHours();
          const peakMultiplier = hour >= 10 && hour <= 22 ? 1.5 : 0.7;
          const baseTarget = Math.round(35 * peakMultiplier);
          const delta = Math.floor(Math.random() * 9) - 3;
          let next = prev + delta;
          if (next < baseTarget - 10) next += Math.floor(Math.random() * 4) + 1;
          if (next > baseTarget + 40) next -= Math.floor(Math.random() * 4) + 1;
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

  const flag = language === 'es' ? '🇪🇸' : language === 'it' ? '🇮🇹' : language === 'en' ? '🇺🇸' : '🇧🇷';

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <span className="text-sm">{flag}</span>
      <Users className="w-3.5 h-3.5 animate-pulse" style={{ color: '#39FF14', filter: 'drop-shadow(0 0 4px #39FF14)' }} />
      <span
        className="text-xs font-medium text-white tabular-nums"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {displayCount} {labels[language] || labels.pt}
      </span>
    </div>
  );
}
