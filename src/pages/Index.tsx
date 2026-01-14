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
import { fetchOdds } from '@/services/oddsAPI';
import { Game } from '@/types/game';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { trialDaysRemaining, isTrialExpired, signOut } = useAuth();
  const { t, language } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRemaining, setApiRemaining] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isToday, setIsToday] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const previousLanguage = useRef(language);

  const handleFetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { games: fetchedGames, remaining, isToday: today, alertMessage: msg } = await fetchOdds(language);
      setGames(fetchedGames);
      setApiRemaining(remaining);
      setIsToday(today);
      setAlertMessage(msg);
      setHasFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('main.unknownError');
      setError(message);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, [t, language]);

  // Rebuscar quando o idioma mudar (se já tiver buscado antes)
  useEffect(() => {
    if (hasFetched && previousLanguage.current !== language) {
      previousLanguage.current = language;
      handleFetchGames();
    }
  }, [language, hasFetched, handleFetchGames]);

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header 
          onFetch={handleFetchGames} 
          loading={loading} 
          apiRemaining={apiRemaining}
          onSignOut={signOut}
        />

        {/* Trial Banner */}
        <TrialBanner daysRemaining={trialDaysRemaining} isExpired={isTrialExpired} />

        {/* Content */}
        <main>
          {/* Error State */}
          {error && (
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
                />
              ))}

              {/* NEW SECTIONS */}
              
              {/* Section 1: Accumulators */}
              <AccumulatorsSection games={games} />

              {/* Section 2: Premium Double */}
              <PremiumDoubleSection games={games} />

              {/* Section 3: Zebra of the Day */}
              <ZebraSection games={games} />
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
