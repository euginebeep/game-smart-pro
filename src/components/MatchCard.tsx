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

  // Format time using user's local timezone (auto-detected by browser)
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTzAbbr = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: userTimezone }).formatToParts(new Date());
      return parts.find(p => p.type === 'timeZoneName')?.value || '';
    } catch { return ''; }
  }, [userTimezone]);

  const formatTime = (game: Game) => {
    const d = new Date(game.startTime);
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimezone,
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
      className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border/40 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative">
        {/* ===== HEADER: Time & League ===== */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
          <div className="flex items-center gap-2.5 bg-muted/40 px-3.5 py-2 rounded-xl">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
              {formatTime(game)}
            </span>
            {userTzAbbr && <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">({userTzAbbr})</span>}
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

        {/* ===== TEAMS: Centered horizontal ===== */}
        <div className="px-5 py-5 border-b border-border/30">
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center" style={{ minWidth: '100px', maxWidth: '140px' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-2 shadow-md border border-border/20 mb-1.5">
                <img
                  src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId || 0}.png`}
                  alt={game.homeTeam}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
              <p className="font-bold text-sm sm:text-base leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                {game.homeTeam}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'pt' ? 'Casa' : language === 'es' ? 'Local' : language === 'it' ? 'Casa' : 'Home'}
              </span>
            </div>

            {/* X */}
            <span className="text-foreground text-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>X</span>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center" style={{ minWidth: '100px', maxWidth: '140px' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 p-2 shadow-md border border-border/20 mb-1.5">
                <img
                  src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId || 0}.png`}
                  alt={game.awayTeam}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
              <p className="font-bold text-sm sm:text-base leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                {game.awayTeam}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {language === 'pt' ? 'Fora' : language === 'es' ? 'Visitante' : language === 'it' ? 'Ospite' : 'Away'}
              </span>
            </div>
          </div>
        </div>

        {/* ===== ODDS: 3 columns ===== */}
        <div className="px-5 py-4 border-b border-border/30">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: l.home, odd: game.odds.home, prob: homeProb, color: 'text-primary' },
              { label: l.draw, odd: game.odds.draw, prob: drawProb, color: 'text-warning' },
              { label: l.away, odd: game.odds.away, prob: awayProb, color: 'text-accent' },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
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
        </div>

        {/* ===== RECOMMENDATION ===== */}
        <div className="px-5 py-4 border-b border-border/30">
          <div className="bg-gradient-to-r from-primary/8 to-primary/3 border border-primary/20 rounded-xl px-4 py-3.5">
            {/* Row 1: Icon + Bet suggestion */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Target className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {l.suggestedBet}
                </p>
                <p className="font-bold text-sm sm:text-base leading-tight tracking-tight truncate" style={{ fontFamily: "'Montserrat', sans-serif", color: 'hsl(var(--foreground))' }}>
                  {betSuggestion.text}
                  {betSuggestion.subtext && (
                    <span className="text-muted-foreground font-normal text-xs ml-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {betSuggestion.subtext}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Row 2: Stats side by side */}
            <div className="flex items-stretch gap-2.5">
              <div className="flex-1 flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/20">
                <Zap className="w-4 h-4 text-warning flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-[9px] uppercase tracking-widest font-semibold whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {l.confidence}
                  </p>
                  <p className={`font-extrabold text-lg tracking-tight leading-none ${getConfidenceColor(analysis?.confidence || 0)}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {analysis?.confidence || 0}%
                  </p>
                </div>
              </div>
              {analysis?.valuePercentage && analysis.valuePercentage > 0 && (
                <div className="flex-1 flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2.5 border border-border/20">
                  <TrendingUp className="w-4 h-4 text-success flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-[9px] uppercase tracking-widest font-semibold whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {l.value}
                    </p>
                    <p className="text-success font-extrabold text-lg tracking-tight leading-none" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      +{analysis.valuePercentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ===== ACTION BUTTON ===== */}
        <div className="px-5 py-4">
          <button 
            onClick={handleViewAnalysis}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span className="tracking-wide">{l.viewAnalysis}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
