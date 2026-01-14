import { TrendingUp, Shield, Scale, Rocket } from 'lucide-react';
import { Game } from '@/types/game';

export type RiskLevel = 'low' | 'medium' | 'high';

interface AccumulatorBet {
  match: string;
  bet: string;
  odd: number;
}

interface AccumulatorCardProps {
  emoji: string;
  title: string;
  bets: AccumulatorBet[];
  betAmount: number;
  chancePercent: number;
  riskLevel: RiskLevel;
  delay?: number;
}

const riskConfig = {
  low: {
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
    textClass: 'text-primary',
    icon: Shield,
    label: 'SEGURO'
  },
  medium: {
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
    textClass: 'text-warning',
    icon: Scale,
    label: 'MÉDIO'
  },
  high: {
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/30',
    textClass: 'text-destructive',
    icon: Rocket,
    label: 'ARRISCADO'
  }
};

export function AccumulatorCard({ 
  emoji, 
  title, 
  bets, 
  betAmount, 
  chancePercent, 
  riskLevel,
  delay = 0 
}: AccumulatorCardProps) {
  const config = riskConfig[riskLevel];
  const Icon = config.icon;
  
  // Calculate total odd (multiply all individual odds)
  const totalOdd = bets.reduce((acc, bet) => acc * bet.odd, 1);
  const potentialReturn = betAmount * totalOdd;
  const profit = potentialReturn - betAmount;

  return (
    <article 
      className={`glass-card p-6 animate-fade-in-up opacity-0 ${config.bgClass} ${config.borderClass}`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${config.textClass}`}>{title}</h3>
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-bold ${config.bgClass} ${config.textClass}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
        </div>
      </div>

      {/* Bets List */}
      <div className="space-y-2 mb-4">
        {bets.map((bet, idx) => (
          <div key={idx} className="bg-secondary/50 rounded-xl p-3 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{bet.match}</p>
                <p className="text-xs text-muted-foreground">{bet.bet}</p>
              </div>
              <span className={`text-lg font-bold ${config.textClass}`}>
                @{bet.odd.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
          <p className="text-xs text-muted-foreground uppercase mb-1">Odd Total</p>
          <p className={`text-2xl font-black ${config.textClass}`}>
            {totalOdd.toFixed(2)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
          <p className="text-xs text-muted-foreground uppercase mb-1">Chance</p>
          <p className={`text-2xl font-black ${config.textClass}`}>
            {chancePercent}%
          </p>
        </div>
      </div>

      {/* Profit */}
      <div className={`rounded-xl p-4 ${config.bgClass} border ${config.borderClass}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${config.textClass}`} />
          <p className="text-sm">
            <span className="text-muted-foreground">Aposta R$ {betAmount} → </span>
            <span className={`font-bold ${config.textClass}`}>
              Lucro R$ {profit.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
