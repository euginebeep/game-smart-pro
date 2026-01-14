import { useState, useCallback } from 'react';
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

const Index = () => {
  const { trialDaysRemaining, isTrialExpired, signOut } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRemaining, setApiRemaining] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [isToday, setIsToday] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');

  const handleFetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { games: fetchedGames, remaining, isToday: today, alertMessage: msg } = await fetchOdds();
      setGames(fetchedGames);
      setApiRemaining(remaining);
      setIsToday(today);
      setAlertMessage(msg);
      setHasFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao buscar jogos';
      setError(message);
      console.error('Erro ao buscar jogos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8">
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
              title="Erro ao buscar jogos" 
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
              title="Busca concluída" 
              message="Nenhum jogo de futebol disponível no momento. Tente novamente mais tarde." 
            />
          )}

          {/* Games List */}
          {!loading && games.length > 0 && (
            <div className="space-y-6">
              {/* Day Alert */}
              <Alert 
                type={isToday ? "success" : "info"} 
                title={alertMessage} 
                message={
                  isToday 
                    ? "Mostrando jogos de hoje que começam em mais de 10 minutos"
                    : "Não há jogos hoje. Mostrando próximos jogos disponíveis"
                } 
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
        <footer className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            EUGINE v3.0 • uma Empresa Do Grupo <span className="text-accent font-semibold">GS ITALYINVESTMENTS</span>
          </p>
          <p className="text-muted-foreground/60 text-xs mt-2">
            ⚠️ Aposte com responsabilidade. Este sistema é apenas para fins educacionais.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
