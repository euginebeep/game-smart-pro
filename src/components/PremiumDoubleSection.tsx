import { Diamond, TrendingUp, Shield } from 'lucide-react';
import { Game } from '@/types/game';

interface PremiumDoubleSectionProps {
  games: Game[];
}

export function PremiumDoubleSection({ games }: PremiumDoubleSectionProps) {
  // Find two games with odds > 1.80
  const qualifyingGames = games.filter(g => 
    g.odds.home > 1.80 || g.odds.away > 1.80 || g.odds.over > 1.80
  ).slice(0, 2);

  const bets = qualifyingGames.length >= 2 ? [
    {
      match: `${qualifyingGames[0].homeTeam} x ${qualifyingGames[0].awayTeam}`,
      bet: qualifyingGames[0].odds.home > 1.80 
        ? `Vitória ${qualifyingGames[0].homeTeam}` 
        : 'Mais de 2.5 gols',
      odd: qualifyingGames[0].odds.home > 1.80 
        ? qualifyingGames[0].odds.home 
        : qualifyingGames[0].odds.over
    },
    {
      match: `${qualifyingGames[1].homeTeam} x ${qualifyingGames[1].awayTeam}`,
      bet: qualifyingGames[1].odds.away > 1.80 
        ? `Vitória ${qualifyingGames[1].awayTeam}` 
        : 'Mais de 2.5 gols',
      odd: qualifyingGames[1].odds.away > 1.80 
        ? qualifyingGames[1].odds.away 
        : qualifyingGames[1].odds.over
    }
  ] : [
    { match: 'France x Portugal', bet: 'Vitória França', odd: 1.95 },
    { match: 'Germany x Netherlands', bet: 'Mais de 2.5 gols', odd: 1.85 }
  ];

  const totalOdd = bets.reduce((acc, bet) => acc * bet.odd, 1);
  const betAmount = 50;
  const profit = (betAmount * totalOdd) - betAmount;

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          💎 Dupla dos Favoritos
        </h2>
        <p className="text-muted-foreground text-lg">
          Apenas 2 jogos com odds boas <span className="text-primary font-semibold">(acima de 1.80)</span>
        </p>
      </div>

      {/* Premium Double Card */}
      <div className="max-w-2xl mx-auto">
        <article className="glass-card p-6 lg:p-8 animate-fade-in-up bg-primary/10 border-primary/30">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Diamond className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-primary">DUPLA PREMIUM</h3>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold bg-primary/20 text-primary">
                <Shield className="w-3 h-3" />
                SEGURO
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase">Odd Total</p>
              <p className="text-3xl font-black gradient-text-success">{totalOdd.toFixed(2)}</p>
            </div>
          </div>

          {/* Bets */}
          <div className="space-y-3 mb-6">
            {bets.map((bet, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{bet.match}</p>
                    <p className="text-sm text-muted-foreground">{bet.bet}</p>
                  </div>
                  <span className="text-xl font-bold text-primary">@{bet.odd.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/20 rounded-xl p-4 text-center border border-primary/30">
              <p className="text-xs text-muted-foreground uppercase mb-1">Chance de Acerto</p>
              <p className="text-3xl font-black text-primary">75%</p>
            </div>
            <div className="bg-primary/20 rounded-xl p-4 text-center border border-primary/30">
              <p className="text-xs text-muted-foreground uppercase mb-1">Retorno</p>
              <p className="text-3xl font-black text-primary">R$ {(betAmount * totalOdd).toFixed(0)}</p>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-primary/20 rounded-xl p-4 border border-primary/30">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <p className="text-lg">
                <span className="text-muted-foreground">Aposta R$ {betAmount} → </span>
                <span className="font-bold text-primary">Lucro R$ {profit.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
