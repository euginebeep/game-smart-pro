import { useState, useMemo } from 'react';
import { Clock, TrendingUp, Target, Zap, ChevronRight } from 'lucide-react';
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

  // Format time
  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate probabilities from odds
  const calculateProbability = (odd: number) => {
    if (!odd || odd <= 0) return 0;
    return Math.round((1 / odd) * 100);
  };

  const homeProb = calculateProbability(game.odds.home);
  const drawProb = calculateProbability(game.odds.draw);
  const awayProb = calculateProbability(game.odds.away);

  // Labels based on language
  const labels = {
    pt: {
      suggestedBet: 'Aposta Recomendada',
      confidence: 'Probabilidade',
      value: 'Vantagem Matemática',
      viewAnalysis: 'Ver Análise Completa',
      home: 'Vitória Casa',
      draw: 'Empate',
      away: 'Vitória Fora',
      victory: 'Vitória',
      homeLabel: '(Casa)',
      awayLabel: '(Fora)',
    },
    en: {
      suggestedBet: 'Recommended Bet',
      confidence: 'Probability',
      value: 'Mathematical Edge',
      viewAnalysis: 'View Full Analysis',
      home: 'Home Win',
      draw: 'Draw',
      away: 'Away Win',
      victory: 'Victory',
      homeLabel: '(Home)',
      awayLabel: '(Away)',
    },
    es: {
      suggestedBet: 'Apuesta Recomendada',
      confidence: 'Probabilidad',
      value: 'Ventaja Matemática',
      viewAnalysis: 'Ver Análisis Completo',
      home: 'Victoria Local',
      draw: 'Empate',
      away: 'Victoria Visitante',
      victory: 'Victoria',
      homeLabel: '(Local)',
      awayLabel: '(Visitante)',
    },
    it: {
      suggestedBet: 'Scommessa Consigliata',
      confidence: 'Probabilità',
      value: 'Vantaggio Matematico',
      viewAnalysis: 'Vedi Analisi Completa',
      home: 'Vittoria Casa',
      draw: 'Pareggio',
      away: 'Vittoria Trasferta',
      victory: 'Vittoria',
      homeLabel: '(Casa)',
      awayLabel: '(Trasferta)',
    },
  };

  const l = labels[language] || labels.pt;

  // Get bet suggestion with team name
  const getBetSuggestion = () => {
    if (!analysis) return { text: '-', subtext: '' };

    const type = analysis.type.toLowerCase();

    if (type.includes('casa') || type.includes('home') || type.includes('1x')) {
      return {
        text: `${l.victory} ${game.homeTeam}`,
        subtext: l.homeLabel,
      };
    }

    if (type.includes('fora') || type.includes('away') || type.includes('x2')) {
      return {
        text: `${l.victory} ${game.awayTeam}`,
        subtext: l.awayLabel,
      };
    }

    if (type.includes('empate') || type.includes('draw') || type.includes('pareggio')) {
      return { text: l.draw, subtext: '' };
    }

    if (type.includes('btts') || type.includes('ambos') || type.includes('both')) {
      return {
        text: language === 'pt' ? 'Ambos Marcam - Sim' : 'Both Teams Score - Yes',
        subtext: '',
      };
    }

    if (type.includes('over')) {
      return { text: type.includes('3.5') ? 'Over 3.5 Gols' : 'Over 2.5 Gols', subtext: '' };
    }

    if (type.includes('under')) {
      return { text: type.includes('1.5') ? 'Under 1.5 Gols' : 'Under 2.5 Gols', subtext: '' };
    }

    return { text: analysis.type, subtext: '' };
  };

  const betSuggestion = getBetSuggestion();

  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-emerald-400';
    if (conf >= 65) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <article
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/95 via-slate-850/95 to-slate-900/95 border border-slate-600/30 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 animate-fade-in-up opacity-0 hover:border-slate-500/40"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5 sm:p-6">
        {/* Header: Time & League */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-semibold text-sm">{formatTime(game.startTime)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {game.leagueLogo && (
              <img
                src={game.leagueLogo}
                alt={game.league}
                className="w-5 h-5 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="text-slate-300 text-sm font-medium">{game.league}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          
          {/* Teams Section */}
          <div className="flex-shrink-0 lg:min-w-[220px]">
            {/* Home Team */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-2 shadow-lg">
                  <img
                    src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId || 0}.png`}
                    alt={game.homeTeam}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {language === 'pt' ? 'CASA' : 'HOME'}
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{game.homeTeam}</p>
                <p className="text-slate-400 text-xs mt-0.5">{l.home}</p>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-3 my-3 ml-5">
              <div className="w-6 h-6 rounded-full bg-slate-700/80 flex items-center justify-center">
                <span className="text-slate-400 text-[10px] font-bold">VS</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-600/50 to-transparent" />
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-2 shadow-lg">
                  <img
                    src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId || 0}.png`}
                    alt={game.awayTeam}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {language === 'pt' ? 'FORA' : 'AWAY'}
                </span>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{game.awayTeam}</p>
                <p className="text-slate-400 text-xs mt-0.5">{l.away}</p>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px h-36 bg-gradient-to-b from-transparent via-slate-600/50 to-transparent" />

          {/* Analysis Section */}
          <div className="flex-1 space-y-5">
            {/* Odds Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-slate-700/40 border border-slate-600/30">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{l.home.split(' ')[0]}</p>
                <p className="text-white font-bold text-xl">{game.odds.home.toFixed(2)}</p>
                <p className="text-emerald-400 text-xs font-medium">{homeProb}%</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-700/40 border border-slate-600/30">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{l.draw}</p>
                <p className="text-white font-bold text-xl">{game.odds.draw.toFixed(2)}</p>
                <p className="text-yellow-400 text-xs font-medium">{drawProb}%</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-700/40 border border-slate-600/30">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">{l.away.split(' ')[0]}</p>
                <p className="text-white font-bold text-xl">{game.odds.away.toFixed(2)}</p>
                <p className="text-blue-400 text-xs font-medium">{awayProb}%</p>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-wider mb-1">
                    {l.suggestedBet}
                  </p>
                  <p className="text-white font-bold text-lg leading-tight truncate">
                    {betSuggestion.text}
                    {betSuggestion.subtext && (
                      <span className="text-slate-400 font-normal text-sm ml-2">{betSuggestion.subtext}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase">{l.confidence}</p>
                    <p className={`font-bold text-lg ${getConfidenceColor(analysis?.confidence || 0)}`}>
                      {analysis?.confidence || 0}%
                    </p>
                  </div>
                </div>
                {analysis?.valuePercentage && analysis.valuePercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase">{l.value}</p>
                      <p className="text-emerald-400 font-bold text-lg">+{analysis.valuePercentage.toFixed(0)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="lg:ml-4 flex-shrink-0">
            <Dialog open={showFullAnalysis} onOpenChange={setShowFullAnalysis}>
              <DialogTrigger asChild>
                <button className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-900/30 transition-all duration-300 hover:shadow-emerald-800/40 hover:scale-[1.02] active:scale-[0.98]">
                  <span>{l.viewAnalysis}</span>
                  <ChevronRight className="w-4 h-4" />
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
