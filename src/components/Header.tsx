import { Zap, LogOut, Search, Shield } from 'lucide-react';
import eugineLogo from '@/assets/eugine-logo-horizontal.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';
import { ActiveUsersCounter } from './ActiveUsersCounter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  free: { label: 'Trial', className: 'border-border text-muted-foreground', style: { background: 'rgba(255,255,255,0.05)' } },
  basic: { label: 'Basic', className: 'border-primary/30 text-primary', style: { background: 'rgba(0,180,216,0.1)' } },
  advanced: { label: 'Advanced', className: 'border', style: { background: 'rgba(34,197,94,0.1)', color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)' } },
  premium: { label: 'Premium', className: 'border font-bold', style: { background: 'rgba(255,215,0,0.15)', color: '#FFD700', borderColor: 'rgba(255,215,0,0.4)' } },
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
          <img src={eugineLogo} alt="EUGINE" className="h-10 sm:h-12 w-auto" />
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
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${currentTier.className}`} style={currentTier.style}>
              {currentTier.label}
            </span>
          )}

          {/* Trial searches remaining */}
          {isTrial && dailySearchesRemaining !== null && dailySearchesRemaining !== undefined && dailySearchesRemaining >= 0 && (
            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${dailySearchesRemaining === 0 ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-warning/15 text-warning border-warning/30'}`}>
              <Search className="w-3 h-3" />
              {dailySearchesRemaining}/3
            </span>
          )}

          {/* Fetch CTA with cooldown timer */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onFetch}
                  disabled={loading || (isTrial && dailySearchesRemaining === 0) || cooldownRemaining > 0}
                  className="flex items-center gap-2 text-sm px-5 py-2 min-w-[130px] justify-center disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden rounded-lg font-bold transition-all duration-300 hover:opacity-90"
                  style={{ background: '#FFD700', color: '#0A1A2F', boxShadow: '0 4px 16px rgba(255,215,0,0.3)' }}
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
              </TooltipTrigger>
              {cooldownRemaining > 0 && (
                <TooltipContent side="bottom" className="max-w-[200px] text-center">
                  <p className="text-xs">{t('main.cooldownTooltip')}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

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
