import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Game } from '@/types/game';
import { useLanguage } from '@/contexts/LanguageContext';

interface ZebraSectionProps {
  games: Game[];
}

export function ZebraSection({ games }: ZebraSectionProps) {
  const { t } = useLanguage();
  
  // Find a game where the away team is the underdog (higher odds)
  const underdogGame = games.find(g => g.odds.away > 4.0) || games.find(g => g.odds.away > 3.0);
  
  const zebraData = underdogGame ? {
    match: `${underdogGame.homeTeam} x ${underdogGame.awayTeam}`,
    underdog: underdogGame.awayTeam,
    favorite: underdogGame.homeTeam,
    odd: underdogGame.odds.away,
    reason: `${underdogGame.awayTeam} ${t('zebra.goodResults')} ${underdogGame.homeTeam} ${t('zebra.overvalued')}`
  } : {
    match: 'Athletic Bilbao x Barcelona',
    underdog: 'Athletic Bilbao',
    favorite: 'Barcelona',
    odd: 4.50,
    reason: `Athletic Bilbao ${t('zebra.defaultReason')}`
  };

  const betAmount = 20;
  const profit = (betAmount * zebraData.odd) - betAmount;
  const chancePercent = Math.min(50, Math.max(35, Math.round(100 / zebraData.odd)));

  return (
    <section className="mt-8 sm:mt-10 lg:mt-12">
      {/* Zebra Card - Special Design */}
      <article 
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 xl:p-10 animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, hsl(280 80% 25%) 0%, hsl(320 70% 30%) 50%, hsl(340 60% 35%) 100%)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-5 sm:mb-6 lg:mb-8">
            <span className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3 lg:mb-4 block">🦓</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1 sm:mb-2">
              {t('zebra.title')}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-white/80">
              <Sparkles className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              {t('zebra.surpriseBet')}
            </p>
          </div>

          {/* Match Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-5 lg:mb-6 border border-white/20">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-3 sm:mb-4">
              {zebraData.match}
            </h3>
            
            <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
              <div className="text-center min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/60 uppercase">{t('zebra.zebra')}</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-yellow-300 truncate">{zebraData.underdog}</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">⚡</div>
              <div className="text-center min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs lg:text-sm text-white/60 uppercase">{t('zebra.favorite')}</p>
                <p className="text-sm sm:text-base lg:text-xl font-bold text-white/80 truncate">{zebraData.favorite}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-white/60 uppercase mb-0.5 sm:mb-1">{t('zebra.zebraOdd')}</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-300">
                @{zebraData.odd.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-5 lg:mb-6 border border-white/20">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-yellow-300 mb-0.5 sm:mb-1">{t('zebra.whatIsZebra')}</p>
                <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
                  {t('zebra.zebraExplanation')}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">{t('zebra.whyBet')}</p>
                <p className="text-white/80 text-xs sm:text-sm">
                  {zebraData.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-white/20">
              <p className="text-[10px] sm:text-xs text-white/60 uppercase mb-0.5 sm:mb-1">{t('zebra.chanceOfSuccess')}</p>
              <p className="text-2xl sm:text-3xl font-black text-yellow-300">{chancePercent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 text-center border border-white/20">
              <p className="text-[10px] sm:text-xs text-white/60 uppercase mb-0.5 sm:mb-1">{t('zebra.return')}</p>
              <p className="text-2xl sm:text-3xl font-black text-yellow-300">R$ {(betAmount * zebraData.odd).toFixed(0)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-yellow-400/30">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              <p className="text-sm sm:text-base lg:text-lg text-white">
                <span className="text-white/70">R$ {betAmount} → </span>
                <span className="font-bold text-yellow-300">R$ {profit.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}