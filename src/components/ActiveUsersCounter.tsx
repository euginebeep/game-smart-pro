import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveUsersCount } from '@/hooks/useActiveUsersCount';

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

export function ActiveUsersCounter() {
  const { language } = useLanguage();
  const count = useActiveUsersCount();
  const [displayCount, setDisplayCount] = useState(count);

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
        {displayCount} {labels[language] || labels.pt}
      </span>
      <span className="text-sm leading-none" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{flag}</span>
    </div>
  );
}
