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

type AccumulatorType = 'goalsLow' | 'goalsMedium' | 'goalsHigh' | 'winsLow' | 'winsMedium' | 'exactScores';

const ACCUMULATOR_TYPES: { id: AccumulatorType; labelKey: string; emoji: string; risk: RiskLevel }[] = [
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
        if (newSet.size > 1) {
          newSet.delete(typeId);
        }
      } else {
        newSet.add(typeId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setEnabledTypes(new Set(ACCUMULATOR_TYPES.map(type => type.id)));
  };

  const selectByRisk = (risk: RiskLevel) => {
    setEnabledTypes(new Set(
      ACCUMULATOR_TYPES.filter(type => type.risk === risk).map(type => type.id)
    ));
  };

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
            riskLevel={acc.riskLevel}
            delay={idx}
          />
        ))}
      </div>
      
      {filteredAccumulators.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('accumulators.noResults') || 'Nenhum acumulador selecionado'}</p>
          <Button variant="link" onClick={selectAll} className="mt-2">
            {t('accumulators.showAll') || 'Mostrar todos'}
          </Button>
        </div>
      )}
    </section>
  );
}

interface AccumulatorData {
  emoji: string;
  title: string;
  bets: { match: string; bet: string; odd: number }[];
  betAmount: number;
  chancePercent: number;
  riskLevel: RiskLevel;
  typeId: AccumulatorType;
}

// ===== Calculate real chance based on odds =====
function calculateRealChance(bets: { odd: number }[]): number {
  const marginFactor = 0.93;
  const combinedProb = bets.reduce((prob, bet) => {
    const impliedProb = (1 / bet.odd) * marginFactor;
    return prob * impliedProb;
  }, 1);
  return Math.max(1, Math.round(combinedProb * 100));
}

// ===== Calculate Double Chance odd =====
function calcDoubleChanceOdd(homeOdd: number, drawOdd: number): number {
  if (!homeOdd || !drawOdd || homeOdd <= 1 || drawOdd <= 1) return 1.20;
  const dc = 1 / ((1 / homeOdd) + (1 / drawOdd));
  return Math.round(Math.max(1.01, dc) * 100) / 100;
}

// ===== Estimate BTTS odd from over =====
function estimateBttsOdd(overOdd: number): number {
  if (!overOdd || overOdd <= 1) return 1.85;
  return Math.round(Math.max(1.30, overOdd * 0.98) * 100) / 100;
}

function generateAccumulators(games: Game[], t: (key: string) => string, isPremium: boolean): AccumulatorData[] {
  const validGames = games.filter(g => g && g.homeTeam && g.awayTeam && g.odds);
  const getGame = (index: number) => validGames[index % Math.max(1, validGames.length)];
  
  const sortedByConfidence = [...validGames].sort((a, b) => 
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

  if (validGames.length === 0) return baseAccumulators;

  // ===== LOW RISK — GOALS (2 legs: Over 1.5 + Over 1.5) → target 35-50% =====
  const lowRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 2] || getGame(i * 2);
    const g2 = bestGoalGames[i * 2 + 1] || getGame(i * 2 + 1);
    
    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.atLeast2Goals') || 'Almeno 2 gol',
        odd: g1.odds.over15 || Math.round(Math.max(1.15, (g1.odds.over || 1.85) * 0.68) * 100) / 100
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.atLeast2Goals') || 'Almeno 2 gol',
        odd: g2.odds.over15 || Math.round(Math.max(1.15, (g2.odds.over || 1.85) * 0.68) * 100) / 100
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🛡️',
      title: `${t('accumulators.goalsLowRisk')}${isPremium && lowRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(50, Math.min(150, Math.round(1000 * Math.max(0.05, (chancePercent / 100) * 0.30)))),
      chancePercent,
      riskLevel: 'low',
      typeId: 'goalsLow'
    });
  }

  // ===== MEDIUM RISK — GOALS (2 legs: Over 2.5 + BTTS) → target 20-35% =====
  const mediumRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 2] || getGame(i * 2);
    const g2 = bestGoalGames[i * 2 + 1] || getGame(i * 2 + 1);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.over25') || 'Più di 2.5 gol',
        odd: g1.odds.over || 1.85
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.bothTeamsScore') || 'Entrambe segnano',
        odd: g2.advancedData?.bttsOdds?.yes || estimateBttsOdd(g2.odds.over)
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.goalsMediumRisk')}${isPremium && mediumRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(25, Math.min(80, Math.round(1000 * Math.max(0.02, (chancePercent / 100) * 0.20)))),
      chancePercent,
      riskLevel: 'medium',
      typeId: 'goalsMedium'
    });
  }

  // ===== HIGH RISK — GOALS (3 legs: Over 2.5 + BTTS + Over 3.5) → target 8-18% =====
  const highRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 3] || getGame(i * 3);
    const g2 = bestGoalGames[i * 3 + 1] || getGame(i * 3 + 1);
    const g3 = bestGoalGames[i * 3 + 2] || getGame(i * 3 + 2);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.over25') || 'Più di 2.5 gol',
        odd: g1.odds.over || 1.85
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.bothTeamsScore') || 'Entrambe segnano',
        odd: g2.advancedData?.bttsOdds?.yes || estimateBttsOdd(g2.odds.over)
      },
      {
        match: `${g3.homeTeam} x ${g3.awayTeam}`,
        bet: t('accumulators.over35') || 'Più di 3.5 gol',
        odd: g3.odds.over35 || Math.round(Math.max(1.80, (g3.odds.over || 1.85) * 1.35) * 100) / 100
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.goalsHighRisk')}${isPremium && highRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(30, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.10)))),
      chancePercent,
      riskLevel: 'high',
      typeId: 'goalsHigh'
    });
  }

  // ===== LOW RISK — WINS (2 legs Double Chance) → target 40-60% =====
  const lowRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskWinsCount; i++) {
    const g1 = bestWinGames[i * 2] || getGame(i * 2);
    const g2 = bestWinGames[i * 2 + 1] || getGame(i * 2 + 1);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: `${g1.homeTeam} ${t('accumulators.winOrDraw')}`,
        odd: g1.odds.doubleChanceHomeOrDraw || calcDoubleChanceOdd(g1.odds.home, g1.odds.draw)
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: `${g2.homeTeam} ${t('accumulators.winOrDraw')}`,
        odd: g2.odds.doubleChanceHomeOrDraw || calcDoubleChanceOdd(g2.odds.home, g2.odds.draw)
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🛡️',
      title: `${t('accumulators.winsDoubleChance')}${isPremium && lowRiskWinsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(50, Math.min(150, Math.round(1000 * Math.max(0.05, (chancePercent / 100) * 0.30)))),
      chancePercent,
      riskLevel: 'low',
      typeId: 'winsLow'
    });
  }

  // ===== MEDIUM RISK — WINS (2 legs Moneyline) → target 15-30% =====
  const mediumRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskWinsCount; i++) {
    const g1 = bestWinGames[i * 2] || getGame(i * 2);
    const g2 = bestWinGames[i * 2 + 1] || getGame(i * 2 + 1);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: `${t('accumulators.victory')} ${g1.homeTeam}`,
        odd: g1.odds.home || 1.45
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: `${t('accumulators.victory')} ${g2.homeTeam}`,
        odd: g2.odds.home || 1.55
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.winsMediumRisk')}${isPremium && mediumRiskWinsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(25, Math.min(80, Math.round(1000 * Math.max(0.02, (chancePercent / 100) * 0.20)))),
      chancePercent,
      riskLevel: 'medium',
      typeId: 'winsMedium'
    });
  }

  // ===== HIGH RISK — EXACT SCORES (2 legs) → target 3-8% =====
  const highRiskScoresCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskScoresCount; i++) {
    const g1 = getGame(i * 2);
    const g2 = getGame(i * 2 + 1);
    const scores = [
      ['2-1', '1-0'],
      ['1-1', '2-0'],
      ['3-1', '2-2']
    ][i] || ['2-1', '1-0'];

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: `${t('accumulators.score')} ${scores[0]}`,
        odd: 7.00 + (i * 1.5)
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: `${t('accumulators.score')} ${scores[1]}`,
        odd: 6.50 + (i * 1.5)
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.exactScores')}${isPremium && highRiskScoresCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(30, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.10)))),
      chancePercent,
      riskLevel: 'high',
      typeId: 'exactScores'
    });
  }

  // Filter by minimum chance thresholds
  const filtered = baseAccumulators.filter(acc => {
    if (acc.riskLevel === 'low' && acc.chancePercent < 25) return false;
    if (acc.riskLevel === 'medium' && acc.chancePercent < 10) return false;
    if (acc.riskLevel === 'high' && acc.chancePercent < 3) return false;
    return true;
  });

  return filtered;
}
