import { useState, useMemo } from 'react';
import { Calendar, Trophy, Lightbulb, ChevronDown, ChevronUp, DollarSign, Shield, Activity, Stethoscope, Target, Lock } from 'lucide-react';
import { Game } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameCardProps {
  game: Game;
  delay: number;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function GameCard({ game, delay, userTier = 'free' }: GameCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);
  const adv = game.advancedData;

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

  // Níveis de acesso
  const hasAdvancedAccess = userTier === 'advanced' || userTier === 'premium';
  const hasPremiumAccess = userTier === 'premium';

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
            {/* Tier Badge */}
            <div className={`badge text-[10px] sm:text-xs ${
              userTier === 'premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              userTier === 'advanced' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
              'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              <span className="font-semibold uppercase">
                {userTier === 'premium' ? t('gameCardTiers.premiumBadge') :
                 userTier === 'advanced' ? t('gameCardTiers.advancedBadge') :
                 t('gameCardTiers.basicBadge')}
              </span>
            </div>
          </div>
        </div>

        {/* Main Odd + Confidence */}
        <div className="text-left sm:text-right mt-2 lg:mt-0">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
            {t('gameCard.bestOdd')}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-success">
            {bestOdd.toFixed(2)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{game.bookmaker}</p>
          {analysis.confidence && hasPremiumAccess && (
            <div className="mt-2 flex items-center gap-2 justify-end">
              <div className="text-xs text-muted-foreground">Confiança:</div>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      analysis.confidence >= 70 ? 'bg-green-500' :
                      analysis.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${
                  analysis.confidence >= 70 ? 'text-green-400' :
                  analysis.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analysis.confidence}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BASIC: Analysis Boxes (Todos veem) */}
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

      {/* ADVANCED: H2H, Form, Standings */}
      {hasAdvancedAccess && adv && (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3 mb-4 sm:mb-6">
          {/* H2H */}
          {adv.h2h && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-purple-400 text-xs uppercase">Head to Head</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">Jogos:</span> {adv.h2h.totalGames}
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">Casa:</span> {adv.h2h.homeWins} | 
                  <span className="text-muted-foreground"> Emp:</span> {adv.h2h.draws} | 
                  <span className="text-muted-foreground"> Fora:</span> {adv.h2h.awayWins}
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">Média gols:</span> {adv.h2h.avgGoals.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {(adv.homeForm || adv.awayForm) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-blue-400 text-xs uppercase">Forma Recente</h4>
              </div>
              <div className="space-y-2 text-xs">
                {adv.homeForm && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-12 truncate">{game.homeTeam.slice(0,8)}:</span>
                    <div className="flex gap-1">
                      {adv.homeForm.split('').slice(0, 5).map((r, i) => (
                        <span key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          r === 'W' ? 'bg-green-500/30 text-green-400' :
                          r === 'D' ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-red-500/30 text-red-400'
                        }`}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {adv.awayForm && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-12 truncate">{game.awayTeam.slice(0,8)}:</span>
                    <div className="flex gap-1">
                      {adv.awayForm.split('').slice(0, 5).map((r, i) => (
                        <span key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                          r === 'W' ? 'bg-green-500/30 text-green-400' :
                          r === 'D' ? 'bg-yellow-500/30 text-yellow-400' :
                          'bg-red-500/30 text-red-400'
                        }`}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standings */}
          {(adv.homePosition || adv.awayPosition) && (
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-cyan-400 text-xs uppercase">Classificação</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.homeTeam.slice(0,10)}:</span> {adv.homePosition}º
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.awayTeam.slice(0,10)}:</span> {adv.awayPosition}º
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locked Advanced Section */}
      {!hasAdvancedAccess && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{t('gameCardTiers.advancedBadge')}</p>
              <p className="text-xs text-muted-foreground">{t('gameCardTiers.advancedLocked')}</p>
            </div>
          </div>
          <div className="opacity-30 grid grid-cols-3 gap-3">
            <div className="h-20 bg-purple-500/10 rounded-lg" />
            <div className="h-20 bg-blue-500/10 rounded-lg" />
            <div className="h-20 bg-cyan-500/10 rounded-lg" />
          </div>
        </div>
      )}

      {/* PREMIUM: Injuries, Stats, Predictions */}
      {hasPremiumAccess && adv && (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-3 mb-4 sm:mb-6">
          {/* Injuries */}
          {(adv.homeInjuries !== undefined || adv.awayInjuries !== undefined) && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-red-400" />
                <h4 className="font-bold text-red-400 text-xs uppercase">Lesões</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.homeTeam.slice(0,10)}:</span> {adv.homeInjuries || 0} desfalques
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.awayTeam.slice(0,10)}:</span> {adv.awayInjuries || 0} desfalques
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {(adv.homeStats || adv.awayStats) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <h4 className="font-bold text-green-400 text-xs uppercase">Estatísticas</h4>
              </div>
              <div className="space-y-1 text-xs">
                {adv.homeStats && (
                  <>
                    <p className="text-foreground/80">
                      <span className="text-muted-foreground">Over 2.5:</span> {adv.homeStats.over25Percentage?.toFixed(0) || 0}%
                    </p>
                    <p className="text-foreground/80">
                      <span className="text-muted-foreground">BTTS:</span> {adv.homeStats.bttsPercentage?.toFixed(0) || 0}%
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* API Prediction */}
          {adv.apiPrediction && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase">Previsão API</h4>
              </div>
              <div className="space-y-1 text-xs">
                {adv.apiPrediction.advice && (
                  <p className="text-foreground/80 font-medium">{adv.apiPrediction.advice}</p>
                )}
                {adv.apiPrediction.winner && (
                  <p className="text-foreground/80">
                    <span className="text-muted-foreground">Favorito:</span> {adv.apiPrediction.winner}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Locked Premium Section */}
      {hasAdvancedAccess && !hasPremiumAccess && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{t('gameCardTiers.premiumBadge')}</p>
              <p className="text-xs text-muted-foreground">{t('gameCardTiers.premiumLocked')}</p>
            </div>
          </div>
          <div className="opacity-30 grid grid-cols-3 gap-3">
            <div className="h-20 bg-red-500/10 rounded-lg" />
            <div className="h-20 bg-green-500/10 rounded-lg" />
            <div className="h-20 bg-amber-500/10 rounded-lg" />
          </div>
        </div>
      )}

      {/* Analysis Factors (Premium only) */}
      {hasPremiumAccess && analysis.factors && analysis.factors.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
          <h4 className="font-bold text-amber-400 text-xs uppercase mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Fatores da Análise
          </h4>
          <div className="space-y-2">
            {analysis.factors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  factor.impact === 'positive' ? 'bg-green-400' :
                  factor.impact === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <div>
                  <span className="font-medium text-foreground/90">{factor.name}:</span>
                  <span className="text-muted-foreground ml-1">{factor.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
