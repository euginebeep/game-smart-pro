import { Crown } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import { AccumulatorCard } from './AccumulatorCard';

interface FavoritesDoubleSectionProps {
  games: Game[];
}

export function FavoritesDoubleSection({ games }: FavoritesDoubleSectionProps) {
  const { t } = useLanguage();

  const sortedByFavorite = [...games]
    .filter(g => g.odds.home >= 1.60 && g.odds.home <= 2.20 && g.analysis?.confidence)
    .sort((a, b) => (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0))
    .slice(0, 2);

  const bets: { match: string; bet: string; odd: number; estimatedProb?: number }[] = sortedByFavorite.length >= 2 ? sortedByFavorite.map(g => ({
    match: `${g.homeTeam} x ${g.awayTeam}`,
    bet: `${t('accumulators.victory')} ${g.homeTeam}`,
    odd: g.odds.home,
    estimatedProb: g.analysis?.estimatedProbability,
  })) : [
    { match: 'Real Madrid x Getafe', bet: `${t('accumulators.victory')} Real Madrid`, odd: 1.65 },
    { match: 'Bayern x Augsburg', bet: `${t('accumulators.victory')} Bayern`, odd: 1.60 }
  ];

  // Calculate combined probability
  const combinedProb = bets.reduce((acc: number, b) => acc * ((1 / b.odd) * 0.93), 1);
  const chancePercent = Math.round(combinedProb * 100);
  const bookmakerChance = Math.round(bets.reduce((acc: number, b) => acc * (1 / b.odd), 1) * 100);

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-500">
            {t('common.premiumExclusive') || 'Premium Exclusive'}
          </span>
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          {t('favoritesDouble.title') || '⭐ Dupla dos Favoritos'}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          {t('favoritesDouble.subtitle') || 'Apostas em times favoritos com'}{' '}
          <span className="text-amber-500 font-semibold">{t('favoritesDouble.highProbability') || 'alta probabilidade'}</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <AccumulatorCard
          emoji="⭐"
          title={t('favoritesDouble.cardTitle') || 'Dupla dos Favoritos'}
          typeId="favoritesDouble"
          bets={bets}
          betAmount={100}
          chancePercent={chancePercent}
          bookmakerChance={bookmakerChance}
          riskLevel="low"
        />
      </div>
    </section>
  );
}
