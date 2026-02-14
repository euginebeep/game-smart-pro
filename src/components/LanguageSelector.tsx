import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languageLabels: Record<Language, { code: string; name: string }> = {
  pt: { code: 'PT', name: 'Português' },
  en: { code: 'EN', name: 'English' },
  es: { code: 'ES', name: 'Español' },
  it: { code: 'IT', name: 'Italiano' },
};

const languages: Language[] = ['pt', 'en', 'es', 'it'];

export default function LanguageSelector() {
  const { language, setLanguage, isTransitioning } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isTransitioning}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
        aria-label="Select language"
      >
        <span className="text-xs font-semibold">{languageLabels[language].code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-popover shadow-lg z-50 py-1 animate-fade-in-up" style={{ animationDuration: '0.15s' }}>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                language === lang 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'text-popover-foreground hover:bg-muted/50'
              }`}
            >
              <span>{languageLabels[lang].name}</span>
              <span className="text-xs text-muted-foreground">{languageLabels[lang].code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
