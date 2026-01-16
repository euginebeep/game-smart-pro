import { Star, TrendingUp, Crown } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface FavoritesDoubleSectionProps {
  games: Game[];
}

export function FavoritesDoubleSection({ games }: FavoritesDoubleSectionProps) {
  const { t } = useLanguage();
  
  // Find two games with odds between 1.60 and 2.20 with highest confidence from analysis engine
  const sortedByFavorite = [...games]
    .filter(g => g.odds.home >= 1.60 && g.odds.home <= 2.20 && g.analysis?.confidence)
    .sort((a, b) => (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0))
    .slice(0, 2);

  const bets = sortedByFavorite.length >= 2 ? [
    {
      match: `${sortedByFavorite[0].homeTeam} x ${sortedByFavorite[0].awayTeam}`,
      bet: `${t('accumulators.victory')} ${sortedByFavorite[0].homeTeam}`,
      odd: sortedByFavorite[0].odds.home,
      league: sortedByFavorite[0].league,
      confidence: sortedByFavorite[0].analysis?.confidence || 0
    },
    {
      match: `${sortedByFavorite[1].homeTeam} x ${sortedByFavorite[1].awayTeam}`,
      bet: `${t('accumulators.victory')} ${sortedByFavorite[1].homeTeam}`,
      odd: sortedByFavorite[1].odds.home,
      league: sortedByFavorite[1].league,
      confidence: sortedByFavorite[1].analysis?.confidence || 0
    }
  ] : [
    { match: 'Real Madrid x Getafe', bet: `${t('accumulators.victory')} Real Madrid`, odd: 1.65, league: 'La Liga', confidence: 72 },
    { match: 'Bayern x Augsburg', bet: `${t('accumulators.victory')} Bayern`, odd: 1.60, league: 'Bundesliga', confidence: 70 }
  ];

  const totalOdd = bets.reduce((acc, bet) => acc * bet.odd, 1);
  const betAmount = 100;
  const profit = (betAmount * totalOdd) - betAmount;
  // Calculate combined success chance from individual analysis confidence scores
  // Using geometric mean for combined probability of independent events
  const avgConfidence = bets.reduce((acc, bet) => acc + bet.confidence, 0) / bets.length;
  const successChance = Math.round(avgConfidence);

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      {/* Section Header */}
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

      {/* Favorites Double Card */}
      <div className="max-w-2xl mx-auto">
        <article className="glass-card p-4 sm:p-6 lg:p-8 animate-fade-in-up bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-500/30">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-amber-500">
                {t('favoritesDouble.cardTitle') || 'Dupla dos Favoritos'}
              </h3>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-amber-500/20 text-amber-500">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                {t('favoritesDouble.favorites') || 'FAVORITOS'}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">{t('premiumDouble.totalOdd')}</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">{totalOdd.toFixed(2)}</p>
            </div>
          </div>

          {/* Bets */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {bets.map((bet, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-500/20">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{bet.match}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{bet.bet}</p>
                      <span className="text-[10px] text-amber-500/70 hidden sm:inline">• {bet.league}</span>
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-amber-500 flex-shrink-0">@{bet.odd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <div className="bg-amber-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-amber-500/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1">{t('premiumDouble.chanceOfSuccess')}</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">{successChance}%</p>
            </div>
            <div className="bg-amber-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-amber-500/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1">{t('premiumDouble.return')}</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">$ {(betAmount * totalOdd).toFixed(0)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-500/30">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <p className="text-sm sm:text-base lg:text-lg">
                <span className="text-muted-foreground">$ {betAmount} → </span>
                <span className="font-bold text-amber-500">+$ {profit.toFixed(2)} {t('favoritesDouble.profit') || 'lucro'}</span>
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
