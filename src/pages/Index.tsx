import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { Loading } from '@/components/Loading';
import { Alert } from '@/components/Alert';
import { EmptyState } from '@/components/EmptyState';
import { AccumulatorsSection } from '@/components/AccumulatorsSection';
import { PremiumDoubleSection } from '@/components/PremiumDoubleSection';
import { ZebraSection } from '@/components/ZebraSection';
import { TrialBanner } from '@/components/TrialBanner';
import { PricingSection } from '@/components/PricingSection';
import { DailyLimitPricingCards } from '@/components/DailyLimitPricingCards';
import { fetchOdds, FetchOddsError } from '@/services/oddsAPI';
import { Game } from '@/types/game';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search } from 'lucide-react';

const Index = () => {
  const { trialDaysRemaining, isTrialExpired, signOut, subscription } = useAuth();
  const { isAdmin } = useAdmin();
  const { t, language, isTransitioning } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
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
  const previousLanguage = useRef(language);

  const handleFetchGames = useCallback(async () => {
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
    } catch (err) {
      // Verificar se é erro de limite diário
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
  }, [t, language]);

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
          isAdmin={isAdmin}
        />

        {/* Trial Banner */}
        <TrialBanner daysRemaining={trialDaysRemaining} isExpired={isTrialExpired} />

        {/* Content */}
        <main>
          {/* Daily Limit Reached Error with Pricing Cards */}
          {dailyLimitReached && error && (
            <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-amber-500/30 rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center animate-pulse">
                  <Search className="w-10 h-10 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl sm:text-2xl">{t('main.dailyLimitTitle')}</h3>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-md">{t('main.dailyLimitDesc')}</p>
                </div>
                <p className="text-amber-400 font-semibold text-lg mt-2">
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
              {/* Day Alert */}
              <Alert 
                type={isToday ? "success" : "info"} 
                title={alertMessage} 
                message={isToday ? t('main.showingToday') : t('main.showingNext')} 
              />
              
              {/* Game Cards */}
              {games.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  delay={index}
                  userTier={userTier}
                />
              ))}

              {/* NEW SECTIONS */}
              
              {/* Section 1: Accumulators */}
              <AccumulatorsSection games={games} />

              {/* Section 2: Premium Double */}
              <PremiumDoubleSection games={games} />

              {/* Section 3: Zebra of the Day */}
              <ZebraSection games={games} />

              {/* Pricing Section */}
              <PricingSection />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 lg:mt-16 text-center px-2">
          <p className="text-muted-foreground text-xs sm:text-sm">
            EUGINE v3.0 • {t('main.footer')} <span className="text-accent font-semibold">GS ITALYINVESTMENTS</span>
          </p>
          <p className="text-muted-foreground/60 text-[10px] sm:text-xs mt-1 sm:mt-2">
            {t('main.disclaimer')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
