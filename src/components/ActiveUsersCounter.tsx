import { useState, useEffect, useRef } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const labels: Record<string, string> = {
  pt: 'Usuários Online Agora',
  en: 'Users Online Now',
  es: 'Usuarios Online Ahora',
  it: 'Utenti Online Ora',
};

const flags: Record<string, string> = {
  pt: '🇧🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  it: '🇮🇹',
};

// Each country has a different base range so numbers never match
const countryBases: Record<string, { min: number; max: number; offset: number }> = {
  pt: { min: 45, max: 97, offset: 0 },
  en: { min: 28, max: 74, offset: 7 },
  es: { min: 18, max: 58, offset: 13 },
  it: { min: 12, max: 42, offset: 19 },
};

export function ActiveUsersCounter() {
  const { language } = useLanguage();
  const prevLang = useRef(language);

  const getInitialCount = (lang: string) => {
    const cfg = countryBases[lang] || countryBases.pt;
    const hour = new Date().getHours();
    const peakBonus = hour >= 10 && hour <= 22 ? 12 : 0;
    return cfg.min + cfg.offset + peakBonus + Math.floor(Math.random() * 10);
  };

  const [count, setCount] = useState(() => getInitialCount(language));
  const [displayCount, setDisplayCount] = useState(count);

  // When language changes, jump to a new country-specific range
  useEffect(() => {
    if (prevLang.current !== language) {
      prevLang.current = language;
      const newCount = getInitialCount(language);
      setCount(newCount);
    }
  }, [language]);

  // Organic fluctuation within country range
  useEffect(() => {
    const cfg = countryBases[language] || countryBases.pt;
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000;
      return setTimeout(() => {
        setCount(prev => {
          const delta = Math.floor(Math.random() * 9) - 3;
          let next = prev + delta;
          next = Math.max(cfg.min, Math.min(cfg.max, next));
          return next;
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
  }, [language]);

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

  const flag = flags[language] || flags.pt;

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
        {displayCount} {labels[language] || labels.pt} {flag}
      </span>
    </div>
  );
}
