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

function humanizeAnalysisType(type: string, game: Game, t: (key: string) => string): string {
  const upper = type.toUpperCase();
  
  if (upper.includes('SKIP')) return t('analysis.skip') || 'Jogo arriscado — melhor pular';
  if (upper.includes('OVER') || upper.includes('PIÙ DI 2.5') || upper.includes('MAIS DE 2.5') || upper.includes('MÁS DE 2.5')) return t('analysis.over25') || 'Vai ter mais de 2 gols';
  if (upper.includes('UNDER') || upper.includes('MENOS') || upper.includes('MENO')) return t('analysis.under25') || 'Vai ter menos de 3 gols';
  if (upper.includes('BTTS') || upper.includes('AMBAS') || upper.includes('ENTRAMBE') || upper.includes('AMBOS')) return t('analysis.btts') || 'Os dois times marcam gol';
  if (upper.includes('VITÓRIA CASA') || upper.includes('HOME WIN') || upper.includes('VITTORIA CASA') || upper.includes('VICTORIA LOCAL')) return `${t('analysis.homeWin') || 'Vitória do'} ${game.homeTeam}`;
  if (upper.includes('VITÓRIA FORA') || upper.includes('AWAY WIN') || upper.includes('VITTORIA TRASFERTA') || upper.includes('VICTORIA VISITANTE')) return `${t('analysis.awayWin') || 'Vitória do'} ${game.awayTeam}`;
  if (upper.includes('EMPATE') || upper.includes('DRAW') || upper.includes('PAREGGIO')) return t('analysis.draw') || 'Empate';
  
  return type;
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
            {/* Value Badge - Show for premium users when value > 0 */}
            {hasPremiumAccess && analysis.valuePercentage && analysis.valuePercentage > 0 && (
              <div className="badge text-[10px] sm:text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-semibold">Value +{analysis.valuePercentage.toFixed(1)}%</span>
              </div>
            )}
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
              <div className="text-xs text-muted-foreground">{t('gameCard.confidence')}:</div>
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
        {/* Bet Recommendation — com Edge Visual */}
        <div className={`analysis-box p-3 sm:p-4 ${analysis.isSkip ? 'analysis-box-warning' : 'analysis-box-success'}`}>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <DollarSign className={`w-4 h-4 sm:w-5 sm:h-5 ${analysis.isSkip ? 'text-warning' : 'text-primary'}`} />
            <h3 className={`font-bold uppercase tracking-wide text-xs sm:text-sm ${analysis.isSkip ? 'text-warning' : 'text-primary'}`}>
              {analysis.isSkip 
                ? (t('analysis.skip') || 'Jogo arriscado — melhor pular')
                : (t('analysis.suggestedBet') || '⭐ Nossa Recomendação')}
            </h3>
          </div>
          
          {!analysis.isSkip ? (
            <>
              {/* Tipo da aposta em linguagem clara */}
              <p className="text-foreground font-semibold text-sm sm:text-base mb-3">
                {humanizeAnalysisType(analysis.type, game, t)}
              </p>
              
              {/* Barra visual de edge: Casa vs EUGINE */}
              {analysis.impliedProbability && analysis.estimatedProbability && (
                <div className="bg-secondary/30 rounded-lg p-3 mb-3 space-y-2">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t('analysis.whyThisBet') || 'Por que essa aposta?'}
                  </p>
                  
                  {/* Comparação visual lado a lado */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t('analysis.bookmakerSays') || 'A casa diz'}
                      </p>
                      <p className="text-lg font-bold text-muted-foreground">
                        {Math.round(analysis.impliedProbability)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-primary">
                        {t('analysis.eugineCalc') || 'EUGINE calcula'}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {Math.round(analysis.estimatedProbability)}%
                      </p>
                    </div>
                  </div>

                  {/* Barra de progresso comparativa */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12">{t('analysis.house') || 'Casa'}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: `${Math.min(100, analysis.impliedProbability)}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary w-12">EUGINE</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            (analysis.valuePercentage || 0) > 10 ? 'bg-emerald-500' :
                            (analysis.valuePercentage || 0) > 5 ? 'bg-primary' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(100, analysis.estimatedProbability)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badge de vantagem */}
                  {analysis.valuePercentage && analysis.valuePercentage > 0 && (
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                      analysis.valuePercentage > 15 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      analysis.valuePercentage > 8 ? 'bg-primary/20 text-primary border border-primary/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {t('analysis.yourEdge') || 'Sua vantagem'}: +{analysis.valuePercentage.toFixed(1)}%
                      {analysis.valuePercentage > 15 && ` 🔥`}
                      {analysis.valuePercentage > 8 && analysis.valuePercentage <= 15 && ` ✅`}
                    </div>
                  )}
                </div>
              )}
              
              {/* Razão em texto */}
              <p className="text-foreground/90 text-xs sm:text-sm leading-relaxed mb-3">
                {analysis.reason}
              </p>
              
              {/* Retorno */}
              <div className="bg-primary/20 rounded-lg sm:rounded-xl p-2 sm:p-3 inline-block">
                <p className="text-xs sm:text-sm">
                  <span className="text-muted-foreground">{t('gameCard.bet')} 40 → </span>
                  <span className="text-primary font-bold">
                    {t('gameCard.profit')} {analysis.profit.toFixed(2)}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* SKIP — explicação didática */}
              <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed mb-2">
                {t('analysis.skipExplainFull') || 'Não encontramos vantagem matemática nesse jogo. A casa de apostas precificou as odds corretamente — apostar aqui seria como jogar moeda.'}
              </p>
              <p className="text-warning/80 text-[10px] sm:text-xs italic">
                {t('analysis.skipTip') || '💡 Dica: Só aposte quando o EUGINE encontrar vantagem. Disciplina é o que separa apostadores lucrativos dos que perdem.'}
              </p>
            </>
          )}
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
                <h4 className="font-bold text-purple-400 text-xs uppercase">{t('gameCard.headToHead')}</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{t('gameCard.games')}:</span> {adv.h2h.totalGames}
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{t('gameCard.homeWins')}:</span> {adv.h2h.homeWins} | 
                  <span className="text-muted-foreground"> {t('gameCard.draws')}:</span> {adv.h2h.draws} | 
                  <span className="text-muted-foreground"> {t('gameCard.awayWins')}:</span> {adv.h2h.awayWins}
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{t('gameCard.avgGoals')}:</span> {adv.h2h.avgGoals.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {(adv.homeForm || adv.awayForm) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-blue-400 text-xs uppercase">{t('gameCard.recentForm')}</h4>
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
                <h4 className="font-bold text-cyan-400 text-xs uppercase">{t('gameCard.standings')}</h4>
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
                <h4 className="font-bold text-red-400 text-xs uppercase">{t('gameCard.injuries')}</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.homeTeam.slice(0,10)}:</span> {adv.homeInjuries || 0} {t('gameCard.absences')}
                </p>
                <p className="text-foreground/80">
                  <span className="text-muted-foreground">{game.awayTeam.slice(0,10)}:</span> {adv.awayInjuries || 0} {t('gameCard.absences')}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          {(adv.homeStats || adv.awayStats) && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-400" />
                <h4 className="font-bold text-green-400 text-xs uppercase">{t('gameCard.statistics')}</h4>
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

          {/* EUGINE Suggestion */}
          {adv.apiPrediction && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase">{t('gameCard.eugineSuggestion')}</h4>
              </div>
              <div className="space-y-1 text-xs">
                {adv.apiPrediction.advice && (
                  <p className="text-foreground/80 font-medium">{adv.apiPrediction.advice}</p>
                )}
                {adv.apiPrediction.winnerLabel && (
                  <p className="text-foreground/80">
                    <span className="text-muted-foreground">{t('gameCard.favorite')}:</span> {adv.apiPrediction.winnerLabel}
                    {adv.apiPrediction.confidenceLabel && <span className="text-muted-foreground ml-1">({adv.apiPrediction.confidenceLabel})</span>}
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
            {t('gameCard.analysisFactors')}
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
