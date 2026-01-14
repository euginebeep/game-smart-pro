import { Diamond, TrendingUp, Shield } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface PremiumDoubleSectionProps {
  games: Game[];
}

export function PremiumDoubleSection({ games }: PremiumDoubleSectionProps) {
  const { t } = useLanguage();
  
  // Find two games with odds > 1.80
  const qualifyingGames = games.filter(g => 
    g.odds.home > 1.80 || g.odds.away > 1.80 || g.odds.over > 1.80
  ).slice(0, 2);

  const bets = qualifyingGames.length >= 2 ? [
    {
      match: `${qualifyingGames[0].homeTeam} x ${qualifyingGames[0].awayTeam}`,
      bet: qualifyingGames[0].odds.home > 1.80 
        ? `${t('accumulators.victory')} ${qualifyingGames[0].homeTeam}` 
        : t('accumulators.over25'),
      odd: qualifyingGames[0].odds.home > 1.80 
        ? qualifyingGames[0].odds.home 
        : qualifyingGames[0].odds.over
    },
    {
      match: `${qualifyingGames[1].homeTeam} x ${qualifyingGames[1].awayTeam}`,
      bet: qualifyingGames[1].odds.away > 1.80 
        ? `${t('accumulators.victory')} ${qualifyingGames[1].awayTeam}` 
        : t('accumulators.over25'),
      odd: qualifyingGames[1].odds.away > 1.80 
        ? qualifyingGames[1].odds.away 
        : qualifyingGames[1].odds.over
    }
  ] : [
    { match: 'France x Portugal', bet: `${t('accumulators.victory')} France`, odd: 1.95 },
    { match: 'Germany x Netherlands', bet: t('accumulators.over25'), odd: 1.85 }
  ];

  const totalOdd = bets.reduce((acc, bet) => acc * bet.odd, 1);
  const betAmount = 50;
  const profit = (betAmount * totalOdd) - betAmount;

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      {/* Section Header */}
      <div className="text-center mb-5 sm:mb-6 lg:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-1 sm:mb-2">
          {t('premiumDouble.title')}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          {t('premiumDouble.subtitle')} <span className="text-primary font-semibold">{t('premiumDouble.aboveOdds')}</span>
        </p>
      </div>

      {/* Premium Double Card */}
      <div className="max-w-2xl mx-auto">
        <article className="glass-card p-4 sm:p-6 lg:p-8 animate-fade-in-up bg-primary/10 border-primary/30">
          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center">
              <Diamond className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-primary">{t('premiumDouble.premiumDouble')}</h3>
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-primary/20 text-primary">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {t('premiumDouble.safe')}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase">{t('premiumDouble.totalOdd')}</p>
              <p className="text-2xl sm:text-3xl font-black gradient-text-success">{totalOdd.toFixed(2)}</p>
            </div>
          </div>

          {/* Bets */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {bets.map((bet, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{bet.match}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{bet.bet}</p>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-primary flex-shrink-0">@{bet.odd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <div className="bg-primary/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-primary/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1">{t('premiumDouble.chanceOfSuccess')}</p>
              <p className="text-2xl sm:text-3xl font-black text-primary">75%</p>
            </div>
            <div className="bg-primary/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-primary/30">
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1">{t('premiumDouble.return')}</p>
              <p className="text-2xl sm:text-3xl font-black text-primary">R$ {(betAmount * totalOdd).toFixed(0)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-primary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/30">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <p className="text-sm sm:text-base lg:text-lg">
                <span className="text-muted-foreground">R$ {betAmount} → </span>
                <span className="font-bold text-primary">R$ {profit.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}