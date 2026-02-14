import { Zap, TrendingUp, LogOut, Search, Crown, Sparkles, Loader2, Shield, ChevronDown, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { ActiveUsersCounter } from './ActiveUsersCounter';

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
  cooldownRemaining?: number;
}

const tierConfig = {
  free: { label: 'Trial', className: 'bg-muted/60 text-muted-foreground border-border' },
  basic: { label: 'Basic', className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  advanced: { label: 'Advanced', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  premium: { label: 'Premium', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
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
  cooldownRemaining = 0,
}: HeaderProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const currentTier = tierConfig[subscriptionTier] || tierConfig.free;

  return (
    <header className="mb-6 sm:mb-8 lg:mb-10">
      <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(160 70% 40%) 100%)',
            }}
          >
            <TrendingUp className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-none">
              EUGINE
            </h1>
            <p className="text-muted-foreground text-[11px] font-medium leading-none mt-0.5">
              Sports Analytics
            </p>
          </div>
        </div>

        {/* Center: Navigation + Active Users - desktop only */}
        <div className="hidden lg:flex items-center gap-3">
          <nav className="flex items-center gap-1">
            <Link 
              to="/"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/about"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {language === 'pt' ? 'Sobre' : language === 'es' ? 'Acerca' : language === 'it' ? 'Chi siamo' : 'About'}
            </Link>
          </nav>
          <ActiveUsersCounter />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector (dropdown) */}
          <LanguageSelector />

          {/* Tier Badge */}
          {!subscriptionLoading && (
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${currentTier.className}`}>
              {currentTier.label}
            </span>
          )}

          {/* Trial searches remaining */}
          {isTrial && dailySearchesRemaining !== null && dailySearchesRemaining !== undefined && dailySearchesRemaining >= 0 && (
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${dailySearchesRemaining === 0 ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}`}>
              <Search className="w-3 h-3" />
              {dailySearchesRemaining}/3
            </span>
          )}

          {/* Fetch CTA with cooldown timer */}
          <button
            onClick={onFetch}
            disabled={loading || (isTrial && dailySearchesRemaining === 0) || cooldownRemaining > 0}
            className="btn-primary flex items-center gap-2 text-sm px-5 py-2 min-w-[130px] justify-center disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {cooldownRemaining > 0 && (
              <div 
                className="absolute inset-0 bg-muted/30" 
                style={{ width: `${(cooldownRemaining / (5 * 60 * 1000)) * 100}%`, transition: 'width 1s linear' }} 
              />
            )}
            <span className="relative flex items-center gap-2">
              <Zap className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              {cooldownRemaining > 0 ? (
                <span>{Math.floor(cooldownRemaining / 60000)}:{String(Math.floor((cooldownRemaining % 60000) / 1000)).padStart(2, '0')}</span>
              ) : (
                <span>{loading ? t('main.fetching') : t('main.fetchGames')}</span>
              )}
            </span>
          </button>

          {/* Admin */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Admin"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* Sign Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={t('common.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
