import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';
import { AccumulatorCard, RiskLevel } from './AccumulatorCard';

interface ZebraSectionProps {
  games: Game[];
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
  maxZebras?: number;
}

export function ZebraSection({ games, userTier = 'free', maxZebras }: ZebraSectionProps) {
  const { t } = useLanguage();
  const isPremium = userTier === 'premium';

  const highChanceGame = games.find(g => g.odds.away >= 2.5 && g.odds.away < 3.5) ||
                          games.find(g => g.odds.home >= 2.5 && g.odds.home < 3.5);
  const mediumChanceGame = games.find(g => g.odds.away >= 3.5 && g.odds.away < 5.0) ||
                            games.find(g => g.odds.away > 4.0);
  const lowChanceGame = games.find(g => g.odds.away >= 5.0) ||
                         games.find(g => g.odds.away > 4.5);

  const createZebraBet = (game: Game | undefined, fallback: { match: string; underdog: string; odd: number }) => {
    if (!game) return { match: fallback.match, bet: `${t('accumulators.victory')} ${fallback.underdog}`, odd: fallback.odd };
    const isAwayUnderdog = game.odds.away > game.odds.home;
    const underdog = isAwayUnderdog ? game.awayTeam : game.homeTeam;
    return {
      match: `${game.homeTeam} x ${game.awayTeam}`,
      bet: `${t('accumulators.victory')} ${underdog}`,
      odd: isAwayUnderdog ? game.odds.away : game.odds.home,
    };
  };

  const chanceMap: Record<string, { chance: number; risk: RiskLevel; label: string }> = {
    high: { chance: 40, risk: 'low', label: t('zebra.highChance') || 'Alta Chance' },
    medium: { chance: 25, risk: 'medium', label: t('zebra.mediumChance') || 'Média Chance' },
    low: { chance: 12, risk: 'high', label: t('zebra.lowChance') || 'Mínima Chance' },
  };

  const zebraConfigs = isPremium ? [
    { game: highChanceGame, level: 'high', fallback: { match: 'Sevilla x Real Sociedad', underdog: 'Real Sociedad', odd: 3.00 } },
    { game: mediumChanceGame, level: 'medium', fallback: { match: 'Athletic Bilbao x Barcelona', underdog: 'Athletic Bilbao', odd: 4.50 } },
    { game: lowChanceGame, level: 'low', fallback: { match: 'Cadiz x Real Madrid', underdog: 'Cadiz', odd: 7.50 } },
  ] : [
    { game: mediumChanceGame || lowChanceGame, level: 'medium', fallback: { match: 'Athletic Bilbao x Barcelona', underdog: 'Athletic Bilbao', odd: 4.50 } },
  ];

  let zebras = zebraConfigs;
  if (maxZebras !== undefined && maxZebras > 0) {
    zebras = zebras.slice(0, maxZebras);
  }

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      {isPremium && (
        <div className="text-center mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            🦓 {t('zebra.title')} - 3 {t('zebra.levels') || 'Níveis'}
          </h2>
          <p className="text-primary text-sm font-medium">
            ⭐ Premium: {t('zebra.threeLevels') || 'Alta, Média e Mínima Chance'}
          </p>
        </div>
      )}

      <div className={`grid gap-4 sm:gap-5 lg:gap-6 ${isPremium ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
        {zebras.map((z, idx) => {
          const bet = createZebraBet(z.game, z.fallback);
          const config = chanceMap[z.level];
          const betAmount = 20;

          // bookmakerChance = implied probability from odds
          const bookmakerChance = Math.round((1 / bet.odd) * 93);

          return (
            <AccumulatorCard
              key={idx}
              emoji="🦓"
              title={`${t('zebra.title')} - ${config.label}`}
              typeId="zebra"
              bets={[{ match: bet.match, bet: bet.bet, odd: bet.odd }]}
              betAmount={betAmount}
              chancePercent={config.chance}
              bookmakerChance={bookmakerChance}
              riskLevel={config.risk}
            />
          );
        })}
      </div>
    </section>
  );
}
