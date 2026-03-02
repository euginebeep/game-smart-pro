import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp, Target, Zap, ChevronRight } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';

interface MatchCardProps {
  game: Game;
  delay: number;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function MatchCard({ game, delay, userTier = 'free' }: MatchCardProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);

  // Format time - prefer brazilTime if available
  const formatTime = (game: Game) => {
    if (game.brazilTime) {
      return game.brazilTime;
    }
    const d = new Date(game.startTime);
    return d.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProbability = (odd: number) => {
    if (!odd || odd <= 0) return 0;
    return Math.round((1 / odd) * 100);
  };

  const homeProb = calculateProbability(game.odds.home);
  const drawProb = calculateProbability(game.odds.draw);
  const awayProb = calculateProbability(game.odds.away);

  const labels = {
    pt: {
      suggestedBet: 'Aposta Recomendada',
      confidence: 'Probabilidade',
      value: 'Vantagem Matemática',
      viewAnalysis: 'Ver Análise Completa',
      home: 'Casa',
      draw: 'Empate',
      away: 'Visitante',
      victory: 'Vitória',
      homeLabel: '(Casa)',
      awayLabel: '(Visitante)',
    },
    en: {
      suggestedBet: 'Recommended Bet',
      confidence: 'Probability',
      value: 'Mathematical Edge',
      viewAnalysis: 'View Full Analysis',
      home: 'Home',
      draw: 'Draw',
      away: 'Away',
      victory: 'Win',
      homeLabel: '(Home)',
      awayLabel: '(Away)',
    },
    es: {
      suggestedBet: 'Apuesta Recomendada',
      confidence: 'Probabilidad',
      value: 'Ventaja Matemática',
      viewAnalysis: 'Ver Análisis Completo',
      home: 'Local',
      draw: 'Empate',
      away: 'Visitante',
      victory: 'Victoria',
      homeLabel: '(Local)',
      awayLabel: '(Visitante)',
    },
    it: {
      suggestedBet: 'Scommessa Consigliata',
      confidence: 'Probabilità',
      value: 'Vantaggio Matematico',
      viewAnalysis: 'Vedi Analisi Completa',
      home: 'Casa',
      draw: 'Pareggio',
      away: 'Ospite',
      victory: 'Vittoria',
      homeLabel: '(Casa)',
      awayLabel: '(Ospite)',
    },
  };

  const l = labels[language] || labels.pt;

  const getBetSuggestion = () => {
    if (!analysis) return { text: '-', subtext: '' };
    const type = analysis.type.toLowerCase();
    if (type.includes('casa') || type.includes('home') || type.includes('1x')) {
      return { text: `${l.victory} ${game.homeTeam}`, subtext: l.homeLabel };
    }
    if (type.includes('fora') || type.includes('away') || type.includes('x2')) {
      return { text: `${l.victory} ${game.awayTeam}`, subtext: l.awayLabel };
    }
    if (type.includes('empate') || type.includes('draw') || type.includes('pareggio')) {
      return { text: l.draw, subtext: '' };
    }
    if (type.includes('btts') || type.includes('ambos') || type.includes('both')) {
      return { text: language === 'pt' ? 'Ambos Marcam - Sim' : 'Both Teams Score - Yes', subtext: '' };
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

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'text-primary';
    if (conf >= 65) return 'text-warning';
    return 'text-destructive';
  };

  const handleViewAnalysis = () => {
    navigate(`/analysis/${game.id}`, { state: { game, userTier } });
  };

  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 border border-border/20 shadow-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in-up opacity-0 hover:border-primary/20"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5 sm:p-6">
        {/* Header: Time & League */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/30">
          <div className="flex items-center gap-2.5 bg-muted/40 px-3.5 py-2 rounded-xl">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
              {formatTime(game)}
            </span>
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">(BRT)</span>
          </div>
          <div className="flex items-center gap-2.5">
            {game.leagueLogo && (
              <img
                src={game.leagueLogo}
                alt={game.league}
                className="w-6 h-6 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="text-foreground/70 text-sm font-semibold tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {game.league}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          
          {/* Teams Section */}
          <div className="flex-shrink-0 lg:min-w-[220px]">
            {/* Home Team */}
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-1.5 shadow-md border border-border/20">
                  <img
                    src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId || 0}.png`}
                    alt={game.homeTeam}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {language === 'pt' ? 'Casa' : 'Home'}
                </span>
              </div>
              <div>
                <p className="font-bold text-base leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                  {game.homeTeam}
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {l.home}
                </p>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center gap-3 my-2.5 ml-4">
              <div className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center border border-border/30">
                <span className="text-muted-foreground text-[9px] font-bold tracking-wider">VS</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent" />
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-1.5 shadow-md border border-border/20">
                  <img
                    src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId || 0}.png`}
                    alt={game.awayTeam}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {language === 'pt' ? 'Fora' : 'Away'}
                </span>
              </div>
              <div>
                <p className="font-bold text-base leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                  {game.awayTeam}
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5 font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {l.away}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px h-36 bg-gradient-to-b from-transparent via-border/40 to-transparent" />

          {/* Analysis Section */}
          <div className="flex-1 space-y-4">
            {/* Odds Row */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: l.home, odd: game.odds.home, prob: homeProb, color: 'text-primary' },
                { label: l.draw, odd: game.odds.draw, prob: drawProb, color: 'text-warning' },
                { label: l.away, odd: game.odds.away, prob: awayProb, color: 'text-accent' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/20">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {item.label}
                  </p>
                  <p className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                    {item.odd.toFixed(2)}
                  </p>
                  <p className={`${item.color} text-xs font-semibold mt-0.5`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.prob}%
                  </p>
                </div>
              ))}
            </div>

            {/* Recommendation Box */}
            <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
                  <Target className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {l.suggestedBet}
                  </p>
                  <p className="font-bold text-base leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                    {betSuggestion.text}
                    {betSuggestion.subtext && (
                      <span className="text-muted-foreground font-normal text-xs ml-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {betSuggestion.subtext}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-3.5 pt-3 border-t border-primary/15">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-muted-foreground text-[9px] uppercase tracking-widest font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {l.confidence}
                    </p>
                    <p className={`font-extrabold text-lg tracking-tight ${getConfidenceColor(analysis?.confidence || 0)}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {analysis?.confidence || 0}%
                    </p>
                  </div>
                </div>
                {analysis?.valuePercentage && analysis.valuePercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-muted-foreground text-[9px] uppercase tracking-widest font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {l.value}
                      </p>
                      <p className="text-success font-extrabold text-lg tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        +{analysis.valuePercentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="lg:ml-3 flex-shrink-0">
            <button 
              onClick={handleViewAnalysis}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <span className="tracking-wide">{l.viewAnalysis}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
