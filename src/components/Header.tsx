import { Zap, TrendingUp, LogOut, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onFetch: () => void;
  loading: boolean;
  apiRemaining: number | null;
  onSignOut?: () => void;
  dailySearchesRemaining?: number | null;
  isTrial?: boolean;
}

export function Header({ onFetch, loading, apiRemaining, onSignOut, dailySearchesRemaining, isTrial }: HeaderProps) {
  const { t, language } = useLanguage();
  
  const today = new Date().toLocaleDateString(
    language === 'pt' ? 'pt-BR' : 
    language === 'es' ? 'es-ES' : 
    language === 'it' ? 'it-IT' : 'en-US',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );

  return (
    <header className="mb-6 sm:mb-8 lg:mb-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Animated Logo */}
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-[70px] lg:h-[70px] rounded-xl sm:rounded-2xl lg:rounded-[20px] flex items-center justify-center animate-pulse-slow"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(160 84% 39%) 100%)',
              boxShadow: '0 0 30px hsla(160, 84%, 39%, 0.4)'
            }}
          >
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black gradient-text tracking-tight">
              EUGINE v3.0
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base font-medium mt-0.5 sm:mt-1">
              {t('main.subtitle')}
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Live Badge */}
          <div className="badge badge-live text-[10px] sm:text-xs">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive rounded-full animate-pulse-slow" />
            <span className="uppercase tracking-wide">
              {t('main.liveOdds')} • {today}
            </span>
          </div>

          {/* Daily Searches Remaining Badge (Trial Users) */}
          {isTrial && dailySearchesRemaining !== null && dailySearchesRemaining !== undefined && dailySearchesRemaining >= 0 && (
            <div className={`badge flex items-center gap-1.5 ${dailySearchesRemaining === 0 ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-amber-500/20 border-amber-500/30 text-amber-400'}`}>
              <Search className="w-3 h-3" />
              <span className="text-xs">
                {dailySearchesRemaining}/3 {t('main.searchesToday')}
              </span>
            </div>
          )}

          {/* API Remaining - hidden on mobile */}
          {apiRemaining !== null && (
            <div className="badge badge-info hidden sm:flex">
              <span className="text-xs">
                API: {apiRemaining} {t('main.apiRequests')}
              </span>
            </div>
          )}

          {/* Fetch Button */}
          <button
            onClick={onFetch}
            disabled={loading || (isTrial && dailySearchesRemaining === 0)}
            className="btn-primary flex items-center gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('main.fetching') : t('main.fetchGames')}</span>
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              title={t('common.signOut')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Language Selector */}
      <div className="flex justify-center mt-4 sm:hidden">
        <LanguageSelector />
      </div>
    </header>
  );
}
