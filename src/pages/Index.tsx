import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Onboarding } from '@/components/Onboarding';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { MatchCard } from '@/components/MatchCard';
import { Loading } from '@/components/Loading';
import { Alert } from '@/components/Alert';
import { EmptyState } from '@/components/EmptyState';
import { AccumulatorsSection } from '@/components/AccumulatorsSection';
import { PremiumDoubleSection } from '@/components/PremiumDoubleSection';
import { FavoritesDoubleSection } from '@/components/FavoritesDoubleSection';
import { ZebraSection } from '@/components/ZebraSection';
import { TrialBanner } from '@/components/TrialBanner';
import { PricingSection } from '@/components/PricingSection';
import { DailyLimitPricingCards } from '@/components/DailyLimitPricingCards';
import { ReportExportSection } from '@/components/ReportExportSection';
import { GameFilters } from '@/components/GameFilters';
import { FreeUserBanner } from '@/components/FreeUserBanner';
import { TrackingStats } from '@/components/TrackingStats';
import { fetchOdds, FetchOddsError } from '@/services/oddsAPI';
import { Game } from '@/types/game';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

/**
 * Index Page - Main dashboard displaying games and analysis
 * Features: Game fetching, filtering, tier-based content access, 
 * accumulators, and special betting sections
 */

const Index = () => {
  const { trialDaysRemaining, isTrialExpired, signOut, subscription } = useAuth();
  const { isAdmin } = useAdmin();
  const { t, language, isTransitioning } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [apiRemaining, setApiRemaining] = useState<number | null>(null);
  const [dailySearchesRemaining, setDailySearchesRemaining] = useState<number | null>(null);
  const [isTrial, setIsTrial] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isToday, setIsToday] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'basic' | 'advanced' | 'premium'>('free');
  const [isFreeReport, setIsFreeReport] = useState(false);
  const [isFreeSource, setIsFreeSource] = useState(false);
  const [limitConfig, setLimitConfig] = useState<{ maxAccumulators?: number; maxZebras?: number; maxDoubles?: number }>({});
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('eugine_onboarding_done'));
  const previousLanguage = useRef(language);
  const gamesContentRef = useRef<HTMLDivElement>(null);
  
  // Cache key for localStorage (for premium offline access)
  const CACHE_KEY = 'eugine_premium_cache';
  const SESSION_KEY = 'eugine_session_games';
  const COOLDOWN_KEY = 'eugine_last_fetch';
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Cooldown timer tick every second
  useEffect(() => {
    const tick = () => {
      const lastFetch = sessionStorage.getItem(COOLDOWN_KEY);
      if (lastFetch && games.length > 0) {
        const elapsed = Date.now() - parseInt(lastFetch, 10);
        const remaining = Math.max(0, COOLDOWN_MS - elapsed);
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [games.length]);

  /**
   * Handles filtered games callback from GameFilters component
   * Updates the filteredGames state which is used for rendering
   */
  const handleFilteredGames = useCallback((filtered: Game[]) => {
    setFilteredGames(filtered);
  }, []);

  // Restore session data on mount (so back navigation preserves results)
  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed.games && parsed.games.length > 0 && games.length === 0) {
          setGames(parsed.games.map((g: any) => ({ ...g, startTime: new Date(g.startTime) })));
          setHasFetched(true);
          setAlertMessage(parsed.alertMessage || '');
          setIsToday(parsed.isToday ?? true);
          setUserTier(parsed.userTier || 'free');
          setIsTrial(parsed.isTrial ?? false);
          setDailySearchesRemaining(parsed.dailySearchesRemaining ?? null);
          setIsFreeReport(parsed.isFreeReport ?? false);
          setIsFreeSource(parsed.isFreeSource ?? false);
          if (parsed.limitConfig) setLimitConfig(parsed.limitConfig);
        }
      }
    } catch (e) {
      console.error('Error loading session cache:', e);
    }
  }, []);

  // Load cached data on mount (for premium offline access)
  useEffect(() => {
    if (userTier === 'premium') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          const cacheDate = new Date(parsedCache.cachedAt);
          const now = new Date();
          if ((now.getTime() - cacheDate.getTime()) < 24 * 60 * 60 * 1000) {
            if (parsedCache.games && parsedCache.games.length > 0 && games.length === 0) {
              setGames(parsedCache.games.map((g: any) => ({ ...g, startTime: new Date(g.startTime) })));
              setHasFetched(true);
              setAlertMessage(parsedCache.alertMessage || '');
              setIsToday(parsedCache.isToday ?? true);
            }
          }
        }
      } catch (e) {
        console.error('Error loading cache:', e);
      }
    }
  }, [userTier]);

  const handleFetchGames = useCallback(async () => {
    // Cooldown check: 5 minutes between searches
    const lastFetch = sessionStorage.getItem(COOLDOWN_KEY);
    if (lastFetch && games.length > 0) {
      const elapsed = Date.now() - parseInt(lastFetch, 10);
      if (elapsed < COOLDOWN_MS) {
        const remainingMin = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
        const cooldownMsg = language === 'pt' ? `Aguarde ${remainingMin} minuto(s) para buscar novamente.`
          : language === 'es' ? `Espera ${remainingMin} minuto(s) para buscar de nuevo.`
          : language === 'it' ? `Attendi ${remainingMin} minuto(i) per cercare di nuovo.`
          : `Wait ${remainingMin} minute(s) before searching again.`;
        setError(cooldownMsg);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setDailyLimitReached(false);

    try {
      const result = await fetchOdds(language);
      setGames(result.games);
      setApiRemaining(result.remaining);
      setIsToday(result.isToday);
      setAlertMessage(result.alertMessage);
      setHasFetched(true);
      if (result.dailySearchesRemaining !== undefined) {
        setDailySearchesRemaining(result.dailySearchesRemaining);
      }
      if (result.isTrial !== undefined) {
        setIsTrial(result.isTrial);
      }
      if (result.userTier) {
        setUserTier(result.userTier as 'free' | 'basic' | 'advanced' | 'premium');
      }
      if (result.isFreeReport !== undefined) {
        setIsFreeReport(result.isFreeReport);
      }
      if (result.isFreeSource !== undefined) {
        setIsFreeSource(result.isFreeSource);
      }
      const newLimitConfig: typeof limitConfig = {};
      if (result.maxAccumulators !== undefined || result.maxZebras !== undefined || result.maxDoubles !== undefined) {
        newLimitConfig.maxAccumulators = result.maxAccumulators;
        newLimitConfig.maxZebras = result.maxZebras;
        newLimitConfig.maxDoubles = result.maxDoubles;
        setLimitConfig(newLimitConfig);
      }

      // Save cooldown timestamp
      sessionStorage.setItem(COOLDOWN_KEY, Date.now().toString());

      // Save to sessionStorage so back navigation preserves results
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          games: result.games,
          alertMessage: result.alertMessage,
          isToday: result.isToday,
          userTier: result.userTier,
          isTrial: result.isTrial,
          dailySearchesRemaining: result.dailySearchesRemaining,
          isFreeReport: result.isFreeReport,
          isFreeSource: result.isFreeSource,
          limitConfig: newLimitConfig,
        }));
      } catch (e) {
        console.error('Error saving session cache:', e);
      }
      
      // Cache full data for premium users (offline access)
      if (result.userTier === 'premium' && result.fullAnalysisCached) {
        try {
          const cacheData = {
            games: result.games,
            alertMessage: result.alertMessage,
            isToday: result.isToday,
            cachedAt: new Date().toISOString()
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (e) {
          console.error('Error saving cache:', e);
        }
      }
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'dailyLimitReached' in err) {
        const fetchError = err as FetchOddsError;
        setDailyLimitReached(true);
        setDailySearchesRemaining(0);
        setError(fetchError.message);
      } else {
        const message = err instanceof Error ? err.message : t('main.unknownError');
        setError(message);
      }
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, [t, language, games.length]);

  // Rebuscar quando o idioma mudar (se já tiver buscado antes)
  useEffect(() => {
    if (hasFetched && previousLanguage.current !== language) {
      previousLanguage.current = language;
      setIsUpdatingLanguage(true);
      handleFetchGames().finally(() => setIsUpdatingLanguage(false));
    }
  }, [language, hasFetched, handleFetchGames]);

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8 relative">
      {/* Onboarding for first-time users */}
      {showOnboarding && (
        <Onboarding onComplete={() => {
          localStorage.setItem('eugine_onboarding_done', 'true');
          setShowOnboarding(false);
        }} />
      )}
      {/* Language Update Indicator */}
      {isUpdatingLanguage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/90 text-primary-foreground py-2 px-4 text-center text-sm font-medium animate-pulse">
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('main.updatingLanguage')}
          </span>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header 
          onFetch={handleFetchGames} 
          loading={loading} 
          apiRemaining={apiRemaining}
          onSignOut={signOut}
          dailySearchesRemaining={dailySearchesRemaining}
          isTrial={isTrial}
          subscriptionTier={subscription.tier}
          subscriptionLoading={subscription.isLoading}
          subscriptionEnd={subscription.subscriptionEnd}
          isAdmin={isAdmin}
          cooldownRemaining={cooldownRemaining}
        />

        {/* Trial Banner - only show for non-subscribers */}
        {!subscription.isSubscribed && (
          <TrialBanner daysRemaining={trialDaysRemaining} isExpired={isTrialExpired} />
        )}

        {/* Content */}
        <main>
          {/* Free User Daily Limit Reached Banner */}
          {dailyLimitReached && error && isFreeSource && (
            <FreeUserBanner type="limit-reached" />
          )}

          {/* Regular Daily Limit Reached Error with Pricing Cards (for trial users) */}
          {dailyLimitReached && error && !isFreeSource && (
            <div className="bg-gradient-to-br from-background/95 via-muted/90 to-background/95 border border-warning/30 rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-warning/30 to-destructive/30 flex items-center justify-center animate-pulse">
                  <Search className="w-10 h-10 text-warning" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-xl sm:text-2xl">{t('main.dailyLimitTitle')}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-md">{t('main.dailyLimitDesc')}</p>
                </div>
                <p className="text-warning font-semibold text-lg mt-2">
                  {t('main.dailyLimitUpgrade')}
                </p>
                
                {/* Inline Pricing Cards */}
                <DailyLimitPricingCards />
              </div>
            </div>
          )}

          {/* Regular Error State */}
          {error && !dailyLimitReached && (
            <Alert 
              type="error" 
              title={t('main.errorFetching')} 
              message={error} 
            />
          )}

          {/* Loading State */}
          {loading && <Loading />}

          {/* Empty State */}
          {!loading && !error && games.length === 0 && !hasFetched && (
            <EmptyState />
          )}

          {/* No Games Found */}
          {!loading && !error && games.length === 0 && hasFetched && (
            <Alert 
              type="success" 
              title={t('main.searchComplete')} 
              message={t('main.noGamesAvailable')} 
            />
          )}

          {/* Games List */}
          {!loading && games.length > 0 && (
            <div className="space-y-6">
              {/* Free User Partial Report Banner */}
              {isFreeReport && isFreeSource && (
                <FreeUserBanner type="partial-report" />
              )}
              
              {/* Day Alert */}
              <Alert 
                type={isToday ? "success" : "info"} 
                title={alertMessage} 
                message={isToday ? t('main.showingToday') : t('main.showingNext')} 
              />
              
              {/* Export Section - Premium Only */}
              <ReportExportSection 
                games={games} 
                userTier={userTier} 
                contentRef={gamesContentRef}
              />
              
              {/* Game Filters */}
              <GameFilters 
                games={games} 
                onFilteredGames={handleFilteredGames}
                userTier={userTier}
              />
              
              {/* Games Content for Export - Full Report */}
              <div ref={gamesContentRef} className="space-y-6" id="eugine-report-content">
                {/* Section Title */}
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground italic">
                    {t('matchCard.gamesOfDay')}
                    {filteredGames.length !== games.length && (
                      <span className="text-muted-foreground text-lg font-normal ml-2">
                        ({filteredGames.length}/{games.length})
                      </span>
                    )}
                  </h2>
                </div>

                {/* Match Cards - New Compact Design */}
                <div className="space-y-4">
                  {filteredGames.map((game, index) => (
                    <MatchCard 
                      key={game.id} 
                      game={game} 
                      delay={index}
                      userTier={userTier}
                    />
                  ))}
                </div>

                {/* Section 1: Accumulators */}
                <AccumulatorsSection games={games} userTier={userTier} maxAccumulators={limitConfig.maxAccumulators} />

                {/* Section 2: Premium Double */}
                {!isFreeReport && <PremiumDoubleSection games={games} />}

                {/* Section 3: Favorites Double (Premium Only) */}
                {userTier === 'premium' && !isFreeReport && <FavoritesDoubleSection games={games} />}

                {/* Section 4: Zebra of the Day */}
                <ZebraSection games={games} userTier={userTier} maxZebras={limitConfig.maxZebras} />
              </div>

              {/* Seção de Transparência / Resultados */}
              <div className="glass-card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {t('tracking.title') || 'Nossos Resultados'}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  {t('tracking.subtitle') || 'Transparência total. Aqui você vê o desempenho real das nossas sugestões.'}
                </p>
                <TrackingStats />
              </div>

              {/* Pricing Section - Outside export area */}
              <PricingSection />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 lg:mt-16 py-8 border-t border-border/30">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-sm font-semibold text-foreground">EUGINE</span>
            <p className="text-muted-foreground text-xs">
              by <span className="font-semibold">GS ItalyInvestments</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
              <a href="/termos-de-uso" className="hover:text-foreground transition-colors">{t('main.terms')}</a>
              <a href="/politica-de-privacidade" className="hover:text-foreground transition-colors">{t('main.privacy')}</a>
              <a href="/about" className="hover:text-foreground transition-colors">{t('main.about')}</a>
            </div>
            <p className="text-muted-foreground/40 text-[10px] sm:text-xs max-w-md">
              {t('main.disclaimer')}
            </p>
            <p className="text-muted-foreground/30 text-[10px]">
              © {new Date().getFullYear()} GS ItalyInvestments
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
