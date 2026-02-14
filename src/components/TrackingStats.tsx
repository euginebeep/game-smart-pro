import { useState, useEffect } from 'react';
import { TrendingUp, Target, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface BetStat {
  bet_type: string;
  total_bets: number;
  wins: number;
  losses: number;
  hit_rate: number;
  avg_edge: number;
  avg_odd: number;
}

interface RecentResult {
  id: string;
  match_date: string;
  home_team: string;
  away_team: string;
  bet_label: string;
  odd: number;
  value_edge: number;
  result: string;
}

export function TrackingStats() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<BetStat[]>([]);
  const [recent, setRecent] = useState<RecentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [statsRes, recentRes] = await Promise.all([
        supabase.from('bet_stats' as any).select('*'),
        supabase.from('recent_results' as any).select('*').limit(10),
      ]);
      
      if (statsRes.data) setStats(statsRes.data as any);
      if (recentRes.data) setRecent(recentRes.data as any);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalBets = stats.reduce((sum, s) => sum + s.total_bets, 0);
  const totalWins = stats.reduce((sum, s) => sum + s.wins, 0);
  const overallHitRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t('tracking.loading') || 'Carregando estatísticas...'}
      </div>
    );
  }

  if (totalBets === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <BarChart3 className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {t('tracking.noData') || 'Ainda não há dados suficientes. As estatísticas aparecem após os primeiros resultados.'}
        </p>
      </div>
    );
  }

  const betTypeLabels: Record<string, string> = {
    over25: t('analysis.over25') || 'Over 2.5',
    under25: t('analysis.under25') || 'Under 2.5',
    btts: t('analysis.btts') || 'BTTS',
    home: t('analysis.homeWin') || 'Home Win',
    away: t('analysis.awayWin') || 'Away Win',
    draw: t('analysis.draw') || 'Draw',
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/50">
          <Target className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl sm:text-3xl font-black text-primary">{overallHitRate}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{t('tracking.hitRate') || 'Taxa de Acerto'}</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/50">
          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{totalWins}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{t('tracking.wins') || 'Acertos'}</p>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border/50">
          <BarChart3 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl sm:text-3xl font-black text-foreground">{totalBets}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{t('tracking.totalBets') || 'Total Analisado'}</p>
        </div>
      </div>

      {/* Stats por mercado */}
      <div className="bg-secondary/20 rounded-xl border border-border/50 p-4">
        <h4 className="font-bold text-foreground text-sm mb-3">
          {t('tracking.byMarket') || 'Acerto por Mercado'}
        </h4>
        <div className="space-y-2">
          {stats.map((stat) => (
            <div key={stat.bet_type} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {betTypeLabels[stat.bet_type] || stat.bet_type}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {stat.wins}/{stat.total_bets} {t('tracking.bets') || 'apostas'} • {t('tracking.avgEdge') || 'Edge médio'}: +{stat.avg_edge}%
                </p>
              </div>
              <p className={`text-lg font-bold ${
                stat.hit_rate >= 55 ? 'text-emerald-400' :
                stat.hit_rate >= 45 ? 'text-primary' :
                'text-red-400'
              }`}>
                {stat.hit_rate}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos resultados */}
      {recent.length > 0 && (
        <div className="bg-secondary/20 rounded-xl border border-border/50 p-4">
          <h4 className="font-bold text-foreground text-sm mb-3">
            {t('tracking.recentResults') || 'Últimos Resultados'}
          </h4>
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  {r.result === 'won' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {r.home_team} x {r.away_team}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.bet_label} @{r.odd}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${r.result === 'won' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.result === 'won' ? (t('tracking.won') || 'ACERTOU') : (t('tracking.lost') || 'ERROU')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
