import { AccumulatorCard, RiskLevel } from './AccumulatorCard';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccumulatorsSectionProps {
  games: Game[];
}

export function AccumulatorsSection({ games }: AccumulatorsSectionProps) {
  const { t } = useLanguage();
  
  // Generate accumulators based on available games
  const accumulators = generateAccumulators(games, t);

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

function generateAccumulators(games: Game[], t: (key: string) => string): AccumulatorData[] {
  // Use real games if available, otherwise use placeholder data
  const game1 = games[0];
  const game2 = games[1];
  const game3 = games[2];
  const game4 = games[3];
  const game5 = games[4];

  return [
    // ACCUMULATOR 1 - Low Risk (Goals)
    {
      emoji: '🛡️',
      title: t('accumulators.goalsLowRisk'),
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
      chancePercent: 85,
      riskLevel: 'low'
    },
    // ACCUMULATOR 2 - Medium Risk (Goals)
    {
      emoji: '⚖️',
      title: t('accumulators.goalsMediumRisk'),
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
      chancePercent: 65,
      riskLevel: 'medium'
    },
    // ACCUMULATOR 3 - High Risk (Goals)
    {
      emoji: '🚀',
      title: t('accumulators.goalsHighRisk'),
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
      chancePercent: 30,
      riskLevel: 'high'
    },
    // ACCUMULATOR 4 - Low Risk (Wins - Double Chance)
    {
      emoji: '🛡️',
      title: t('accumulators.winsDoubleChance'),
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
      chancePercent: 90,
      riskLevel: 'low'
    },
    // ACCUMULATOR 5 - Medium Risk (Wins)
    {
      emoji: '⚖️',
      title: t('accumulators.winsMediumRisk'),
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
      chancePercent: 70,
      riskLevel: 'medium'
    },
    // ACCUMULATOR 6 - High Risk (Exact Scores)
    {
      emoji: '🚀',
      title: t('accumulators.exactScores'),
      bets: [
        {
          match: game1 ? `${game1.homeTeam} x ${game1.awayTeam}` : 'Liverpool x Arsenal',
          bet: `${t('accumulators.score')} 2-1`,
          odd: 8.50
        },
        {
          match: game2 ? `${game2.homeTeam} x ${game2.awayTeam}` : 'Chelsea x Tottenham',
          bet: `${t('accumulators.score')} 3-2`,
          odd: 21.00
        },
        {
          match: game3 ? `${game3.homeTeam} x ${game3.awayTeam}` : 'Man United x Newcastle',
          bet: `${t('accumulators.score')} 2-0`,
          odd: 10.00
        }
      ],
      betAmount: 5,
      chancePercent: 5,
      riskLevel: 'high'
    }
  ];
}