import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { Loading } from '@/components/Loading';
import { Alert } from '@/components/Alert';
import { EmptyState } from '@/components/EmptyState';
import { fetchOdds } from '@/services/oddsAPI';
import { Game } from '@/types/game';

const Index = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiRemaining, setApiRemaining] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const handleFetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { games: fetchedGames, remaining } = await fetchOdds();
      setGames(fetchedGames);
      setApiRemaining(remaining);
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
        />

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
              {/* Success indicator */}
              <Alert 
                type="success" 
                title={`${games.length} jogos encontrados!`} 
                message="Análises geradas automaticamente com base nas odds atuais." 
              />
              
              {/* Game Cards */}
              {games.map((game, index) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  delay={index} 
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            EUGINE v3.0 • Dados fornecidos por{' '}
            <a 
              href="https://the-odds-api.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              The Odds API
            </a>
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
