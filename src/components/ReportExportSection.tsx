import { useState } from 'react';
import { Download, FileImage, FileCode, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Game } from '@/types/game';
import html2canvas from 'html2canvas';

interface ReportExportSectionProps {
  games: Game[];
  userTier: 'free' | 'basic' | 'advanced' | 'premium';
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function ReportExportSection({ games, userTier, contentRef }: ReportExportSectionProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);

  const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US';

  // Allow premium users only
  if (userTier !== 'premium') return null;

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[/:]/g, '-').replace(', ', '_');
  };

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const generateReportCanvas = async (): Promise<HTMLCanvasElement> => {
    if (!contentRef.current) throw new Error('No content ref');
    const element = contentRef.current;
    
    const canvasWidth = isMobile() ? Math.max(element.scrollWidth, 800) : Math.max(element.scrollWidth, 1200);
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: ${canvasWidth}px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      padding: 30px;
      overflow: hidden;
      z-index: -1;
    `;
    
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; margin-bottom: 30px; background: rgba(30, 41, 59, 0.95); border-radius: 20px; border: 2px solid rgba(251, 191, 36, 0.4); box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
        <h1 style="font-size: 2.5rem; font-weight: 900; color: #fbbf24; margin-bottom: 12px; text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);">🎯 EUGINE Analytics</h1>
        <p style="color: #94a3b8; font-size: 1rem; margin-bottom: 8px;">${t('export.generatedAt')}: ${new Date().toLocaleString(locale)}</p>
        <p style="color: #fbbf24; font-size: 1.1rem; font-weight: 600;">${t('export.totalGames')}: ${games.length} | Premium Report</p>
      </div>
    `;
    wrapper.appendChild(header);
    
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '100%';
    clone.style.overflow = 'hidden';
    clone.style.height = 'auto';
    clone.style.minHeight = '0';
    wrapper.appendChild(clone);
    
    const footer = document.createElement('div');
    footer.innerHTML = `
      <div style="text-align: center; padding: 30px 20px; margin-top: 30px; color: #64748b; font-size: 0.875rem; border-top: 1px solid rgba(100, 116, 139, 0.3);">
        <p style="margin-bottom: 8px;">EUGINE Analytics™ v3.0 • GS ITALYINVESTMENTS</p>
        <p style="color: #475569;">Premium Report - ${new Date().toLocaleDateString(locale)}</p>
      </div>
    `;
    wrapper.appendChild(footer);
    
    document.body.appendChild(wrapper);
    await new Promise(resolve => setTimeout(resolve, 800));

    const actualHeight = wrapper.scrollHeight;
    
    const scale = isMobile() ? 1 : 2;
    
    const canvas = await html2canvas(wrapper, {
      backgroundColor: '#0f172a',
      scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      width: wrapper.scrollWidth,
      height: actualHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: wrapper.scrollWidth,
      windowHeight: actualHeight,
    });

    document.body.removeChild(wrapper);
    return canvas;
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    if (isMobile()) {
      // Mobile: open in new tab so user can long-press to save
      const w = window.open(url, '_blank');
      if (!w) {
        // Popup blocked fallback
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // Revoke after delay to allow download
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportAsImage = async () => {
    setExportingImage(true);
    try {
      const canvas = await generateReportCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Blob failed')), 'image/png', 0.9);
      });
      downloadFile(blob, `eugine-report-${getFormattedDate()}.png`);
      toast({ title: '✅ ' + (t('export.successImage') || 'Imagem exportada com sucesso!') });
    } catch (error) {
      console.error('Error exporting image:', error);
      toast({ title: '❌ ' + (t('export.errorImage') || 'Erro ao exportar imagem'), variant: 'destructive' });
    } finally {
      setExportingImage(false);
    }
  };

  const generateStandaloneHtml = (): string => {
    const dateStr = new Date().toLocaleDateString(locale);
    const dateTimeStr = new Date().toLocaleString(locale);

    // ===== Generate Accumulators HTML =====
    let accumulatorsHtml = '';
    const gamesWithEdge = games.filter(g => g.analysis && !g.analysis.isSkip && (g.analysis.valuePercentage || 0) > 0);
    const effectivePool = gamesWithEdge.length >= 2 ? gamesWithEdge : games.filter(g => g.analysis && !g.analysis.isSkip);

    if (effectivePool.length >= 2) {
      const sorted = [...effectivePool].sort((a, b) => (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0));

      // Build simple 2-leg accumulators
      const accTypes = [
        { emoji: '🛡️', title: t('accumulators.goalsLowRisk'), market: 'over' },
        { emoji: '💎', title: t('premiumDouble.premiumDouble'), market: 'home' },
      ];

      for (const accType of accTypes) {
        const g1 = sorted[0];
        const g2 = sorted[1];
        if (!g1 || !g2) continue;

        const odd1 = accType.market === 'over' ? g1.odds.over : g1.odds.home;
        const odd2 = accType.market === 'over' ? g2.odds.over : g2.odds.home;
        const totalOdd = odd1 * odd2;
        const bet1Label = accType.market === 'over' ? (t('accumulators.over25') || 'Over 2.5') : `${t('accumulators.victory')} ${g1.homeTeam}`;
        const bet2Label = accType.market === 'over' ? (t('accumulators.over25') || 'Over 2.5') : `${t('accumulators.victory')} ${g2.homeTeam}`;
        const bookChance = Math.round((1 / totalOdd) * 93);

        accumulatorsHtml += `
          <div style="background:#0f172a;border:1px solid #334155;border-radius:16px;padding:20px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div style="font-size:18px;font-weight:700;color:#f1f5f9;">${accType.emoji} ${accType.title}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#1e293b;border-radius:10px;margin-bottom:6px;">
              <div>
                <div style="font-weight:600;color:#e2e8f0;font-size:14px;">${g1.homeTeam} x ${g1.awayTeam}</div>
                <div style="color:#94a3b8;font-size:12px;">${bet1Label}</div>
              </div>
              <div style="font-weight:800;color:#38bdf8;font-size:18px;">@${odd1.toFixed(2)}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#1e293b;border-radius:10px;margin-bottom:6px;">
              <div>
                <div style="font-weight:600;color:#e2e8f0;font-size:14px;">${g2.homeTeam} x ${g2.awayTeam}</div>
                <div style="color:#94a3b8;font-size:12px;">${bet2Label}</div>
              </div>
              <div style="font-weight:800;color:#38bdf8;font-size:18px;">@${odd2.toFixed(2)}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px;">
              <div style="text-align:center;background:#1e293b;padding:12px;border-radius:10px;">
                <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">${t('accumulators.totalOdd') || 'Cotação'}</div>
                <div style="font-weight:800;color:#f59e0b;font-size:22px;">${totalOdd.toFixed(2)}</div>
              </div>
              <div style="text-align:center;background:#1e293b;padding:12px;border-radius:10px;">
                <div style="color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1px;">${t('accumulators.chance') || 'Chance'}</div>
                <div style="font-weight:800;color:#38bdf8;font-size:22px;">${bookChance}%</div>
              </div>
              <div style="text-align:center;background:#064e3b;border:1px solid #10b981;padding:12px;border-radius:10px;">
                <div style="color:#6ee7b7;font-size:10px;text-transform:uppercase;letter-spacing:1px;">${t('accumulators.eugineEdge') || 'Vantagem'}</div>
                <div style="font-weight:800;color:#34d399;font-size:22px;">+${Math.max(1, Math.round(bookChance * 0.15))}%</div>
              </div>
            </div>
          </div>
        `;
      }
    }

    // ===== Top games with value =====
    const topGames = games
      .filter((g) => g.analysis && !g.analysis.isSkip)
      .sort((a, b) => (b.analysis?.valuePercentage || 0) - (a.analysis?.valuePercentage || 0))
      .slice(0, 10);

    let topGamesHtml = '';
    if (topGames.length > 0) {
      topGamesHtml += `<h2 style="color:#f1f5f9;font-size:20px;margin:24px 0 12px;">⚽ Top Jogos com Valor</h2>`;
      for (const game of topGames) {
        const a = game.analysis!;
        topGamesHtml += `
          <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;color:#e2e8f0;font-size:14px;">${game.homeTeam} x ${game.awayTeam}</div>
              <div style="color:#38bdf8;font-size:12px;margin-top:2px;">${a.type}</div>
              ${a.estimatedProbability ? `<div style="color:#94a3b8;font-size:11px;margin-top:4px;">Casa: ${Math.round(a.impliedProbability || 0)}% → EUGINE: ${Math.round(a.estimatedProbability)}%</div>` : ''}
            </div>
            ${(a.valuePercentage || 0) > 0 ? `<div style="background:#064e3b;border:1px solid #10b981;padding:6px 14px;border-radius:20px;font-weight:800;color:#34d399;font-size:14px;">+${a.valuePercentage!.toFixed(0)}%</div>` : ''}
          </div>
        `;
      }
    }
    
    // Generate game cards HTML
    let gamesHtml = '';
    games.forEach((game) => {
      const analysis = game.analysis;
      const adv = game.advancedData;
      const bestOdd = Math.max(game.odds.home, game.odds.draw, game.odds.away);
      
      const formattedTime = new Date(game.startTime).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      gamesHtml += `
        <div class="game-card">
          <div class="game-header">
            <div class="game-teams">
              <h2>${game.homeTeam} <span class="vs">vs</span> ${game.awayTeam}</h2>
              <div class="badges">
                ${game.dayLabel ? `<span class="badge badge-day">${game.dayLabel}</span>` : ''}
                <span class="badge badge-time">⏰ ${formattedTime}</span>
                <span class="badge badge-league">🏆 ${game.league}</span>
                <span class="badge badge-premium">⭐ PREMIUM</span>
              </div>
            </div>
            <div class="best-odd">
              <span class="label">${t('gameCard.bestOdd')}</span>
              <span class="value">${bestOdd.toFixed(2)}</span>
              <span class="bookmaker">${game.bookmaker}</span>
              ${analysis?.confidence ? `<div class="confidence">${t('gameCard.confidence')}: ${analysis.confidence}%</div>` : ''}
            </div>
          </div>
          
          <div class="analysis-grid">
            <div class="analysis-box analysis-success">
              <h3>💰 ${analysis?.type || t('gameCard.bet')}</h3>
              <p>${analysis?.reason || ''}</p>
              <div class="profit-box">
                ${t('gameCard.bet')} 40 → ${t('gameCard.profit')} ${(40 * bestOdd - 40).toFixed(2)}
              </div>
            </div>
            <div class="analysis-box analysis-warning">
              <h3>💡 ${t('gameCard.marketAnalysis')}</h3>
              <p>${game.odds.home < game.odds.away ? `${game.homeTeam} ${t('gameCard.asFavorite')}` : game.odds.away < game.odds.home ? `${game.awayTeam} ${t('gameCard.asFavorite')}` : t('gameCard.balancedGame')}</p>
            </div>
          </div>
          
          ${adv ? `
          <div class="advanced-grid">
            ${adv.h2h ? `
            <div class="data-box box-purple">
              <h4>🛡️ ${t('gameCard.headToHead')}</h4>
              <p>${t('gameCard.games')}: ${adv.h2h.totalGames}</p>
              <p>${t('gameCard.homeWins')}: ${adv.h2h.homeWins} | ${t('gameCard.draws')}: ${adv.h2h.draws} | ${t('gameCard.awayWins')}: ${adv.h2h.awayWins}</p>
              <p>${t('gameCard.avgGoals')}: ${adv.h2h.avgGoals.toFixed(1)}</p>
            </div>
            ` : ''}
            ${adv.homeForm || adv.awayForm ? `
            <div class="data-box box-blue">
              <h4>📊 ${t('gameCard.recentForm')}</h4>
              ${adv.homeForm ? `<p>${game.homeTeam.slice(0,10)}: ${adv.homeForm.slice(0,5).split('').map((r: string) => `<span class="form-${r.toLowerCase()}">${r}</span>`).join('')}</p>` : ''}
              ${adv.awayForm ? `<p>${game.awayTeam.slice(0,10)}: ${adv.awayForm.slice(0,5).split('').map((r: string) => `<span class="form-${r.toLowerCase()}">${r}</span>`).join('')}</p>` : ''}
            </div>
            ` : ''}
            ${adv.homePosition || adv.awayPosition ? `
            <div class="data-box box-cyan">
              <h4>🏆 ${t('gameCard.standings')}</h4>
              ${adv.homePosition ? `<p>${game.homeTeam.slice(0,10)}: ${adv.homePosition}º</p>` : ''}
              ${adv.awayPosition ? `<p>${game.awayTeam.slice(0,10)}: ${adv.awayPosition}º</p>` : ''}
            </div>
            ` : ''}
          </div>
          
          <div class="premium-grid">
            ${adv.homeInjuries !== undefined || adv.awayInjuries !== undefined ? `
            <div class="data-box box-red">
              <h4>🏥 ${t('gameCard.injuries')}</h4>
              <p>${game.homeTeam.slice(0,10)}: ${adv.homeInjuries || 0} ${t('gameCard.absences')}</p>
              <p>${game.awayTeam.slice(0,10)}: ${adv.awayInjuries || 0} ${t('gameCard.absences')}</p>
            </div>
            ` : ''}
            ${adv.homeStats ? `
            <div class="data-box box-green">
              <h4>📈 ${t('gameCard.statistics')}</h4>
              <p>Over 2.5: ${adv.homeStats.over25Percentage?.toFixed(0) || 0}%</p>
              <p>BTTS: ${adv.homeStats.bttsPercentage?.toFixed(0) || 0}%</p>
            </div>
            ` : ''}
            ${adv.apiPrediction ? `
            <div class="data-box box-amber">
              <h4>🎯 ${t('gameCard.eugineSuggestion')}</h4>
              ${adv.apiPrediction.advice ? `<p class="advice">${adv.apiPrediction.advice}</p>` : ''}
              ${adv.apiPrediction.winnerLabel ? `<p>${t('gameCard.favorite')}: ${adv.apiPrediction.winnerLabel}</p>` : ''}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="odds-row">
            <div class="odd-item">
              <span class="odd-label">${t('gameCard.home')}</span>
              <span class="odd-value">${game.odds.home.toFixed(2)}</span>
            </div>
            <div class="odd-item">
              <span class="odd-label">${t('gameCard.draw')}</span>
              <span class="odd-value">${game.odds.draw.toFixed(2)}</span>
            </div>
            <div class="odd-item">
              <span class="odd-label">${t('gameCard.away')}</span>
              <span class="odd-value">${game.odds.away.toFixed(2)}</span>
            </div>
            <div class="odd-item">
              <span class="odd-label">${t('gameCard.over')}</span>
              <span class="odd-value">${game.odds.over.toFixed(2)}</span>
            </div>
            <div class="odd-item">
              <span class="odd-label">${t('gameCard.under')}</span>
              <span class="odd-value">${game.odds.under.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `;
    });

    return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EUGINE Analytics Report - ${dateStr}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 30px;
      line-height: 1.5;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    /* Header */
    .report-header {
      text-align: center;
      padding: 40px 30px;
      margin-bottom: 30px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
      border-radius: 24px;
      border: 2px solid rgba(251, 191, 36, 0.4);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
    }
    
    .report-header h1 {
      font-size: 2.5rem;
      font-weight: 900;
      color: #fbbf24;
      margin-bottom: 12px;
      text-shadow: 0 2px 20px rgba(251, 191, 36, 0.4);
    }
    
    .report-header .subtitle { color: #94a3b8; font-size: 1rem; margin-bottom: 8px; }
    .report-header .stats { color: #fbbf24; font-size: 1.1rem; font-weight: 600; }
    
    /* Game Cards */
    .game-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9));
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    
    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .game-teams h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 12px;
    }
    
    .game-teams .vs { 
      color: #64748b; 
      font-weight: 400; 
      font-size: 1rem;
      margin: 0 8px;
    }
    
    .badges { display: flex; flex-wrap: wrap; gap: 8px; }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge-day { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-time { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-league { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
    .badge-premium { background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.3); }
    
    .best-odd {
      text-align: right;
      min-width: 120px;
    }
    
    .best-odd .label { 
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .best-odd .value {
      display: block;
      font-size: 3rem;
      font-weight: 900;
      background: linear-gradient(135deg, #22c55e, #4ade80);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
    
    .best-odd .bookmaker { 
      display: block;
      font-size: 0.7rem;
      color: #64748b;
      margin-top: 4px;
    }
    
    .best-odd .confidence {
      margin-top: 8px;
      font-size: 0.8rem;
      color: #4ade80;
      font-weight: 600;
    }
    
    /* Analysis Boxes */
    .analysis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .analysis-box {
      padding: 20px;
      border-radius: 16px;
    }
    
    .analysis-box h3 {
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    
    .analysis-box p {
      font-size: 0.875rem;
      color: rgba(248, 250, 252, 0.85);
      line-height: 1.6;
    }
    
    .analysis-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .analysis-success h3 { color: #4ade80; }
    
    .analysis-warning {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    
    .analysis-warning h3 { color: #fbbf24; }
    
    .profit-box {
      display: inline-block;
      background: rgba(34, 197, 94, 0.2);
      padding: 10px 16px;
      border-radius: 12px;
      margin-top: 12px;
      font-size: 0.875rem;
      color: #4ade80;
      font-weight: 600;
    }
    
    /* Data Grids */
    .advanced-grid, .premium-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .data-box {
      padding: 16px;
      border-radius: 14px;
    }
    
    .data-box h4 {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    
    .data-box p {
      font-size: 0.8rem;
      color: rgba(248, 250, 252, 0.8);
      margin-bottom: 4px;
    }
    
    .box-purple { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); }
    .box-purple h4 { color: #c084fc; }
    
    .box-blue { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.25); }
    .box-blue h4 { color: #60a5fa; }
    
    .box-cyan { background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.25); }
    .box-cyan h4 { color: #22d3ee; }
    
    .box-red { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); }
    .box-red h4 { color: #f87171; }
    
    .box-green { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.25); }
    .box-green h4 { color: #4ade80; }
    
    .box-amber { background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.25); }
    .box-amber h4 { color: #fbbf24; }
    .box-amber .advice { color: #fbbf24; font-weight: 600; }
    
    /* Form indicators */
    .form-w { color: #4ade80; font-weight: 700; margin-right: 2px; }
    .form-d { color: #fbbf24; font-weight: 700; margin-right: 2px; }
    .form-l { color: #f87171; font-weight: 700; margin-right: 2px; }
    
    /* Odds Row */
    .odds-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 14px;
      margin-top: 16px;
    }
    
    .odd-item {
      text-align: center;
      padding: 12px 8px;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 10px;
    }
    
    .odd-label {
      display: block;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 6px;
    }
    
    .odd-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 800;
      color: #fbbf24;
    }
    
    /* Footer */
    .report-footer {
      text-align: center;
      padding: 30px 20px;
      margin-top: 40px;
      border-top: 1px solid rgba(100, 116, 139, 0.3);
    }
    
    .report-footer p { 
      color: #64748b; 
      font-size: 0.875rem;
      margin-bottom: 6px;
    }
    
    .report-footer .brand { color: #fbbf24; font-weight: 600; }
    
    /* Section Headers */
    .section-header {
      text-align: center;
      margin: 40px 0 24px;
      padding: 24px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }
    
    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 8px;
    }
    
    .section-header p { color: #94a3b8; font-size: 0.9rem; }
    .section-header .highlight { color: #fbbf24; font-weight: 600; }
    
    @media (max-width: 768px) {
      body { padding: 16px; }
      .game-header { flex-direction: column; }
      .best-odd { text-align: left; }
      .odds-row { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="report-header">
      <h1>🎯 EUGINE Analytics</h1>
      <p class="subtitle">${t('export.generatedAt')}: ${dateTimeStr}</p>
      <p class="stats">${t('export.totalGames')}: ${games.length} | Premium Report</p>
    </div>
    
    ${accumulatorsHtml ? `
    <div class="section-header">
      <h2>🏆 ${t('accumulators.title') || 'Acumuladas do Dia'}</h2>
    </div>
    ${accumulatorsHtml}
    ` : ''}
    
    ${topGamesHtml}
    
    <div class="section-header">
      <h2>📊 ${t('main.gameAnalysis') || 'Análise dos Jogos'}</h2>
      <p>${t('main.showingToday') || 'Previsões analíticas matemáticas'}</p>
    </div>
    
    ${gamesHtml}
    
    <div class="report-footer">
      <p class="brand">EUGINE Analytics™ v3.0</p>
      <p>GS ITALYINVESTMENTS • Premium Report</p>
      <p>${dateStr}</p>
    </div>
  </div>
</body>
</html>`;
  };

  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

  const showHTMLPreview = (htmlContent: string) => {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;padding:16px;';

    const container = document.createElement('div');
    container.style.cssText = 'background:white;border-radius:12px;width:100%;max-width:600px;max-height:90vh;overflow:auto;padding:0;position:relative;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Fechar';
    closeBtn.style.cssText = 'position:sticky;top:0;right:0;width:100%;padding:12px;background:#1a1a2e;color:white;border:none;font-weight:bold;cursor:pointer;z-index:1;';
    closeBtn.onclick = () => document.body.removeChild(modal);

    const content = document.createElement('div');
    content.innerHTML = htmlContent;

    container.appendChild(closeBtn);
    container.appendChild(content);
    modal.appendChild(container);

    modal.onclick = (e) => {
      if (e.target === modal) document.body.removeChild(modal);
    };

    document.body.appendChild(modal);
  };

  const exportAsHtml = () => {
    setExportingHtml(true);
    try {
      const htmlContent = generateStandaloneHtml();

      if (isIOS()) {
        // iOS Safari can't handle blob URL downloads well — show preview in-app
        showHTMLPreview(htmlContent);
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `eugine-report-${getFormattedDate()}.html`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, 100);
      }
      toast({ title: '✅ ' + (t('export.successHtml') || 'Relatório HTML exportado com sucesso!') });
    } catch (error) {
      console.error('Error exporting HTML:', error);
      toast({ title: '❌ ' + (t('export.errorHtml') || 'Erro ao exportar HTML'), variant: 'destructive' });
    } finally {
      setExportingHtml(false);
    }
  };

  const generateWhatsAppMessage = (): string => {
    const date = new Date().toLocaleDateString(locale);
    let msg = `🎯 *EUGINE Analytics*\n`;
    msg += `📅 ${date}\n\n`;

    // Top games with value edge
    const topGames = games
      .filter((g) => g.analysis && !g.analysis.isSkip && (g.analysis.valuePercentage || 0) > 0)
      .sort((a, b) => (b.analysis?.valuePercentage || 0) - (a.analysis?.valuePercentage || 0))
      .slice(0, 5);

    if (topGames.length > 0) {
      msg += `⚽ *TOP ${topGames.length} JOGOS COM VALOR*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

      for (const game of topGames) {
        const a = game.analysis!;
        const bestOdd = Math.max(game.odds.home, game.odds.draw, game.odds.away);
        msg += `*${game.homeTeam} x ${game.awayTeam}*\n`;
        msg += `  ${a.type} @${bestOdd.toFixed(2)}\n`;
        if (a.estimatedProbability && a.impliedProbability) {
          msg += `  Casa: ${Math.round(a.impliedProbability)}% → EUGINE: ${Math.round(a.estimatedProbability)}%`;
          if ((a.valuePercentage || 0) > 0) msg += ` (+${a.valuePercentage!.toFixed(0)}%)`;
          msg += `\n`;
        }
        if (a.confidence) msg += `  Confiança: ${a.confidence}%\n`;
        msg += `\n`;
      }
    }

    // All remaining analyzed games summary
    const allAnalyzed = games.filter((g) => g.analysis && !g.analysis.isSkip);
    if (allAnalyzed.length > topGames.length) {
      msg += `📊 *${allAnalyzed.length} jogos analisados no total*\n\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🤖 _Análise por EUGINE Analytics_\n`;
    msg += `📱 _eugine-analytics.com_`;

    return msg;
  };

  const shareViaWhatsApp = async () => {
    setSharingWhatsApp(true);
    try {
      // Try Web Share API with image first (mobile)
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
        try {
          const canvas = await generateReportCanvas();
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png', 0.9);
          });
          const file = new File([blob], `eugine-report-${getFormattedDate()}.png`, { type: 'image/png' });
          const shareData = { files: [file], title: 'EUGINE Analytics', text: generateWhatsAppMessage() };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            toast({ title: '✅ ' + (t('export.successWhatsapp') || 'Compartilhado com sucesso!') });
            return;
          }
        } catch (shareErr) {
          if ((shareErr as Error).name === 'AbortError') return;
          console.warn('Share API failed, using fallback', shareErr);
        }
      }

      // Fallback: open WhatsApp with full text message
      const message = generateWhatsAppMessage();
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
      toast({ title: '✅ ' + (t('export.successWhatsapp') || 'Compartilhado com sucesso!') });
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast({ title: '❌ ' + (t('export.errorWhatsapp') || 'Erro ao compartilhar'), variant: 'destructive' });
    } finally {
      setSharingWhatsApp(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t('export.title')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('export.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={exportAsImage}
            disabled={exportingImage}
            variant="outline"
            className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-400 text-emerald-400"
          >
            {exportingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
            <span className="ml-2">{t('export.image')}</span>
          </Button>
          <Button
            onClick={exportAsHtml}
            disabled={exportingHtml}
            variant="outline"
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400 text-blue-400"
          >
            {exportingHtml ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
            <span className="ml-2">{t('export.html')}</span>
          </Button>
          <Button
            onClick={shareViaWhatsApp}
            disabled={sharingWhatsApp}
            variant="outline"
            className="bg-gradient-to-r from-green-600/20 to-green-500/20 border-green-500/30 hover:border-green-400 text-green-400"
          >
            {sharingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            <span className="ml-2">{t('export.whatsapp')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
