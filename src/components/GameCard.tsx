import { useState, useMemo } from 'react';
import { Calendar, Trophy, Lightbulb, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';

interface GameCardProps {
  game: Game;
  delay: number;
}

export function GameCard({ game, delay }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);

  const analysis = useMemo(() => analyzeBet(game), [game]);

  const formattedDate = new Date(game.startTime).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  const formattedTime = new Date(game.startTime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bestOdd = Math.max(game.odds.home, game.odds.draw, game.odds.away);

  return (
    <article 
      className="glass-card p-6 lg:p-8 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay * 150}ms` }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          {/* Teams */}
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-3">
            {game.homeTeam}
            <span className="text-muted-foreground font-normal mx-2">vs</span>
            {game.awayTeam}
          </h2>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="badge badge-info">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate} às {formattedTime}</span>
            </div>
            <div className="badge badge-success">
              <Trophy className="w-4 h-4" />
              <span>{game.league}</span>
            </div>
          </div>
        </div>

        {/* Main Odd */}
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Melhor Odd
          </p>
          <p className="text-4xl lg:text-5xl font-black gradient-text-success">
            {bestOdd.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{game.bookmaker}</p>
        </div>
      </div>

      {/* Analysis Boxes */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        {/* Bet Recommendation */}
        <div className="analysis-box analysis-box-success">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-primary uppercase tracking-wide text-sm">
              {analysis.type}
            </h3>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed mb-4">
            {analysis.reason}
          </p>
          <div className="bg-primary/20 rounded-xl p-3 inline-block">
            <p className="text-sm">
              <span className="text-muted-foreground">Aposta R$ 40 → </span>
              <span className="text-primary font-bold">
                Lucro R$ {analysis.profit.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="analysis-box analysis-box-warning">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="font-bold text-warning uppercase tracking-wide text-sm">
              Análise de Mercado
            </h3>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed">
            O mercado está precificando odds que indicam {game.odds.home < game.odds.away 
              ? `${game.homeTeam} como favorito` 
              : game.odds.home > game.odds.away 
                ? `${game.awayTeam} como favorito`
                : 'um jogo equilibrado'
            }. 
            {game.odds.draw > 0 && game.odds.draw < 3.5 && 
              ' Alta probabilidade de empate segundo as casas.'}
            {game.odds.over > 0 && game.odds.over < 2.0 && 
              ' Expectativa de jogo com muitos gols.'}
          </p>
        </div>
      </div>

      {/* Expandable Odds */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-semibold text-sm"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Ocultar todas as odds' : 'Ver todas as odds'}
        </button>

        {expanded && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in-up">
            <OddBox label="Casa" value={game.odds.home} />
            <OddBox label="Empate" value={game.odds.draw} />
            <OddBox label="Fora" value={game.odds.away} />
            <OddBox label="Over 2.5" value={game.odds.over} highlight />
            <OddBox label="Under 2.5" value={game.odds.under} />
          </div>
        )}
      </div>
    </article>
  );
}

function OddBox({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  if (!value || value === 0) return null;
  
  return (
    <div className={`rounded-xl p-3 text-center ${
      highlight 
        ? 'bg-primary/20 border border-primary/30' 
        : 'bg-secondary/50 border border-border'
    }`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value.toFixed(2)}
      </p>
    </div>
  );
}
