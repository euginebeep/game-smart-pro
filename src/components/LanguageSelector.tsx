import { useLanguage, Language } from '@/contexts/LanguageContext';

const flags: Record<Language, { svg: JSX.Element; label: string }> = {
  pt: {
    label: 'Português',
    svg: (
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <rect fill="#009b3a" width="512" height="512"/>
        <polygon fill="#fedf00" points="256,64 480,256 256,448 32,256"/>
        <circle fill="#002776" cx="256" cy="256" r="96"/>
        <path d="M160,256 Q256,200 352,256" stroke="#fff" strokeWidth="12" fill="none"/>
        <circle fill="#fff" cx="200" cy="232" r="6"/>
        <circle fill="#fff" cx="256" cy="280" r="8"/>
        <circle fill="#fff" cx="312" cy="232" r="6"/>
      </svg>
    ),
  },
  en: {
    label: 'English',
    svg: (
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <rect fill="#012169" width="512" height="512"/>
        <path d="M0,0 L512,512 M512,0 L0,512" stroke="#fff" strokeWidth="80" fill="none"/>
        <path d="M0,0 L512,512 M512,0 L0,512" stroke="#c8102e" strokeWidth="50" fill="none"/>
        <path d="M256,0 V512 M0,256 H512" stroke="#fff" strokeWidth="120" fill="none"/>
        <path d="M256,0 V512 M0,256 H512" stroke="#c8102e" strokeWidth="70" fill="none"/>
      </svg>
    ),
  },
  es: {
    label: 'Español',
    svg: (
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <rect fill="#c60b1e" width="512" height="128"/>
        <rect fill="#ffc400" y="128" width="512" height="256"/>
        <rect fill="#c60b1e" y="384" width="512" height="128"/>
      </svg>
    ),
  },
  it: {
    label: 'Italiano',
    svg: (
      <svg viewBox="0 0 512 512" className="w-full h-full">
        <rect fill="#009246" width="170.67" height="512"/>
        <rect fill="#fff" x="170.67" width="170.67" height="512"/>
        <rect fill="#ce2b37" x="341.33" width="170.67" height="512"/>
      </svg>
    ),
  },
};

const languages: Language[] = ['pt', 'en', 'es', 'it'];

export default function LanguageSelector() {
  const { language, setLanguage, isTransitioning } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {languages.map((lang, index) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          disabled={isTransitioning}
          className={`
            relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden 
            transition-all duration-300 transform
            ${language === lang 
              ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-lg shadow-emerald-500/30' 
              : 'opacity-60 hover:opacity-100 hover:scale-105 hover:shadow-md'
            }
            ${isTransitioning ? 'pointer-events-none' : ''}
          `}
          style={{
            animationDelay: `${index * 50}ms`
          }}
          title={flags[lang].label}
          aria-label={`Select language: ${flags[lang].label}`}
        >
          <div className={`w-full h-full transition-transform duration-200 ${isTransitioning && language === lang ? 'scale-90' : 'scale-100'}`}>
            {flags[lang].svg}
          </div>
          {language === lang && (
            <div className="absolute inset-0 bg-emerald-400/20 animate-pulse rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
