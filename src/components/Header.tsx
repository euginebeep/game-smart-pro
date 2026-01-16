import { Zap, TrendingUp, LogOut, Search, Crown, Sparkles, Loader2, Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onFetch: () => void;
  loading: boolean;
  apiRemaining: number | null;
  onSignOut?: () => void;
  dailySearchesRemaining?: number | null;
  isTrial?: boolean;
  subscriptionTier?: 'free' | 'basic' | 'advanced' | 'premium';
  subscriptionLoading?: boolean;
  subscriptionEnd?: string | null;
  isAdmin?: boolean;
}

const tierConfig = {
  free: {
    label: 'Trial',
    icon: Sparkles,
    className: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
    iconClassName: 'text-slate-400',
  },
  basic: {
    label: 'Basic',
    icon: Zap,
    className: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    iconClassName: 'text-blue-400',
  },
  advanced: {
    label: 'Advanced',
    icon: TrendingUp,
    className: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    iconClassName: 'text-emerald-400',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    className: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    iconClassName: 'text-amber-400',
  },
};

export function Header({ 
  onFetch, 
  loading, 
  apiRemaining, 
  onSignOut, 
  dailySearchesRemaining, 
  isTrial,
  subscriptionTier = 'free',
  subscriptionLoading = false,
  subscriptionEnd,
  isAdmin = false,
}: HeaderProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const currentTier = tierConfig[subscriptionTier] || tierConfig.free;
  const TierIcon = currentTier.icon;
  
  // Calculate days until subscription expires
  const getDaysUntilExpiry = () => {
    if (!subscriptionEnd) return null;
    const endDate = new Date(subscriptionEnd);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const daysRemaining = getDaysUntilExpiry();
  
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
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Animated Logo */}
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center animate-pulse-slow shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(160 84% 39%) 100%)',
              boxShadow: '0 0 30px hsla(160, 84%, 39%, 0.4)'
            }}
          >
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black gradient-text tracking-tight whitespace-nowrap">
              EUGINE v3.0
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium hidden sm:block">
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

          {/* Subscription Tier Badge */}
          <div className={`badge flex items-center gap-1.5 transition-all duration-300 ${currentTier.className}`}>
            {subscriptionLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">...</span>
              </>
            ) : (
              <>
                <TierIcon className={`w-3 h-3 ${currentTier.iconClassName}`} />
                <span className="text-xs font-medium">{currentTier.label}</span>
              </>
            )}
          </div>

          {/* Subscription Expiry Badge (for active subscribers) */}
          {!subscriptionLoading && subscriptionTier !== 'free' && daysRemaining !== null && (
            <div className={`badge flex items-center gap-1.5 ${
              daysRemaining <= 3 
                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                : daysRemaining <= 7 
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                {daysRemaining} {daysRemaining === 1 ? t('main.dayLeft') : t('main.daysLeft')}
              </span>
            </div>
          )}

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
            className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base px-4 py-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('main.fetching') : t('main.fetchGames')}</span>
          </button>

          {/* Admin Button */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 transition-colors border border-purple-500/30"
              title="Painel Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

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
