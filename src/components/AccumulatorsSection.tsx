import { useState } from 'react';
import { AccumulatorCard, RiskLevel } from './AccumulatorCard';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AccumulatorsSectionProps {
  games: Game[];
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
  maxAccumulators?: number;
}

type AccumulatorType = 'goldBet' | 'safeBet' | 'goalsLow' | 'goalsMedium' | 'goalsHigh' | 'winsLow' | 'winsMedium' | 'exactScores';

const ACCUMULATOR_TYPES: { id: AccumulatorType; labelKey: string; emoji: string; risk: RiskLevel }[] = [
  { id: 'goldBet', labelKey: 'accumulators.goldBet', emoji: '🏆', risk: 'low' },
  { id: 'safeBet', labelKey: 'accumulators.safeBet', emoji: '🛡️', risk: 'low' },
  { id: 'goalsLow', labelKey: 'accumulators.goalsLowRisk', emoji: '🛡️', risk: 'low' },
  { id: 'goalsMedium', labelKey: 'accumulators.goalsMediumRisk', emoji: '⚖️', risk: 'medium' },
  { id: 'goalsHigh', labelKey: 'accumulators.goalsHighRisk', emoji: '🚀', risk: 'high' },
  { id: 'winsLow', labelKey: 'accumulators.winsDoubleChance', emoji: '🛡️', risk: 'low' },
  { id: 'winsMedium', labelKey: 'accumulators.winsMediumRisk', emoji: '⚖️', risk: 'medium' },
  { id: 'exactScores', labelKey: 'accumulators.exactScores', emoji: '🚀', risk: 'high' },
];

export function AccumulatorsSection({ games, userTier = 'free', maxAccumulators }: AccumulatorsSectionProps) {
  const { t } = useLanguage();
  const isPremium = userTier === 'premium';
  
  const [enabledTypes, setEnabledTypes] = useState<Set<AccumulatorType>>(
    new Set(ACCUMULATOR_TYPES.map(type => type.id))
  );
  
  const allAccumulators = generateAccumulators(games, t, isPremium);
  
  let filteredAccumulators = isPremium 
    ? allAccumulators.filter(acc => enabledTypes.has(acc.typeId))
    : allAccumulators;
  
  if (maxAccumulators !== undefined && maxAccumulators > 0) {
    filteredAccumulators = filteredAccumulators.slice(0, maxAccumulators);
  }

  const toggleType = (typeId: AccumulatorType) => {
    setEnabledTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        if (newSet.size > 1) newSet.delete(typeId);
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  const selectAll = () => setEnabledTypes(new Set(ACCUMULATOR_TYPES.map(type => type.id)));
  const selectByRisk = (risk: RiskLevel) => setEnabledTypes(new Set(ACCUMULATOR_TYPES.filter(type => type.risk === risk).map(type => type.id)));

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          {t('accumulators.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          {t('accumulators.subtitle')} <span className="text-warning font-semibold">{t('accumulators.warning')}</span>
        </p>
        
        {isPremium && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-primary text-sm font-medium flex items-center gap-1">
              ⭐ Premium: 3x {t('accumulators.moreCards')}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {t('accumulators.filter') || 'Filtrar'} ({enabledTypes.size}/{ACCUMULATOR_TYPES.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {t('accumulators.filterTypes') || 'Filtrar Tipos'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="flex gap-1 p-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-7" onClick={selectAll}>
                    {t('accumulators.all') || 'Todos'}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-7 text-green-500" onClick={() => selectByRisk('low')}>
                    🛡️ {t('accumulators.riskLow')}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-7 text-yellow-500" onClick={() => selectByRisk('medium')}>
                    ⚖️ {t('accumulators.riskMedium')}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-7 text-red-500" onClick={() => selectByRisk('high')}>
                    🚀 {t('accumulators.riskHigh')}
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {ACCUMULATOR_TYPES.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type.id}
                    checked={enabledTypes.has(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{type.emoji}</span>
                      <span className="text-sm truncate">{t(type.labelKey).split(' - ')[0]}</span>
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAccumulators.map((acc, idx) => (
          <AccumulatorCard
            key={`${acc.typeId}-${idx}`}
            emoji={acc.emoji}
            title={acc.title}
            bets={acc.bets}
            betAmount={acc.betAmount}
            chancePercent={acc.chancePercent}
            bookmakerChance={acc.bookmakerChance}
            riskLevel={acc.riskLevel}
            delay={idx}
          />
        ))}
      </div>
      
      {filteredAccumulators.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('accumulators.notEnoughGames') || 'Poucos jogos com vantagem hoje. Volte mais tarde ou aposte individualmente.'}</p>
          <Button variant="link" onClick={selectAll} className="mt-2">
            {t('accumulators.showAll') || 'Mostrar todos'}
          </Button>
        </div>
      )}
    </section>
  );
}

// ===== TYPES =====

interface AccumulatorBet {
  match: string;
  bet: string;
  odd: number;
  estimatedProb?: number;
}

interface AccumulatorData {
  emoji: string;
  title: string;
  bets: AccumulatorBet[];
  betAmount: number;
  chancePercent: number;
  bookmakerChance?: number;
  riskLevel: RiskLevel;
  typeId: AccumulatorType;
}

// ===== CHANCE CALCULATIONS =====

// Chance da CASA (probabilidade implícita das odds)
function calculateBookmakerChance(bets: Array<{ odd: number }>): number {
  if (!bets || bets.length === 0) return 0;
  let combinedProb = 1;
  for (const bet of bets) {
    if (bet.odd > 0) combinedProb *= (1 / bet.odd);
  }
  const margin = 0.93;
  return Math.round(Math.min(99, Math.max(1, combinedProb * margin * 100)));
}

// Chance do EUGINE (usa estimatedProbability do Poisson quando disponível)
function calculateEugineChance(bets: Array<{ odd: number; estimatedProb?: number }>): number {
  if (!bets || bets.length === 0) return 0;
  let combinedProb = 1;
  for (const bet of bets) {
    if (bet.estimatedProb && bet.estimatedProb > 0) {
      combinedProb *= (bet.estimatedProb / 100);
    } else if (bet.odd > 0) {
      combinedProb *= (1 / bet.odd) * 0.93;
    }
  }
  return Math.round(Math.min(99, Math.max(1, combinedProb * 100)));
}

// ===== MARKET PROBABILITY HELPERS =====

function getOddForMarket(game: Game, market: string): number {
  const m = market.toUpperCase();
  if (m.includes('OVER15')) return game.odds.over15 || (game.odds.over || 1.85) * 0.68;
  if (m.includes('OVER35')) return game.odds.over35 || (game.odds.over || 1.85) * 1.35;
  if (m.includes('OVER25') || m.includes('OVER')) return game.odds.over || 1.85;
  if (m.includes('BTTS')) return game.advancedData?.bttsOdds?.yes || 1.85;
  if (m.includes('HOME') || m.includes('DOUBLE')) return game.odds.home || 1.50;
  if (m.includes('AWAY')) return game.odds.away || 2.00;
  return 2.00;
}

function getEstimatedProbForMarket(game: Game, market: string): number | undefined {
  const analysis = game.analysis;
  if (!analysis || !analysis.estimatedProbability) return undefined;
  
  const typeUpper = (analysis.type || '').toUpperCase();
  const marketUpper = market.toUpperCase();
  
  // Match analysis type to market — support all languages (PT/EN/ES/IT)
  const isOverType = typeUpper.includes('OVER') || typeUpper.includes('MAIS DE') || typeUpper.includes('MÁS DE') || typeUpper.includes('PIÙ DI') || typeUpper.includes('GOL');
  const isUnderType = typeUpper.includes('UNDER') || typeUpper.includes('MENOS DE') || typeUpper.includes('MENO DI');
  const isBttsType = typeUpper.includes('BTTS') || typeUpper.includes('AMBAS') || typeUpper.includes('ENTRAMBE') || typeUpper.includes('BOTH') || typeUpper.includes('MARCAM') || typeUpper.includes('SEGNANO');
  const isHomeType = typeUpper.includes('HOME') || typeUpper.includes('CASA') || typeUpper.includes('VITÓRIA') || typeUpper.includes('VICTORY') || typeUpper.includes('VICTORIA');
  const isAwayType = typeUpper.includes('AWAY') || typeUpper.includes('FORA') || typeUpper.includes('TRASFERTA') || typeUpper.includes('VISITANTE');
  
  // Direct match: analysis type matches the accumulator market
  if (marketUpper.includes('OVER') && isOverType) return analysis.estimatedProbability;
  if (marketUpper.includes('BTTS') && isBttsType) return analysis.estimatedProbability;
  if (marketUpper.includes('HOME') && isHomeType) return analysis.estimatedProbability;
  if (marketUpper.includes('AWAY') && isAwayType) return analysis.estimatedProbability;
  if (marketUpper.includes('UNDER') && isUnderType) return analysis.estimatedProbability;
  
  // Different market — estimate proportionally using edge ratio (conservative: 50% of edge)
  if (analysis.impliedProbability && analysis.impliedProbability > 0) {
    const edgeRatio = analysis.estimatedProbability / analysis.impliedProbability;
    const oddForMarket = getOddForMarket(game, market);
    const impliedForThisMarket = (1 / oddForMarket) * 100;
    const adjustedEdge = 1 + (edgeRatio - 1) * 0.5;
    return Math.min(95, Math.round(impliedForThisMarket * adjustedEdge));
  }
  
  return undefined;
}

// ===== HELPER FUNCTIONS =====

function calcDoubleChanceOdd(homeOdd: number, drawOdd: number): number {
  if (!homeOdd || !drawOdd || homeOdd <= 1 || drawOdd <= 1) return 1.20;
  const dc = 1 / ((1 / homeOdd) + (1 / drawOdd));
  return Math.round(Math.max(1.01, dc) * 100) / 100;
}

function estimateBttsOdd(overOdd: number): number {
  if (!overOdd || overOdd <= 1) return 1.85;
  return Math.round(Math.max(1.30, overOdd * 0.98) * 100) / 100;
}

// Deduplication: select unique games from pool
function getUniqueGames(pool: Game[], count: number, usedFixtures?: Set<string>): Game[] {
  const selected: Game[] = [];
  const used = usedFixtures || new Set<string>();
  
  for (const game of pool) {
    const fixtureKey = `${game.homeTeam}-${game.awayTeam}`;
    if (!used.has(fixtureKey)) {
      selected.push(game);
      used.add(fixtureKey);
      if (selected.length >= count) break;
    }
  }
  
  return selected;
}

// Validate that all bets in an accumulator are from different matches
function validateAccumulatorBets(bets: Array<{ match: string }>): boolean {
  const matches = bets.map(b => b.match);
  const uniqueMatches = new Set(matches);
  return uniqueMatches.size === bets.length;
}

// ===== MAIN GENERATOR =====

function generateAccumulators(games: Game[], t: (key: string) => string, isPremium: boolean): AccumulatorData[] {
  const validGames = games.filter(g => g && g.homeTeam && g.awayTeam && g.odds);
  
  if (validGames.length === 0) return [];

  // FILTER: Only use games where EUGINE found value edge
  const gamesWithEdge = validGames.filter(g => 
    g.analysis && !g.analysis.isSkip && (g.analysis.valuePercentage || 0) > 0
  );
  // Fallback: if not enough games with edge, use non-skip games
  const gamesPool = gamesWithEdge.length >= 4 ? gamesWithEdge : validGames.filter(g => g.analysis && !g.analysis.isSkip);
  // Ultimate fallback
  const effectivePool = gamesPool.length >= 2 ? gamesPool : validGames;
  
  const sortedByConfidence = [...effectivePool].sort((a, b) => 
    (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0)
  );

  const goalCandidates = sortedByConfidence.filter(g => {
    const type = g.analysis?.type?.toUpperCase() || '';
    return type.includes('GOL') || type.includes('OVER') || type.includes('BTTS') || type.includes('MARCAM') || (g.analysis?.confidence || 0) >= 60;
  });
  const bestGoalGames = goalCandidates.length >= 2 ? goalCandidates : sortedByConfidence;

  const winCandidates = sortedByConfidence.filter(g => {
    const type = g.analysis?.type?.toUpperCase() || '';
    return type.includes('VITÓRIA') || type.includes('WIN') || type.includes('VICTORY');
  });
  const bestWinGames = winCandidates.length >= 2 ? winCandidates : sortedByConfidence;

  const baseAccumulators: AccumulatorData[] = [];

  // Helper to build a 2-leg accumulator from unique games
  function tryBuild2Leg(
    pool: Game[], 
    buildBets: (g1: Game, g2: Game) => AccumulatorBet[], 
    config: { emoji: string; titleKey: string; risk: RiskLevel; typeId: AccumulatorType; betFactor: number; minBet: number; maxBet: number },
    index: number,
    totalCount: number
  ): boolean {
    const unique = getUniqueGames(pool, 2 + index * 2);
    const g1 = unique[index * 2];
    const g2 = unique[index * 2 + 1];
    if (!g1 || !g2) return false;
    
    const bets = buildBets(g1, g2);
    if (!validateAccumulatorBets(bets)) return false;
    
    const eugineChance = calculateEugineChance(bets);
    const bookmakerChance = calculateBookmakerChance(bets);
    console.log(`[EUGINE] Acumulada ${config.typeId}:`, { bets: bets.map(b => ({ match: b.match, odd: b.odd, estimatedProb: b.estimatedProb })), eugineChance, bookmakerChance });
    
    baseAccumulators.push({
      emoji: config.emoji,
      title: `${t(config.titleKey)}${totalCount > 1 ? ` #${index + 1}` : ''}`,
      bets,
      betAmount: Math.max(config.minBet, Math.min(config.maxBet, Math.round(1000 * Math.max(0.01, (eugineChance / 100) * config.betFactor)))),
      chancePercent: eugineChance,
      bookmakerChance,
      riskLevel: config.risk,
      typeId: config.typeId
    });
    return true;
  }

  // ===== LOW RISK — GOALS (Over 1.5) =====
  const lowRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskGoalsCount; i++) {
    tryBuild2Leg(bestGoalGames, (g1, g2) => [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: t('accumulators.atLeast2Goals') || 'Almeno 2 gol', odd: g1.odds.over15 || Math.round(Math.max(1.15, (g1.odds.over || 1.85) * 0.68) * 100) / 100, estimatedProb: getEstimatedProbForMarket(g1, 'OVER15') },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: t('accumulators.atLeast2Goals') || 'Almeno 2 gol', odd: g2.odds.over15 || Math.round(Math.max(1.15, (g2.odds.over || 1.85) * 0.68) * 100) / 100, estimatedProb: getEstimatedProbForMarket(g2, 'OVER15') },
    ], { emoji: '🛡️', titleKey: 'accumulators.goalsLowRisk', risk: 'low', typeId: 'goalsLow', betFactor: 0.30, minBet: 50, maxBet: 150 }, i, lowRiskGoalsCount);
  }

  // ===== MEDIUM RISK — GOALS (Over 2.5 + BTTS) =====
  const mediumRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskGoalsCount; i++) {
    tryBuild2Leg(bestGoalGames, (g1, g2) => [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: t('accumulators.over25') || 'Più di 2.5 gol', odd: g1.odds.over || 1.85, estimatedProb: getEstimatedProbForMarket(g1, 'OVER25') },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: t('accumulators.bothTeamsScore') || 'Entrambe segnano', odd: g2.advancedData?.bttsOdds?.yes || estimateBttsOdd(g2.odds.over), estimatedProb: getEstimatedProbForMarket(g2, 'BTTS') },
    ], { emoji: '⚖️', titleKey: 'accumulators.goalsMediumRisk', risk: 'medium', typeId: 'goalsMedium', betFactor: 0.20, minBet: 25, maxBet: 80 }, i, mediumRiskGoalsCount);
  }

  // ===== HIGH RISK — GOALS (Over 2.5 + BTTS + Over 3.5) =====
  const highRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskGoalsCount; i++) {
    const unique = getUniqueGames(bestGoalGames, 3 + i * 3);
    const g1 = unique[i * 3];
    const g2 = unique[i * 3 + 1];
    const g3 = unique[i * 3 + 2];
    if (!g1 || !g2 || !g3) continue;

    const bets: AccumulatorBet[] = [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: t('accumulators.over25') || 'Più di 2.5 gol', odd: g1.odds.over || 1.85, estimatedProb: getEstimatedProbForMarket(g1, 'OVER25') },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: t('accumulators.bothTeamsScore') || 'Entrambe segnano', odd: g2.advancedData?.bttsOdds?.yes || estimateBttsOdd(g2.odds.over), estimatedProb: getEstimatedProbForMarket(g2, 'BTTS') },
      { match: `${g3.homeTeam} x ${g3.awayTeam}`, bet: t('accumulators.over35') || 'Più di 3.5 gol', odd: g3.odds.over35 || Math.round(Math.max(1.80, (g3.odds.over || 1.85) * 1.35) * 100) / 100, estimatedProb: getEstimatedProbForMarket(g3, 'OVER35') },
    ];
    if (!validateAccumulatorBets(bets)) continue;

    const eugineChance = calculateEugineChance(bets);
    const bookmakerChance = calculateBookmakerChance(bets);
    console.log('[EUGINE] Acumulada goalsHigh:', { bets: bets.map(b => ({ match: b.match, odd: b.odd, estimatedProb: b.estimatedProb })), eugineChance, bookmakerChance });

    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.goalsHighRisk')}${isPremium && highRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(30, Math.round(1000 * Math.max(0.01, (eugineChance / 100) * 0.10)))),
      chancePercent: eugineChance,
      bookmakerChance,
      riskLevel: 'high',
      typeId: 'goalsHigh'
    });
  }

  // ===== LOW RISK — WINS (Double Chance) =====
  const lowRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskWinsCount; i++) {
    tryBuild2Leg(bestWinGames, (g1, g2) => [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: `${g1.homeTeam} ${t('accumulators.winOrDraw')}`, odd: g1.odds.doubleChanceHomeOrDraw || calcDoubleChanceOdd(g1.odds.home, g1.odds.draw), estimatedProb: getEstimatedProbForMarket(g1, 'HOME_DOUBLE') },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: `${g2.homeTeam} ${t('accumulators.winOrDraw')}`, odd: g2.odds.doubleChanceHomeOrDraw || calcDoubleChanceOdd(g2.odds.home, g2.odds.draw), estimatedProb: getEstimatedProbForMarket(g2, 'HOME_DOUBLE') },
    ], { emoji: '🛡️', titleKey: 'accumulators.winsDoubleChance', risk: 'low', typeId: 'winsLow', betFactor: 0.30, minBet: 50, maxBet: 150 }, i, lowRiskWinsCount);
  }

  // ===== MEDIUM RISK — WINS (Moneyline) =====
  const mediumRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskWinsCount; i++) {
    tryBuild2Leg(bestWinGames, (g1, g2) => [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: `${t('accumulators.victory')} ${g1.homeTeam}`, odd: g1.odds.home || 1.45, estimatedProb: getEstimatedProbForMarket(g1, 'HOME') },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: `${t('accumulators.victory')} ${g2.homeTeam}`, odd: g2.odds.home || 1.55, estimatedProb: getEstimatedProbForMarket(g2, 'HOME') },
    ], { emoji: '⚖️', titleKey: 'accumulators.winsMediumRisk', risk: 'medium', typeId: 'winsMedium', betFactor: 0.20, minBet: 25, maxBet: 80 }, i, mediumRiskWinsCount);
  }

  // ===== HIGH RISK — EXACT SCORES =====
  const highRiskScoresCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskScoresCount; i++) {
    const unique = getUniqueGames(effectivePool, 2 + i * 2);
    const g1 = unique[i * 2];
    const g2 = unique[i * 2 + 1];
    if (!g1 || !g2) continue;
    const scores = [['2-1', '1-0'], ['1-1', '2-0'], ['3-1', '2-2']][i] || ['2-1', '1-0'];

    const bets: AccumulatorBet[] = [
      { match: `${g1.homeTeam} x ${g1.awayTeam}`, bet: `${t('accumulators.score')} ${scores[0]}`, odd: 7.00 + (i * 1.5) },
      { match: `${g2.homeTeam} x ${g2.awayTeam}`, bet: `${t('accumulators.score')} ${scores[1]}`, odd: 6.50 + (i * 1.5) }
    ];
    if (!validateAccumulatorBets(bets)) continue;

    const eugineChance = calculateEugineChance(bets);
    const bookmakerChance = calculateBookmakerChance(bets);

    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.exactScores')}${isPremium && highRiskScoresCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(30, Math.round(1000 * Math.max(0.01, (eugineChance / 100) * 0.10)))),
      chancePercent: eugineChance,
      bookmakerChance,
      riskLevel: 'high',
      typeId: 'exactScores'
    });
  }

  // ===== APOSTA DE OURO: Top 2 games with HIGHEST value edge =====
  const goldGames = getUniqueGames(
    [...effectivePool]
      .filter(g => g.analysis && !g.analysis.isSkip && (g.analysis.valuePercentage || 0) > 5)
      .sort((a, b) => (b.analysis?.valuePercentage || 0) - (a.analysis?.valuePercentage || 0)),
    2
  );
  
  if (goldGames.length >= 2) {
    const gold1 = goldGames[0];
    const gold2 = goldGames[1];
    
    function getRecommendedOdd(game: Game): number {
      const analysis = game.analysis;
      if (!analysis) return 1.50;
      const type = analysis.type?.toLowerCase() || '';
      if (type.includes('over') || type.includes('più') || type.includes('mais') || type.includes('más')) return game.odds.over || 1.85;
      if (type.includes('under') || type.includes('meno') || type.includes('menos')) return game.odds.under || 1.85;
      if (type.includes('btts') || type.includes('ambas') || type.includes('entrambe') || type.includes('dois')) return game.odds.bttsYes || game.advancedData?.bttsOdds?.yes || 1.85;
      if (type.includes('home') || type.includes('casa') || type.includes('vitória')) return game.odds.home || 1.50;
      if (type.includes('away') || type.includes('fora') || type.includes('trasferta') || type.includes('visitante')) return game.odds.away || 2.00;
      if (type.includes('draw') || type.includes('empate') || type.includes('pareggio')) return game.odds.draw || 3.00;
      return 1.70;
    }
    
    const goldBets: AccumulatorBet[] = [
      {
        match: `${gold1.homeTeam} x ${gold1.awayTeam}`,
        bet: `${gold1.analysis?.type || 'Aposta'} (${t('accumulators.edge') || 'vantagem'}: +${(gold1.analysis?.valuePercentage || 0).toFixed(0)}%)`,
        odd: getRecommendedOdd(gold1),
        estimatedProb: gold1.analysis?.estimatedProbability,
      },
      {
        match: `${gold2.homeTeam} x ${gold2.awayTeam}`,
        bet: `${gold2.analysis?.type || 'Aposta'} (${t('accumulators.edge') || 'vantagem'}: +${(gold2.analysis?.valuePercentage || 0).toFixed(0)}%)`,
        odd: getRecommendedOdd(gold2),
        estimatedProb: gold2.analysis?.estimatedProbability,
      }
    ];

    if (validateAccumulatorBets(goldBets)) {
      const eugineChance = calculateEugineChance(goldBets);
      const bookmakerChance = calculateBookmakerChance(goldBets);
      console.log('[EUGINE] Aposta de Ouro:', { bets: goldBets.map(b => ({ match: b.match, odd: b.odd, estimatedProb: b.estimatedProb })), eugineChance, bookmakerChance });

      baseAccumulators.unshift({
        emoji: '🏆',
        title: t('accumulators.goldBet') || 'Aposta de Ouro',
        typeId: 'goldBet',
        bets: goldBets,
        betAmount: Math.max(50, Math.min(150, Math.round(1000 * eugineChance / 100 * 0.35))),
        chancePercent: eugineChance,
        bookmakerChance,
        riskLevel: 'low',
      });
    }
  }

  // ===== APOSTA SEGURA: Over 1.5 in highest scoring games =====
  const highScoringGames = getUniqueGames(
    effectivePool
      .filter(g => g.advancedData?.homeStats && g.advancedData?.awayStats)
      .sort((a, b) => {
        const avgA = (a.advancedData?.homeStats?.avgGoalsScored || 0) + (a.advancedData?.awayStats?.avgGoalsScored || 0);
        const avgB = (b.advancedData?.homeStats?.avgGoalsScored || 0) + (b.advancedData?.awayStats?.avgGoalsScored || 0);
        return avgB - avgA;
      }),
    2
  );
  
  if (highScoringGames.length >= 2) {
    const safe1 = highScoringGames[0];
    const safe2 = highScoringGames[1];
    
    const safeBets: AccumulatorBet[] = [
      {
        match: `${safe1.homeTeam} x ${safe1.awayTeam}`,
        bet: t('accumulators.atLeast2Goals') || 'Vai ter pelo menos 2 gols',
        odd: safe1.odds.over15 || Math.round(Math.max(1.12, (safe1.odds.over || 1.85) * 0.65) * 100) / 100,
        estimatedProb: getEstimatedProbForMarket(safe1, 'OVER15'),
      },
      {
        match: `${safe2.homeTeam} x ${safe2.awayTeam}`,
        bet: t('accumulators.atLeast2Goals') || 'Vai ter pelo menos 2 gols',
        odd: safe2.odds.over15 || Math.round(Math.max(1.12, (safe2.odds.over || 1.85) * 0.65) * 100) / 100,
        estimatedProb: getEstimatedProbForMarket(safe2, 'OVER15'),
      }
    ];

    if (validateAccumulatorBets(safeBets)) {
      const eugineChance = calculateEugineChance(safeBets);
      const bookmakerChance = calculateBookmakerChance(safeBets);
      console.log('[EUGINE] Aposta Segura:', { bets: safeBets.map(b => ({ match: b.match, odd: b.odd, estimatedProb: b.estimatedProb })), eugineChance, bookmakerChance });

      baseAccumulators.unshift({
        emoji: '🛡️',
        title: t('accumulators.safeBet') || 'Aposta Segura — Gols quase certos',
        typeId: 'safeBet',
        bets: safeBets,
        betAmount: Math.max(80, Math.min(200, Math.round(1000 * eugineChance / 100 * 0.40))),
        chancePercent: eugineChance,
        bookmakerChance,
        riskLevel: 'low',
      });
    }
  }

  // Final validation: remove any accumulators with duplicate matches that slipped through
  const validAccumulators = baseAccumulators.filter(acc => {
    const matches = acc.bets.map(b => b.match);
    const uniqueMatches = new Set(matches);
    return uniqueMatches.size === acc.bets.length;
  });

  // Filter by minimum chance thresholds
  return validAccumulators.filter(acc => {
    if (acc.riskLevel === 'low' && acc.chancePercent < 25) return false;
    if (acc.riskLevel === 'medium' && acc.chancePercent < 10) return false;
    if (acc.riskLevel === 'high' && acc.chancePercent < 3) return false;
    return true;
  });
}
