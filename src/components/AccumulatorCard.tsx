import { TrendingUp, Shield, Scale, Rocket } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
    labelKey: 'accumulators.riskLow'
  },
  medium: {
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
    textClass: 'text-warning',
    icon: Scale,
    labelKey: 'accumulators.riskMedium'
  },
  high: {
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/30',
    textClass: 'text-destructive',
    icon: Rocket,
    labelKey: 'accumulators.riskHigh'
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
  const { t } = useLanguage();
  const config = riskConfig[riskLevel];
  const Icon = config.icon;
  
  // Calculate total odd (multiply all individual odds)
  const totalOdd = bets.reduce((acc, bet) => acc * bet.odd, 1);
  const potentialReturn = betAmount * totalOdd;
  const profit = potentialReturn - betAmount;

  return (
    <article 
      className={`glass-card p-4 sm:p-5 lg:p-6 animate-fade-in-up opacity-0 ${config.bgClass} ${config.borderClass}`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <span className="text-2xl sm:text-3xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm sm:text-base lg:text-lg font-bold ${config.textClass} truncate`}>{title}</h3>
          <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold ${config.bgClass} ${config.textClass}`}>
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {t(config.labelKey)}
          </div>
          {/* Mini-explicação para iniciantes */}
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1">
            {riskLevel === 'low' && t('accumulators.explainLowRisk')}
            {riskLevel === 'medium' && t('accumulators.explainMediumRisk')}
            {riskLevel === 'high' && t('accumulators.explainHighRisk')}
          </p>
        </div>
      </div>

      {/* Bets List */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        {bets.map((bet, idx) => (
          <div key={idx} className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-border">
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{bet.match}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{bet.bet}</p>
              </div>
              <span className={`text-base sm:text-lg font-bold ${config.textClass} flex-shrink-0`}>
                @{bet.odd.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1">{t('accumulators.totalOdd')}</p>
          <p className={`text-xl sm:text-2xl font-black ${config.textClass}`}>
            {totalOdd.toFixed(2)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-border">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase mb-0.5 sm:mb-1 flex items-center justify-center gap-1">
            {t('accumulators.chance')}
            <span 
              className="inline-flex w-3.5 h-3.5 rounded-full bg-muted-foreground/20 text-[8px] text-muted-foreground items-center justify-center cursor-help" 
              title={t('accumulators.chanceExplain')}
            >
              ?
            </span>
          </p>
          <p className={`text-xl sm:text-2xl font-black ${config.textClass}`}>
            {chancePercent}%
          </p>
        </div>
      </div>

      {/* Profit — linguagem clara */}
      <div className={`rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 ${config.bgClass} border ${config.borderClass}`}>
        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {t('accumulators.youBet')}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${config.textClass} flex-shrink-0`} />
            <p className="text-xs sm:text-sm">
              <span className="text-muted-foreground font-medium">$ {betAmount}</span>
              <span className="text-muted-foreground mx-1">→</span>
              <span className={`font-bold text-sm sm:text-base ${config.textClass}`}>
                $ {potentialReturn.toFixed(2)}
              </span>
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {t('accumulators.potentialProfit')}: <span className={`font-semibold ${config.textClass}`}>$ {profit.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
