import { useLanguage } from '@/contexts/LanguageContext';
import { AccumulatorCard } from './AccumulatorCard';
import { Brain, Crown, Lock } from 'lucide-react';

interface SmartAccBet {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  betType: string;
  betLabel: string;
  odd: number;
  estimatedProb: number;
  impliedProb: number;
  edge: number;
}

interface SmartAccumulator {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  badge: string;
  bets: SmartAccBet[];
  totalOdd: number;
  combinedProb: number;
  bookmakerProb: number;
  combinedEdge: number;
  expectedValue: number;
  suggestedStake: number;
  riskLevel: 'medium' | 'high';
  qualityScore: number;
}

interface Props {
  smartAccumulators: SmartAccumulator[];
  isPremium: boolean;
  onUpgrade?: () => void;
}

export function SmartAccumulatorSection({ smartAccumulators, isPremium, onUpgrade }: Props) {
  const { t } = useLanguage();
  
  if (!smartAccumulators || smartAccumulators.length === 0) return null;
  
  return (
    <section className="mt-6 sm:mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg sm:text-xl font-black text-foreground">
            {t('smartAcc.title') || 'Acumulada Inteligente'}
          </h2>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <Crown className="w-3 h-3" />
          PREMIUM
        </span>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        {t('smartAcc.subtitle') || 'IA analisou todos os jogos e montou as melhores combinações de 5-6 pernas otimizadas por Expected Value.'}
      </p>
      
      {/* Non-premium: blurred preview */}
      {!isPremium ? (
        <div className="relative">
          <div className="filter blur-sm pointer-events-none opacity-50">
            <div className="rounded-2xl border border-purple-500/20 bg-card p-6 text-center">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-lg font-bold text-foreground mb-1">
                {smartAccumulators.length} {smartAccumulators.length === 1 
                  ? (t('smartAcc.comboFound') || 'combo encontrado') 
                  : (t('smartAcc.combosFound') || 'combos encontrados')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('smartAcc.oddRange') || 'Odds de'} {Math.min(...smartAccumulators.map(a => a.totalOdd)).toFixed(0)}x {t('smartAcc.to') || 'a'} {Math.max(...smartAccumulators.map(a => a.totalOdd)).toFixed(0)}x
              </p>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={onUpgrade}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
            >
              <Lock className="w-4 h-4" />
              {t('smartAcc.unlock') || 'Desbloquear Acumulada Inteligente'}
            </button>
          </div>
        </div>
      ) : (
        /* Premium: show cards */
        <div className="space-y-4">
          {smartAccumulators.map((acc, index) => (
            <div key={acc.id} className="relative">
              {index === 0 && (
                <div className="absolute -top-2 left-4 z-10 flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-purple-600 text-white shadow-lg">
                  <Brain className="w-3 h-3" />
                  {t('smartAcc.bestCombo') || 'MELHOR COMBO'}
                </div>
              )}
              
              <AccumulatorCard
                emoji={acc.emoji}
                title={acc.title}
                typeId={acc.id}
                bets={acc.bets.map(b => ({
                  match: `${b.homeTeam} x ${b.awayTeam}`,
                  bet: b.betLabel,
                  odd: b.odd,
                  estimatedProb: b.estimatedProb,
                }))}
                betAmount={acc.suggestedStake}
                chancePercent={Math.round(acc.combinedProb)}
                bookmakerChance={Math.round(acc.bookmakerProb)}
                riskLevel={acc.riskLevel}
              />
              
              {/* Extra info */}
              <div className="mt-2 px-4 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  EV: {acc.expectedValue.toFixed(2)} | {new Set(acc.bets.map(b => b.league)).size} {t('smartAcc.leagues') || 'ligas'}
                </span>
                <span>
                  {acc.bets.length} {t('smartAcc.legs') || 'pernas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default SmartAccumulatorSection;
