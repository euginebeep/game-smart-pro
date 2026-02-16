import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type RiskLevel = 'low' | 'medium' | 'high';

interface AccumulatorBet {
  match: string;
  bet: string;
  odd: number;
  estimatedProb?: number;
}

interface AccumulatorCardProps {
  emoji?: string;
  title: string;
  typeId?: string;
  bets: AccumulatorBet[];
  betAmount: number;
  chancePercent: number;
  bookmakerChance?: number;
  riskLevel: RiskLevel;
  delay?: number;
}

export function AccumulatorCard({
  emoji,
  title,
  bets,
  betAmount,
  chancePercent,
  bookmakerChance,
  riskLevel,
}: AccumulatorCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const totalOdd = bets.reduce((acc, b) => acc * b.odd, 1);
  const potentialReturn = Math.round(betAmount * totalOdd * 100) / 100;
  const potentialProfit = Math.round((potentialReturn - betAmount) * 100) / 100;
  const edge = bookmakerChance ? chancePercent - bookmakerChance : 0;

  // ===== CORES POR RISCO =====
  const riskStyles = {
    low: {
      gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/10',
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      label: t('accumulators.lowRisk') || 'Mais segura',
    },
    medium: {
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      accent: 'text-amber-400',
      accentBg: 'bg-amber-400',
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10',
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      label: t('accumulators.mediumRisk') || 'Equilibrada',
    },
    high: {
      gradient: 'from-red-500/20 via-red-500/5 to-transparent',
      accent: 'text-red-400',
      accentBg: 'bg-red-400',
      border: 'border-red-500/30',
      glow: 'shadow-red-500/10',
      badge: 'bg-red-500/15 text-red-400 border-red-500/30',
      label: t('accumulators.highRisk') || 'Ousada',
    },
  };

  const style = riskStyles[riskLevel];

  return (
    <div className={`relative rounded-2xl border ${style.border} bg-card overflow-hidden shadow-lg ${style.glow}`}>

      {/* ===== GRADIENTE DE FUNDO SUTIL (PRIMING VISUAL) ===== */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} pointer-events-none`} />

      <div className="relative">

        {/* ========================================================= */}
        {/* BLOCO 1 — HERO: LUCRO POTENCIAL (ANCHORING)               */}
        {/* ========================================================= */}
        <div className="px-5 pt-5 pb-3">

          {/* Header: emoji + título + badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{emoji}</span>
              <h3 className="font-bold text-foreground text-base sm:text-lg">{title}</h3>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${style.badge}`}>
              {style.label}
            </span>
          </div>

          {/* ===== HERO NUMBER: Lucro potencial ===== */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              {t('accumulators.profit') || 'Lucro potencial'}
            </p>
            <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight leading-none">
              +R${potentialProfit.toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t('accumulators.youBet') || 'Apostando'} <span className="font-semibold text-foreground">R${betAmount}</span> → <span className="font-semibold text-foreground">R${potentialReturn.toFixed(0)}</span>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BLOCO 2 — MÉTRICAS: 3 colunas (Odd, Chance, Vantagem)     */}
        {/* ========================================================= */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">

            {/* Odd Total */}
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('accumulators.totalOdd') || 'Cotação'}
              </p>
              <p className={`text-xl sm:text-2xl font-black ${style.accent}`}>
                {totalOdd.toFixed(2)}
              </p>
            </div>

            {/* Chance EUGINE */}
            <div className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('accumulators.chance') || 'Chance'}
              </p>
              <p className={`text-xl sm:text-2xl font-black ${
                chancePercent >= 40 ? 'text-emerald-400' :
                chancePercent >= 20 ? 'text-sky-400' :
                chancePercent >= 10 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {chancePercent}%
              </p>
            </div>

            {/* Vantagem (EFEITO VON RESTORFF) */}
            <div className={`rounded-xl p-3 text-center relative overflow-hidden ${
              edge > 0 ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-secondary/50'
            }`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {t('accumulators.eugineEdge') || 'Vantagem'}
              </p>
              <p className={`text-xl sm:text-2xl font-black ${
                edge > 0 ? 'text-emerald-400' : 'text-muted-foreground'
              }`}>
                {edge > 0 ? `+${edge}%` : '—'}
              </p>
              {edge > 0 && (
                <div className="absolute inset-0 bg-emerald-400/5 rounded-xl pointer-events-none" />
              )}
            </div>
          </div>

          {/* ===== BARRA DE EDGE (PROGRESSO VISUAL = DOPAMINA) ===== */}
          {bookmakerChance !== undefined && edge > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>{t('accumulators.bookmakerSays') || 'Casa diz'} {bookmakerChance}%</span>
                <span className="font-bold text-emerald-400">EUGINE {chancePercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/80 overflow-hidden">
                <div className="h-full relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                    style={{ width: `${Math.min(100, bookmakerChance)}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, chancePercent)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BLOCO 3 — JOGOS (colapsável, reduz carga cognitiva)        */}
        {/* ========================================================= */}
        <div className="border-t border-border/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-medium">
              {bets.length} {bets.length === 1 ? (t('accumulators.game') || 'jogo') : (t('accumulators.games') || 'jogos')}
            </span>
            <span className="flex items-center gap-1">
              {expanded ? t('accumulators.hide') || 'Ocultar' : t('accumulators.seeGames') || 'Ver jogos'}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-2">
              {bets.map((bet, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-semibold text-foreground text-sm leading-snug truncate">
                      {bet.match}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bet.bet}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-black ${style.accent}`}>
                      @{bet.odd.toFixed(2)}
                    </p>
                    {bet.estimatedProb && (
                      <p className="text-[10px] text-emerald-400 font-medium">
                        {bet.estimatedProb}% {t('accumulators.eugineProb') || 'prob.'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccumulatorCard;
