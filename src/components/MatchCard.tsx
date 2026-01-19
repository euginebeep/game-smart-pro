import { useState, useMemo } from 'react';
import { ChevronRight, Clock, Trophy } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GameCard } from '@/components/GameCard';

interface MatchCardProps {
  game: Game;
  delay: number;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function MatchCard({ game, delay, userTier = 'free' }: MatchCardProps) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);

  // Format time from startTime
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get tier button configuration
  const getTierConfig = () => {
    switch (userTier) {
      case 'premium':
        return {
          buttonStyle: 'bg-blue-600 hover:bg-blue-700',
          showFullData: true,
        };
      case 'advanced':
        return {
          buttonStyle: 'bg-emerald-600 hover:bg-emerald-700',
          showFullData: true,
        };
      case 'basic':
        return {
          buttonStyle: 'bg-amber-600 hover:bg-amber-700',
          showFullData: false,
        };
      default:
        return {
          buttonStyle: 'bg-slate-600 hover:bg-slate-700',
          showFullData: false,
        };
    }
  };

  const config = getTierConfig();

  // Calculate probabilities from odds
  const calculateProbability = (odd: number) => {
    if (!odd || odd <= 0) return 0;
    return Math.round((1 / odd) * 100);
  };

  const homeProb = calculateProbability(game.odds.home);
  const drawProb = calculateProbability(game.odds.draw);
  const awayProb = calculateProbability(game.odds.away);

  // Get bet suggestion with team name and location
  const getBetSuggestion = () => {
    if (!analysis) {
      return {
        text: t('matchCard.finalResult'),
        team: '',
        location: '',
      };
    }

    const type = analysis.type.toLowerCase();
    
    // Check for home win
    if (type.includes('casa') || type.includes('home') || type.includes('1x')) {
      return {
        text: language === 'pt' ? 'Vitória' : language === 'es' ? 'Victoria' : language === 'it' ? 'Vittoria' : 'Victory',
        team: game.homeTeam,
        location: language === 'pt' ? '(Casa)' : language === 'es' ? '(Local)' : language === 'it' ? '(Casa)' : '(Home)',
      };
    }
    
    // Check for away win
    if (type.includes('fora') || type.includes('away') || type.includes('x2')) {
      return {
        text: language === 'pt' ? 'Vitória' : language === 'es' ? 'Victoria' : language === 'it' ? 'Vittoria' : 'Victory',
        team: game.awayTeam,
        location: language === 'pt' ? '(Fora)' : language === 'es' ? '(Visitante)' : language === 'it' ? '(Trasferta)' : '(Away)',
      };
    }

    // Check for draw
    if (type.includes('empate') || type.includes('draw') || type.includes('pareggio')) {
      return {
        text: language === 'pt' ? 'Empate' : language === 'es' ? 'Empate' : language === 'it' ? 'Pareggio' : 'Draw',
        team: '',
        location: '',
      };
    }

    // Check for BTTS
    if (type.includes('btts') || type.includes('ambos') || type.includes('both')) {
      return {
        text: language === 'pt' ? 'Ambos Marcam' : language === 'es' ? 'Ambos Marcan' : language === 'it' ? 'Entrambe Segnano' : 'Both Teams Score',
        team: '',
        location: '',
      };
    }

    // Check for over/under
    if (type.includes('over') || type.includes('mais') || type.includes('sopra')) {
      return {
        text: type.includes('2.5') ? 'Over 2.5' : type.includes('3.5') ? 'Over 3.5' : 'Over 2.5',
        team: '',
        location: '',
      };
    }

    if (type.includes('under') || type.includes('menos') || type.includes('sotto')) {
      return {
        text: type.includes('2.5') ? 'Under 2.5' : type.includes('1.5') ? 'Under 1.5' : 'Under 2.5',
        team: '',
        location: '',
      };
    }

    // Double chance
    if (type.includes('dupla') || type.includes('double')) {
      if (type.includes('1x') || type.includes('casa')) {
        return {
          text: `${game.homeTeam}`,
          team: language === 'pt' ? 'ou Empate' : language === 'es' ? 'o Empate' : 'or Draw',
          location: '',
        };
      }
      if (type.includes('x2') || type.includes('fora')) {
        return {
          text: `${game.awayTeam}`,
          team: language === 'pt' ? 'ou Empate' : language === 'es' ? 'o Empate' : 'or Draw',
          location: '',
        };
      }
    }

    // Default to the analysis type
    return {
      text: analysis.type,
      team: '',
      location: '',
    };
  };

  const betSuggestion = getBetSuggestion();

  return (
    <article
      className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-700/50 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="p-4 sm:p-5">
        {/* Main Grid: Teams | Analysis | Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Teams Section with Logos */}
          <div className="flex-shrink-0 sm:min-w-[200px]">
            {/* Home Team */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId || 0}.png`}
                alt={game.homeTeam}
                className="w-10 h-10 object-contain rounded-lg bg-slate-800/50 p-1.5"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span className="text-white font-bold text-base sm:text-lg truncate max-w-[140px]">
                {game.homeTeam}
              </span>
            </div>
            
            {/* Away Team */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId || 0}.png`}
                alt={game.awayTeam}
                className="w-10 h-10 object-contain rounded-lg bg-slate-800/50 p-1.5"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span className="text-white font-semibold text-sm sm:text-base truncate max-w-[140px]">
                {game.awayTeam}
              </span>
            </div>

            {/* Time and League */}
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">{formatTime(game.startTime)}</span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5">
                {game.leagueLogo && (
                  <img
                    src={game.leagueLogo}
                    alt={game.league}
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="truncate max-w-[120px]">{game.league}</span>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-24 w-px bg-slate-700/50" />

          {/* Analysis Section */}
          <div className="flex-1 space-y-3">
            {/* Suggested Bet */}
            <div>
              <p className="text-slate-400 text-xs mb-1">{t('matchCard.suggestedBet')}:</p>
              <p className="text-emerald-400 font-bold text-lg sm:text-xl leading-tight">
                {betSuggestion.text}
                {betSuggestion.team && (
                  <span className="text-emerald-400"> {betSuggestion.team}</span>
                )}
                {betSuggestion.location && (
                  <span className="text-slate-400 font-normal text-base ml-1">{betSuggestion.location}</span>
                )}
              </p>
            </div>

            {/* Confidence and Value Row */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-slate-400 text-xs">{t('matchCard.confidence')}:</p>
                <p className="text-white font-bold text-lg">
                  {analysis?.confidence || 0}%
                </p>
              </div>
              {analysis?.valuePercentage && analysis.valuePercentage > 0 && (
                <div>
                  <p className="text-slate-400 text-xs">{t('matchCard.value')}:</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    +{analysis.valuePercentage.toFixed(0)}%
                  </p>
                </div>
              )}
            </div>

            {/* Odds Row */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 bg-slate-800/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-400 text-xs">1</span>
                <span className="text-white font-semibold text-sm">{game.odds.home.toFixed(2)}</span>
                <span className="text-slate-500 text-[10px]">({homeProb}%)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-400 text-xs">X</span>
                <span className="text-white font-semibold text-sm">{game.odds.draw.toFixed(2)}</span>
                <span className="text-slate-500 text-[10px]">({drawProb}%)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/70 px-2.5 py-1.5 rounded-lg">
                <span className="text-slate-400 text-xs">2</span>
                <span className="text-white font-semibold text-sm">{game.odds.away.toFixed(2)}</span>
                <span className="text-slate-500 text-[10px]">({awayProb}%)</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="sm:ml-4 flex-shrink-0">
            <Dialog open={showFullAnalysis} onOpenChange={setShowFullAnalysis}>
              <DialogTrigger asChild>
                <button
                  className={`inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-bold text-sm text-white transition-all duration-200 min-w-[140px] ${config.buttonStyle}`}
                >
                  <span className="leading-tight text-center">
                    {language === 'pt' ? 'Ver Análise' : language === 'es' ? 'Ver Análisis' : language === 'it' ? 'Vedi Analisi' : 'View Analysis'}
                    <br />
                    {language === 'pt' ? 'Completa' : language === 'es' ? 'Completa' : language === 'it' ? 'Completa' : 'Complete'}
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                <GameCard game={game} delay={0} userTier={userTier} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </article>
  );
}
