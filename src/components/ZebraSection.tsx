import { Sparkles, TrendingUp, AlertTriangle, Zap, Target, Crown } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface ZebraSectionProps {
  games: Game[];
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
  maxZebras?: number;
}

interface ZebraData {
  match: string;
  underdog: string;
  favorite: string;
  odd: number;
  reason: string;
  chanceLevel: 'high' | 'medium' | 'low';
}

export function ZebraSection({ games, userTier = 'free', maxZebras }: ZebraSectionProps) {
  const { t } = useLanguage();
  const isPremium = userTier === 'premium';
  
  // Find games for different chance levels
  // High chance: odds 2.5-3.5 (more likely to hit)
  // Medium chance: odds 3.5-5.0 (moderate risk)
  // Low chance: odds 5.0+ (true underdog, high risk)
  
  const highChanceGame = games.find(g => g.odds.away >= 2.5 && g.odds.away < 3.5) || 
                          games.find(g => g.odds.home >= 2.5 && g.odds.home < 3.5);
  const mediumChanceGame = games.find(g => g.odds.away >= 3.5 && g.odds.away < 5.0) || 
                            games.find(g => g.odds.away > 4.0);
  const lowChanceGame = games.find(g => g.odds.away >= 5.0) || 
                         games.find(g => g.odds.away > 4.5);

  const createZebraData = (game: Game | undefined, level: 'high' | 'medium' | 'low', defaultData: ZebraData): ZebraData => {
    if (!game) return defaultData;
    
    const isAwayUnderdog = game.odds.away > game.odds.home;
    return {
      match: `${game.homeTeam} x ${game.awayTeam}`,
      underdog: isAwayUnderdog ? game.awayTeam : game.homeTeam,
      favorite: isAwayUnderdog ? game.homeTeam : game.awayTeam,
      odd: isAwayUnderdog ? game.odds.away : game.odds.home,
      reason: `${isAwayUnderdog ? game.awayTeam : game.homeTeam} ${t('zebra.goodResults')} ${isAwayUnderdog ? game.homeTeam : game.awayTeam} ${t('zebra.overvalued')}`,
      chanceLevel: level
    };
  };

  let zebras: ZebraData[] = isPremium ? [
    createZebraData(highChanceGame, 'high', {
      match: 'Sevilla x Real Sociedad',
      underdog: 'Real Sociedad',
      favorite: 'Sevilla',
      odd: 3.00,
      reason: `Real Sociedad ${t('zebra.defaultReason')}`,
      chanceLevel: 'high'
    }),
    createZebraData(mediumChanceGame, 'medium', {
      match: 'Athletic Bilbao x Barcelona',
      underdog: 'Athletic Bilbao',
      favorite: 'Barcelona',
      odd: 4.50,
      reason: `Athletic Bilbao ${t('zebra.defaultReason')}`,
      chanceLevel: 'medium'
    }),
    createZebraData(lowChanceGame, 'low', {
      match: 'Cadiz x Real Madrid',
      underdog: 'Cadiz',
      favorite: 'Real Madrid',
      odd: 7.50,
      reason: `Cadiz ${t('zebra.defaultReason')}`,
      chanceLevel: 'low'
    })
  ] : [
    createZebraData(mediumChanceGame || lowChanceGame, 'medium', {
      match: 'Athletic Bilbao x Barcelona',
      underdog: 'Athletic Bilbao',
      favorite: 'Barcelona',
      odd: 4.50,
      reason: `Athletic Bilbao ${t('zebra.defaultReason')}`,
      chanceLevel: 'medium'
    })
  ];
  
  // Apply max limit for free users
  if (maxZebras !== undefined && maxZebras > 0) {
    zebras = zebras.slice(0, maxZebras);
  }

  const chanceConfig = {
    high: {
      label: t('zebra.highChance') || 'Alta Chance',
      icon: Crown,
      color: 'from-emerald-500/30 to-green-500/30',
      borderColor: 'border-emerald-500/50',
      textColor: 'text-emerald-300',
      chancePercent: 40
    },
    medium: {
      label: t('zebra.mediumChance') || 'Média Chance',
      icon: Target,
      color: 'from-yellow-500/30 to-amber-500/30',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-300',
      chancePercent: 25
    },
    low: {
      label: t('zebra.lowChance') || 'Mínima Chance',
      icon: Zap,
      color: 'from-red-500/30 to-pink-500/30',
      borderColor: 'border-red-500/50',
      textColor: 'text-red-300',
      chancePercent: 12
    }
  };

  const betAmount = 20;

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      {/* Section Header for Premium */}
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

      <div className={`grid gap-4 sm:gap-6 ${isPremium ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
        {zebras.map((zebraData, idx) => {
          const config = chanceConfig[zebraData.chanceLevel];
          const IconComponent = config.icon;
          const profit = (betAmount * zebraData.odd) - betAmount;
          const chancePercent = config.chancePercent;

          return (
            <article 
              key={idx}
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 animate-fade-in-up"
              style={{
                background: 'linear-gradient(135deg, hsl(280 80% 25%) 0%, hsl(320 70% 30%) 50%, hsl(340 60% 35%) 100%)',
                animationDelay: `${idx * 150}ms`
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              {/* Chance Level Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r ${config.color} ${config.borderColor} border backdrop-blur-sm`}>
                <div className="flex items-center gap-1.5">
                  <IconComponent className={`w-3.5 h-3.5 ${config.textColor}`} />
                  <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-5">
                  <span className="text-3xl sm:text-4xl mb-2 block">🦓</span>
                  {!isPremium && (
                    <>
                      <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                        {t('zebra.title')}
                      </h2>
                      <p className="text-sm text-white/80">
                        <Sparkles className="inline w-4 h-4 mr-1" />
                        {t('zebra.surpriseBet')}
                      </p>
                    </>
                  )}
                </div>

                {/* Match Info */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-white/20">
                  <h3 className="text-base sm:text-lg font-bold text-white text-center mb-2 sm:mb-3">
                    {zebraData.match}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="text-center min-w-0 flex-1">
                      <p className="text-[10px] text-white/60 uppercase">{t('zebra.zebra')}</p>
                      <p className="text-sm font-bold text-yellow-300 truncate">{zebraData.underdog}</p>
                    </div>
                    <div className="text-xl sm:text-2xl flex-shrink-0">⚡</div>
                    <div className="text-center min-w-0 flex-1">
                      <p className="text-[10px] text-white/60 uppercase">{t('zebra.favorite')}</p>
                      <p className="text-sm font-bold text-white/80 truncate">{zebraData.favorite}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-white/60 uppercase mb-0.5">{t('zebra.zebraOdd')}</p>
                    <p className={`text-2xl sm:text-3xl font-black ${config.textColor}`}>
                      @{zebraData.odd.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Explanation - Compact for Premium */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 mb-3 sm:mb-4 border border-white/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-yellow-300 mb-0.5">{t('zebra.whyBet')}</p>
                      <p className="text-white/80 text-xs">
                        {zebraData.reason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                  <div className={`bg-gradient-to-r ${config.color} backdrop-blur-sm rounded-lg p-2 text-center border ${config.borderColor}`}>
                    <p className="text-[10px] text-white/60 uppercase mb-0.5">{t('zebra.chanceOfSuccess')}</p>
                    <p className={`text-xl sm:text-2xl font-black ${config.textColor}`}>{chancePercent}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center border border-white/20">
                    <p className="text-[10px] text-white/60 uppercase mb-0.5">{t('zebra.return')}</p>
                    <p className="text-xl sm:text-2xl font-black text-yellow-300">$ {(betAmount * zebraData.odd).toFixed(0)}</p>
                  </div>
                </div>

                {/* Profit */}
                <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-2 border border-yellow-400/30">
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-yellow-300" />
                    <p className="text-sm text-white">
                      <span className="text-white/70">$ {betAmount} → </span>
                      <span className="font-bold text-yellow-300">$ {profit.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
