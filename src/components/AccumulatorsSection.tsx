import { AccumulatorCard, RiskLevel } from './AccumulatorCard';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccumulatorsSectionProps {
  games: Game[];
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function AccumulatorsSection({ games, userTier = 'free' }: AccumulatorsSectionProps) {
  const { t } = useLanguage();
  
  // Premium users get 3 cards of each type (9 total), others get 6 cards (2 of each)
  const isPremium = userTier === 'premium';
  const accumulators = generateAccumulators(games, t, isPremium);

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
        {isPremium && (
          <p className="text-primary text-sm font-medium mt-2">
            ⭐ Premium: 3x {t('accumulators.moreCards')}
          </p>
        )}
      </div>

      {/* Accumulators Grid */}
      <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accumulators.map((acc, idx) => (
          <AccumulatorCard
            key={idx}
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
}

function generateAccumulators(games: Game[], t: (key: string) => string, isPremium: boolean): AccumulatorData[] {
  // Get games for accumulators
  const getGame = (index: number) => games[index];
  
  const baseAccumulators: AccumulatorData[] = [];
  
  // Generate LOW RISK cards (Goals)
  const lowRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskGoalsCount; i++) {
    const game1 = getGame(i * 2);
    const game2 = getGame(i * 2 + 1);
    baseAccumulators.push({
      emoji: '🛡️',
      title: `${t('accumulators.goalsLowRisk')}${isPremium && lowRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Senegal x Egypt',
          bet: t('accumulators.bothScore'),
          odd: game1 ? Math.min(game1.odds.over * 1.05, 1.89) : 1.89
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Brazil x Argentina',
          bet: t('accumulators.atLeast2Goals'),
          odd: game2 ? Math.min(game2.odds.over, 1.75) : 1.75
        }
      ],
      betAmount: 60,
      chancePercent: 85 - (i * 3),
      riskLevel: 'low'
    });
  }

  // Generate MEDIUM RISK cards (Goals)
  const mediumRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskGoalsCount; i++) {
    const game1 = getGame(i * 3);
    const game2 = getGame(i * 3 + 1);
    const game3 = getGame(i * 3 + 2);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.goalsMediumRisk')}${isPremium && mediumRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Barcelona x Real Madrid',
          bet: t('accumulators.over25'),
          odd: game1?.odds.over || 1.85
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Liverpool x Man City',
          bet: t('accumulators.bothTeamsScore'),
          odd: game2 ? (game2.odds.over * 0.95) : 1.70
        },
        {
          match: game3 ? `${game3.homeTeam} x ${game3.awayTeam}` : 'PSG x Bayern',
          bet: t('accumulators.over25'),
          odd: game3?.odds.over || 1.65
        }
      ],
      betAmount: 40,
      chancePercent: 65 - (i * 5),
      riskLevel: 'medium'
    });
  }

  // Generate HIGH RISK cards (Goals)
  const highRiskGoalsCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskGoalsCount; i++) {
    const game1 = getGame(i * 4);
    const game2 = getGame(i * 4 + 1);
    const game3 = getGame(i * 4 + 2);
    const game4 = getGame(i * 4 + 3);
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.goalsHighRisk')}${isPremium && highRiskGoalsCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Ajax x PSV',
          bet: t('accumulators.over35'),
          odd: game1 ? (game1.odds.over * 1.4) : 2.50
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Dortmund x Leipzig',
          bet: t('accumulators.over35'),
          odd: game2 ? (game2.odds.over * 1.35) : 2.40
        },
        {
          match: game3 ? `${game3.homeTeam} x ${game3.awayTeam}` : 'Inter x Milan',
          bet: t('accumulators.over45'),
          odd: game3 ? (game3.odds.over * 1.8) : 3.20
        },
        {
          match: game4 ? `${game4.homeTeam} x ${game4.awayTeam}` : 'Napoli x Juventus',
          bet: t('accumulators.over35'),
          odd: game4 ? (game4.odds.over * 1.5) : 2.75
        }
      ],
      betAmount: 10,
      chancePercent: 30 - (i * 5),
      riskLevel: 'high'
    });
  }

  // Generate LOW RISK cards (Wins - Double Chance)
  const lowRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < lowRiskWinsCount; i++) {
    const game1 = getGame(i * 2);
    const game2 = getGame(i * 2 + 1);
    baseAccumulators.push({
      emoji: '🛡️',
      title: `${t('accumulators.winsDoubleChance')}${isPremium && lowRiskWinsCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Real Madrid x Getafe',
          bet: `${game1?.homeTeam || 'Real Madrid'} ${t('accumulators.winOrDraw')}`,
          odd: game1 ? Math.max(1.15, game1.odds.home * 0.65) : 1.18
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Man City x Brighton',
          bet: `${game2?.homeTeam || 'Man City'} ${t('accumulators.winOrDraw')}`,
          odd: game2 ? Math.max(1.12, game2.odds.home * 0.6) : 1.20
        }
      ],
      betAmount: 80,
      chancePercent: 90 - (i * 3),
      riskLevel: 'low'
    });
  }

  // Generate MEDIUM RISK cards (Wins)
  const mediumRiskWinsCount = isPremium ? 3 : 1;
  for (let i = 0; i < mediumRiskWinsCount; i++) {
    const game1 = getGame(i * 3);
    const game2 = getGame(i * 3 + 1);
    const game3 = getGame(i * 3 + 2);
    baseAccumulators.push({
      emoji: '⚖️',
      title: `${t('accumulators.winsMediumRisk')}${isPremium && mediumRiskWinsCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Bayern x Hoffenheim',
          bet: `${t('accumulators.victory')} ${game1?.homeTeam || 'Bayern'}`,
          odd: game1?.odds.home || 1.45
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Barcelona x Sevilla',
          bet: `${t('accumulators.victory')} ${game2?.homeTeam || 'Barcelona'}`,
          odd: game2?.odds.home || 1.55
        },
        {
          match: game3 ? `${game3.homeTeam} x ${game3.awayTeam}` : 'PSG x Lille',
          bet: `${t('accumulators.victory')} ${game3?.homeTeam || 'PSG'}`,
          odd: game3?.odds.home || 1.60
        }
      ],
      betAmount: 40,
      chancePercent: 70 - (i * 5),
      riskLevel: 'medium'
    });
  }

  // Generate HIGH RISK cards (Exact Scores)
  const highRiskScoresCount = isPremium ? 3 : 1;
  for (let i = 0; i < highRiskScoresCount; i++) {
    const game1 = getGame(i * 3);
    const game2 = getGame(i * 3 + 1);
    const game3 = getGame(i * 3 + 2);
    const scores = [
      ['2-1', '3-2', '2-0'],
      ['1-0', '2-2', '3-1'],
      ['1-1', '3-0', '2-1']
    ][i] || ['2-1', '3-2', '2-0'];
    baseAccumulators.push({
      emoji: '🚀',
      title: `${t('accumulators.exactScores')}${isPremium && highRiskScoresCount > 1 ? ` #${i + 1}` : ''}`,
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Liverpool x Arsenal',
          bet: `${t('accumulators.score')} ${scores[0]}`,
          odd: 8.50 + (i * 2)
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Chelsea x Tottenham',
          bet: `${t('accumulators.score')} ${scores[1]}`,
          odd: 21.00 + (i * 5)
        },
        {
          match: game3 ? `${game3.homeTeam} x ${game3.awayTeam}` : 'Man United x Newcastle',
          bet: `${t('accumulators.score')} ${scores[2]}`,
          odd: 10.00 + (i * 3)
        }
      ],
      betAmount: 5,
      chancePercent: Math.max(2, 5 - i),
      riskLevel: 'high'
    });
  }

  return baseAccumulators;
}
