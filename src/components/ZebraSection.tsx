import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Game } from '@/types/game';

interface ZebraSectionProps {
  games: Game[];
}

export function ZebraSection({ games }: ZebraSectionProps) {
  // Find a game where the away team is the underdog (higher odds)
  const underdogGame = games.find(g => g.odds.away > 4.0) || games.find(g => g.odds.away > 3.0);
  
  const zebraData = underdogGame ? {
    match: `${underdogGame.homeTeam} x ${underdogGame.awayTeam}`,
    underdog: underdogGame.awayTeam,
    favorite: underdogGame.homeTeam,
    odd: underdogGame.odds.away,
    reason: `${underdogGame.awayTeam} vem de bons resultados e pode surpreender jogando fora de casa. O favoritismo de ${underdogGame.homeTeam} está supervalorizado.`
  } : {
    match: 'Athletic Bilbao x Barcelona',
    underdog: 'Athletic Bilbao',
    favorite: 'Barcelona',
    odd: 4.50,
    reason: 'Athletic Bilbao jogando em casa no San Mamés é muito forte. Histórico recente mostra que podem vencer o Barcelona!'
  };

  const betAmount = 20;
  const profit = (betAmount * zebraData.odd) - betAmount;
  const chancePercent = Math.min(50, Math.max(35, Math.round(100 / zebraData.odd)));

  return (
    <section className="mt-12">
      {/* Zebra Card - Special Design */}
      <article 
        className="relative overflow-hidden rounded-3xl p-8 lg:p-10 animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, hsl(280 80% 25%) 0%, hsl(320 70% 30%) 50%, hsl(340 60% 35%) 100%)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">🦓</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">
              ZEBRA DO DIA
            </h2>
            <p className="text-xl text-white/80">
              <Sparkles className="inline w-5 h-5 mr-1" />
              APOSTA SURPRESA!
            </p>
          </div>

          {/* Match Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              {zebraData.match}
            </h3>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-white/60 uppercase">Zebra</p>
                <p className="text-xl font-bold text-yellow-300">{zebraData.underdog}</p>
              </div>
              <div className="text-4xl">⚡</div>
              <div className="text-center">
                <p className="text-sm text-white/60 uppercase">Favorito</p>
                <p className="text-xl font-bold text-white/80">{zebraData.favorite}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-white/60 uppercase mb-1">Odd da Zebra</p>
              <p className="text-5xl font-black text-yellow-300">
                @{zebraData.odd.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-yellow-300 mb-1">O que é uma Zebra?</p>
                <p className="text-white/80 text-sm mb-3">
                  Zebra = time mais fraco (azarão) vence o favorito!
                </p>
                <p className="text-sm font-bold text-white mb-1">Por que apostar?</p>
                <p className="text-white/80 text-sm">
                  {zebraData.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Chance de Acerto</p>
              <p className="text-3xl font-black text-yellow-300">{chancePercent}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Retorno</p>
              <p className="text-3xl font-black text-yellow-300">R$ {(betAmount * zebraData.odd).toFixed(0)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-300" />
              <p className="text-lg text-white">
                <span className="text-white/70">Aposta R$ {betAmount} → </span>
                <span className="font-bold text-yellow-300">Lucro R$ {profit.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
