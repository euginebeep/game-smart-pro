import { useState, useMemo } from 'react';
import { Calendar, Trophy, Lightbulb, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameCardProps {
  game: Game;
  delay: number;
}

export function GameCard({ game, delay }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);

  const dateLocale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US';

  const formattedDate = new Date(game.startTime).toLocaleDateString(dateLocale, {
    day: '2-digit',
    month: '2-digit',
  });

  const formattedTime = new Date(game.startTime).toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bestOdd = Math.max(game.odds.home, game.odds.draw, game.odds.away);

  return (
    <article 
      className="glass-card p-4 sm:p-6 lg:p-8 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay * 150}ms` }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          {/* Teams */}
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-2 sm:mb-3">
            {game.homeTeam}
            <span className="text-muted-foreground font-normal mx-1 sm:mx-2 text-sm sm:text-base lg:text-lg">vs</span>
            {game.awayTeam}
          </h2>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {/* Day Badge */}
            {game.dayLabel && (
              <div className={`badge text-[10px] sm:text-xs ${
                game.dayType === 'today' 
                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                  : game.dayType === 'tomorrow'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                <span className="font-semibold">{game.dayLabel}</span>
              </div>
            )}
            <div className="badge badge-info text-[10px] sm:text-xs">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{formattedTime}</span>
            </div>
            <div className="badge badge-success text-[10px] sm:text-xs">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[100px] sm:max-w-none">{game.league}</span>
            </div>
          </div>
        </div>

        {/* Main Odd */}
        <div className="text-left sm:text-right mt-2 lg:mt-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
            {t('gameCard.bestOdd')}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-success">
            {bestOdd.toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{game.bookmaker}</p>
        </div>
      </div>

      {/* Analysis Boxes */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 mb-4 sm:mb-6">
        {/* Bet Recommendation */}
        <div className="analysis-box analysis-box-success p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="font-bold text-primary uppercase tracking-wide text-xs sm:text-sm">
              {analysis.type}
            </h3>
          </div>
          <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
            {analysis.reason}
          </p>
          <div className="bg-primary/20 rounded-lg sm:rounded-xl p-2 sm:p-3 inline-block">
            <p className="text-xs sm:text-sm">
              <span className="text-muted-foreground">{t('gameCard.bet')} 40 → </span>
              <span className="text-primary font-bold">
                {t('gameCard.profit')} {analysis.profit.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="analysis-box analysis-box-warning p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            <h3 className="font-bold text-warning uppercase tracking-wide text-xs sm:text-sm">
              {t('gameCard.marketAnalysis')}
            </h3>
          </div>
          <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed">
            {t('gameCard.marketPricing')} {game.odds.home < game.odds.away 
              ? `${game.homeTeam} ${t('gameCard.asFavorite')}` 
              : game.odds.home > game.odds.away 
                ? `${game.awayTeam} ${t('gameCard.asFavorite')}`
                : t('gameCard.balancedGame')
            }. 
            {game.odds.draw > 0 && game.odds.draw < 3.5 && 
              ` ${t('gameCard.highDrawProb')}`}
            {game.odds.over > 0 && game.odds.over < 2.0 && 
              ` ${t('gameCard.manyGoalsExpected')}`}
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
          {expanded ? t('gameCard.hideAllOdds') : t('gameCard.showAllOdds')}
        </button>

        {expanded && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in-up">
            <OddBox label={t('gameCard.home')} value={game.odds.home} />
            <OddBox label={t('gameCard.draw')} value={game.odds.draw} />
            <OddBox label={t('gameCard.away')} value={game.odds.away} />
            <OddBox label={t('gameCard.over')} value={game.odds.over} highlight />
            <OddBox label={t('gameCard.under')} value={game.odds.under} />
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