import { useState } from 'react';
import { AccumulatorCard, RiskLevel } from './AccumulatorCard';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import { Filter, Check } from 'lucide-react';
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
  
  // All types enabled by default
  const [enabledTypes, setEnabledTypes] = useState<Set<AccumulatorType>>(
    new Set(ACCUMULATOR_TYPES.map(type => type.id))
  );
  
  // Generate all accumulators
  const allAccumulators = generateAccumulators(games, t, isPremium);
  
  // Filter based on user selection (only for Premium)
  let filteredAccumulators = isPremium 
    ? allAccumulators.filter(acc => enabledTypes.has(acc.typeId))
    : allAccumulators;
  
  // Apply max limit for free users
  if (maxAccumulators !== undefined && maxAccumulators > 0) {
    filteredAccumulators = filteredAccumulators.slice(0, maxAccumulators);
  }

  const toggleType = (typeId: AccumulatorType) => {
    setEnabledTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(typeId)) {
        // Don't allow disabling all types
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
      {/* Section Header */}
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          {t('accumulators.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          {t('accumulators.subtitle')} <span className="text-warning font-semibold">{t('accumulators.warning')}</span>
        </p>
        
        {/* Premium Filter Controls */}
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
                
                {/* Quick Filters */}
                <div className="flex gap-1 p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-7"
                    onClick={selectAll}
                  >
                    {t('accumulators.all') || 'Todos'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-7 text-green-500"
                    onClick={() => selectByRisk('low')}
                  >
                    🛡️ {t('accumulators.riskLow')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-7 text-yellow-500"
                    onClick={() => selectByRisk('medium')}
                  >
                    ⚖️ {t('accumulators.riskMedium')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-7 text-red-500"
                    onClick={() => selectByRisk('high')}
                  >
                    🚀 {t('accumulators.riskHigh')}
                  </Button>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Individual Type Toggles */}
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

      {/* Accumulators Grid */}
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
      
      {/* Empty State */}
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

// ===== FUNÇÃO AUXILIAR: Calcular chance REAL baseada nas odds =====
function calculateRealChance(bets: { odd: number }[]): number {
  const marginFactor = 0.93;
  const combinedProb = bets.reduce((prob, bet) => {
    const impliedProb = (1 / bet.odd) * marginFactor;
    return prob * impliedProb;
  }, 1);
  return Math.max(1, Math.round(combinedProb * 100));
}

// ===== FUNÇÃO AUXILIAR: Calcular odd de Double Chance =====
function calcDoubleChanceOdd(homeOdd: number, drawOdd: number): number {
  if (!homeOdd || !drawOdd || homeOdd <= 1 || drawOdd <= 1) return 1.20;
  const dc = 1 / ((1 / homeOdd) + (1 / drawOdd));
  return Math.round(Math.max(1.01, dc) * 100) / 100;
}

// ===== FUNÇÃO AUXILIAR: Estimar odd BTTS a partir de over =====
function estimateBttsOdd(overOdd: number): number {
  if (!overOdd || overOdd <= 1) return 1.85;
  return Math.round(Math.max(1.30, overOdd * 0.98) * 100) / 100;
}

function generateAccumulators(games: Game[], t: (key: string) => string, isPremium: boolean): AccumulatorData[] {
  const validGames = games.filter(g => g && g.homeTeam && g.awayTeam && g.odds);
  
  const getGame = (index: number) => validGames[index % Math.max(1, validGames.length)];
  
  // Ordenar jogos por confiança da análise (maior primeiro)
  const sortedByConfidence = [...validGames].sort((a, b) => 
    (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0)
  );

  // Jogos com melhor análise para gols
  const goalCandidates = sortedByConfidence.filter(g => {
    const type = g.analysis?.type?.toUpperCase() || '';
    return type.includes('GOL') || type.includes('OVER') || type.includes('BTTS') || type.includes('MARCAM') || (g.analysis?.confidence || 0) >= 60;
  });
  const bestGoalGames = goalCandidates.length >= 2 ? goalCandidates : sortedByConfidence;

  // Jogos com melhor análise para vitórias
  const winCandidates = sortedByConfidence.filter(g => {
    const type = g.analysis?.type?.toUpperCase() || '';
    return type.includes('VITÓRIA') || type.includes('WIN') || type.includes('VICTORY');
  });
  const bestWinGames = winCandidates.length >= 2 ? winCandidates : sortedByConfidence;

  const baseAccumulators: AccumulatorData[] = [];

  if (validGames.length === 0) return baseAccumulators;

  // ===== LOW RISK — GOLS (2 pernas: BTTS + Over 1.5) =====
  const lowRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 2] || getGame(i * 2);
    const g2 = bestGoalGames[i * 2 + 1] || getGame(i * 2 + 1);
    
    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.bothScore'),
        odd: g1.odds.bttsYes || g1.advancedData?.bttsOdds?.yes || estimateBttsOdd(g1.odds.over)
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.atLeast2Goals'),
        odd: g2.odds.over15 || Math.max(1.15, Math.round((g2.odds.over * 0.82) * 100) / 100)
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🛡️',
      title: `${t('accumulators.goalsLowRisk')}${isPremium && lowRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(20, Math.min(100, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.25)))),
      chancePercent,
      riskLevel: 'low',
      typeId: 'goalsLow'
    });
  }

  // ===== MEDIUM RISK — GOLS (3 pernas: Over 2.5 + BTTS + Over 2.5) =====
  const mediumRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 3] || getGame(i * 3);
    const g2 = bestGoalGames[i * 3 + 1] || getGame(i * 3 + 1);
    const g3 = bestGoalGames[i * 3 + 2] || getGame(i * 3 + 2);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.over25'),
        odd: g1.odds.over || 1.85
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.bothTeamsScore'),
        odd: g2.odds.bttsYes || g2.advancedData?.bttsOdds?.yes || estimateBttsOdd(g2.odds.over)
      },
      {
        match: `${g3.homeTeam} x ${g3.awayTeam}`,
        bet: t('accumulators.over25'),
        odd: g3.odds.over || 1.65
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.goalsMediumRisk')}${isPremium && mediumRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(60, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.15)))),
      chancePercent,
      riskLevel: 'medium',
      typeId: 'goalsMedium'
    });
  }

  // ===== HIGH RISK — GOLS (4 pernas: Over 3.5 etc) =====
  const highRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskGoalsCount; i++) {
    const g1 = bestGoalGames[i * 4] || getGame(i * 4);
    const g2 = bestGoalGames[i * 4 + 1] || getGame(i * 4 + 1);
    const g3 = bestGoalGames[i * 4 + 2] || getGame(i * 4 + 2);
    const g4 = bestGoalGames[i * 4 + 3] || getGame(i * 4 + 3);

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: t('accumulators.over35'),
        odd: g1.odds.over35 || Math.round(Math.max(1.80, (g1.odds.over || 1.85) * 1.35) * 100) / 100
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: t('accumulators.over35'),
        odd: g2.odds.over35 || Math.round(Math.max(1.80, (g2.odds.over || 1.85) * 1.30) * 100) / 100
      },
      {
        match: `${g3.homeTeam} x ${g3.awayTeam}`,
        bet: t('accumulators.over45'),
        odd: g3.odds.over45 || Math.round(Math.max(2.50, (g3.odds.over || 1.85) * 1.75) * 100) / 100
      },
      {
        match: `${g4.homeTeam} x ${g4.awayTeam}`,
        bet: t('accumulators.over35'),
        odd: g4.odds.over35 || Math.round(Math.max(1.80, (g4.odds.over || 1.85) * 1.45) * 100) / 100
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.goalsHighRisk')}${isPremium && highRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(5, Math.min(20, Math.round(1000 * Math.max(0.005, (chancePercent / 100) * 0.08)))),
      chancePercent,
      riskLevel: 'high',
      typeId: 'goalsHigh'
    });
  }

  // ===== LOW RISK — VITÓRIAS (Double Chance: 2 pernas) =====
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
      betAmount: Math.max(20, Math.min(100, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.25)))),
      chancePercent,
      riskLevel: 'low',
      typeId: 'winsLow'
    });
  }

  // ===== MEDIUM RISK — VITÓRIAS (3 pernas: Moneyline) =====
  const mediumRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskWinsCount; i++) {
    const g1 = bestWinGames[i * 3] || getGame(i * 3);
    const g2 = bestWinGames[i * 3 + 1] || getGame(i * 3 + 1);
    const g3 = bestWinGames[i * 3 + 2] || getGame(i * 3 + 2);

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
      },
      {
        match: `${g3.homeTeam} x ${g3.awayTeam}`,
        bet: `${t('accumulators.victory')} ${g3.homeTeam}`,
        odd: g3.odds.home || 1.60
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.winsMediumRisk')}${isPremium && mediumRiskWinsCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(10, Math.min(60, Math.round(1000 * Math.max(0.01, (chancePercent / 100) * 0.15)))),
      chancePercent,
      riskLevel: 'medium',
      typeId: 'winsMedium'
    });
  }

  // ===== HIGH RISK — PLACARES EXATOS =====
  const highRiskScoresCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskScoresCount; i++) {
    const g1 = getGame(i * 3);
    const g2 = getGame(i * 3 + 1);
    const g3 = getGame(i * 3 + 2);
    const scores = [
      ['2-1', '3-2', '2-0'],
      ['1-0', '2-2', '3-1'],
      ['1-1', '3-0', '2-1']
    ][i] || ['2-1', '3-2', '2-0'];

    const bets = [
      {
        match: `${g1.homeTeam} x ${g1.awayTeam}`,
        bet: `${t('accumulators.score')} ${scores[0]}`,
        odd: 8.50 + (i * 2)
      },
      {
        match: `${g2.homeTeam} x ${g2.awayTeam}`,
        bet: `${t('accumulators.score')} ${scores[1]}`,
        odd: 21.00 + (i * 5)
      },
      {
        match: `${g3.homeTeam} x ${g3.awayTeam}`,
        bet: `${t('accumulators.score')} ${scores[2]}`,
        odd: 10.00 + (i * 3)
      }
    ];

    const chancePercent = calculateRealChance(bets);
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.exactScores')}${isPremium && highRiskScoresCount > 1 ? ` #${i + 1}` : ''}`,
      bets,
      betAmount: Math.max(5, Math.min(20, Math.round(1000 * Math.max(0.005, (chancePercent / 100) * 0.08)))),
      chancePercent,
      riskLevel: 'high',
      typeId: 'exactScores'
    });
  }

  return baseAccumulators;
}
