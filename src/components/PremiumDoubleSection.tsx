import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import { AccumulatorCard } from './AccumulatorCard';

interface PremiumDoubleSectionProps {
  games: Game[];
}

export function PremiumDoubleSection({ games }: PremiumDoubleSectionProps) {
  const { t } = useLanguage();

  const qualifyingGames = games.filter(g =>
    g.odds.home > 1.80 || g.odds.away > 1.80 || g.odds.over > 1.80
  ).slice(0, 2);

  const bets: { match: string; bet: string; odd: number; estimatedProb?: number }[] = qualifyingGames.length >= 2 ? qualifyingGames.map(g => {
    const useHome = g.odds.home > 1.80;
    const useAway = !useHome && g.odds.away > 1.80;
    return {
      match: `${g.homeTeam} x ${g.awayTeam}`,
      bet: useHome ? `${t('accumulators.victory')} ${g.homeTeam}` : useAway ? `${t('accumulators.victory')} ${g.awayTeam}` : t('accumulators.over25'),
      odd: useHome ? g.odds.home : useAway ? g.odds.away : g.odds.over,
      estimatedProb: g.analysis?.estimatedProbability,
    };
  }) : [
    { match: 'France x Portugal', bet: `${t('accumulators.victory')} France`, odd: 1.95 },
    { match: 'Germany x Netherlands', bet: t('accumulators.over25'), odd: 1.85 }
  ];

  // EUGINE's estimate: use estimatedProb when available, otherwise raw implied probability
  const combinedEugineProb = bets.reduce((acc: number, b) => {
    const prob = b.estimatedProb ? b.estimatedProb / 100 : (1 / b.odd);
    return acc * prob;
  }, 1);
  const chancePercent = Math.round(combinedEugineProb * 100);
  // Bookmaker fair chance (de-vigged, 7% margin removed)
  const bookmakerChance = Math.round(bets.reduce((acc: number, b) => acc * ((1 / b.odd) * 0.93), 1) * 100);

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          {t('premiumDouble.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          {t('premiumDouble.subtitle')} <span className="text-primary font-semibold">{t('premiumDouble.aboveOdds')}</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <AccumulatorCard
          emoji="💎"
          title={t('premiumDouble.premiumDouble')}
          typeId="premiumDouble"
          bets={bets}
          betAmount={50}
          chancePercent={chancePercent}
          bookmakerChance={bookmakerChance}
          riskLevel="medium"
        />
      </div>
    </section>
  );
}
