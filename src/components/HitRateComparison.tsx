import { useState, useEffect, useRef } from 'react';
import { Target } from 'lucide-react';

interface HitRateComparisonProps {
  hitRate: number;
  avgBettorRate: string;
  hitRateLabel: string;
  aiAdvantage: string;
}

const PRO_BETTOR_RATE = 42;

export function HitRateComparison({ hitRate, avgBettorRate, hitRateLabel, aiAdvantage }: HitRateComparisonProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={barRef} className="flex flex-col gap-2.5 mb-6 max-w-sm mx-auto lg:mx-0 p-4 rounded-xl bg-secondary/30 border border-border/50">
      {/* EUGINE AI bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <span className="text-primary text-sm font-bold">EUGINE AI</span>
        </div>
        <div className="flex-1 h-8 rounded-full bg-secondary/60 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-end pr-3 transition-all duration-[1200ms] ease-out"
            style={{ width: visible ? `${Math.min(hitRate, 100)}%` : '0%' }}
          >
            <span className={`text-primary-foreground text-sm font-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: visible ? '700ms' : '0ms' }}>
              {hitRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Pro bettor bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <span className="text-muted-foreground text-sm">👤</span>
          <span className="text-muted-foreground text-xs font-medium">{avgBettorRate}</span>
        </div>
        <div className="flex-1 h-6 rounded-full bg-secondary/60 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-muted-foreground/25 flex items-center justify-end pr-3 transition-all duration-[800ms] ease-out"
            style={{ width: visible ? `${PRO_BETTOR_RATE}%` : '0%', transitionDelay: '300ms' }}
          >
            <span className={`text-muted-foreground text-[11px] font-bold transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: visible ? '500ms' : '0ms' }}>
              ~{PRO_BETTOR_RATE}%
            </span>
          </div>
        </div>
      </div>

      {/* Advantage badge */}
      <div
        className={`flex items-center justify-between mt-1 pt-2 border-t border-border/30 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{ transitionDelay: visible ? '1000ms' : '0ms' }}
      >
        <span className="text-xs text-muted-foreground">{hitRateLabel}</span>
        <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-bold">
          +{hitRate - PRO_BETTOR_RATE}% {aiAdvantage}
        </span>
      </div>
    </div>
  );
}
