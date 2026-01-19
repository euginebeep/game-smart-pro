import { useState } from 'react';
import { Download, FileImage, FileCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Game } from '@/types/game';
import html2canvas from 'html2canvas';

interface ReportExportSectionProps {
  games: Game[];
  userTier: 'free' | 'basic' | 'advanced' | 'premium';
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function ReportExportSection({ games, userTier, contentRef }: ReportExportSectionProps) {
  const { t, language } = useLanguage();
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);

  if (userTier !== 'premium') return null;

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[/:]/g, '-').replace(', ', '_');
  };

  const exportAsImage = async () => {
    if (!contentRef.current) return;
    
    setExportingImage(true);
    try {
      const element = contentRef.current;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `eugine-report-${getFormattedDate()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    } finally {
      setExportingImage(false);
    }
  };

  const generateHtmlContent = () => {
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US';
    const generatedAt = t('export.generatedAt');
    const totalGames = t('export.totalGames');
    const homeLabel = t('gameCard.home');
    const drawLabel = t('gameCard.draw');
    const awayLabel = t('gameCard.away');
    const overLabel = t('gameCard.over');
    const underLabel = t('gameCard.under');
    const suggestionLabel = t('gameCard.eugineSuggestion');
    const confidenceLabel = t('gameCard.confidence');

    let gamesHtml = '';
    games.forEach(game => {
      const analysisHtml = game.analysis ? `
        <div class="recommendation">
          <h3>🎯 ${suggestionLabel}: ${game.analysis.type}</h3>
          <p>${game.analysis.reason}</p>
          ${game.analysis.confidence ? `<span class="confidence">${confidenceLabel}: ${game.analysis.confidence}%</span>` : ''}
        </div>
      ` : '';

      gamesHtml += `
        <div class="game-card">
          <h2>${game.homeTeam} vs ${game.awayTeam}</h2>
          <div class="game-info">
            <span class="badge badge-league">🏆 ${game.league}</span>
            <span class="badge badge-time">📅 ${new Date(game.startTime).toLocaleDateString(locale)}</span>
            <span class="badge badge-rec">🎯 ${game.analysis?.type || '-'}</span>
          </div>
          <div class="odds-grid">
            <div class="odd-item">
              <div class="odd-label">${homeLabel}</div>
              <div class="odd-value">${game.odds.home.toFixed(2)}</div>
            </div>
            <div class="odd-item">
              <div class="odd-label">${drawLabel}</div>
              <div class="odd-value">${game.odds.draw.toFixed(2)}</div>
            </div>
            <div class="odd-item">
              <div class="odd-label">${awayLabel}</div>
              <div class="odd-value">${game.odds.away.toFixed(2)}</div>
            </div>
            <div class="odd-item">
              <div class="odd-label">${overLabel}</div>
              <div class="odd-value">${game.odds.over.toFixed(2)}</div>
            </div>
            <div class="odd-item">
              <div class="odd-label">${underLabel}</div>
              <div class="odd-value">${game.odds.under.toFixed(2)}</div>
            </div>
          </div>
          ${analysisHtml}
        </div>
      `;
    });

    return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EUGINE Analytics Report - ${new Date().toLocaleDateString(locale)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      min-height: 100vh;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 20px;
      margin-bottom: 30px;
      background: rgba(30, 41, 59, 0.8);
      border-radius: 16px;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .header h1 {
      font-size: 2rem;
      font-weight: bold;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .header p { color: #94a3b8; font-size: 0.875rem; }
    .game-card {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .game-card h2 { font-size: 1.25rem; color: #f8fafc; margin-bottom: 12px; }
    .game-info { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-league { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .badge-time { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .badge-rec { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .odds-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 12px; }
    .odd-item { background: rgba(15, 23, 42, 0.8); padding: 8px; border-radius: 8px; text-align: center; }
    .odd-label { font-size: 0.7rem; color: #94a3b8; }
    .odd-value { font-size: 1rem; font-weight: bold; color: #fbbf24; }
    .recommendation {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15));
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 10px;
      padding: 16px;
      margin-top: 12px;
    }
    .recommendation h3 { color: #fbbf24; font-size: 0.9rem; margin-bottom: 8px; }
    .recommendation p { color: #e2e8f0; font-size: 0.85rem; }
    .confidence { 
      display: inline-block;
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      margin-top: 8px;
    }
    .footer { text-align: center; padding: 20px; margin-top: 30px; color: #64748b; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 EUGINE Analytics</h1>
    <p>${generatedAt}: ${new Date().toLocaleString(locale)}</p>
    <p>${totalGames}: ${games.length}</p>
  </div>
  ${gamesHtml}
  <div class="footer">
    EUGINE Analytics™ v3.0 • GS ITALYINVESTMENTS • Premium Report
  </div>
</body>
</html>`;
  };

  const exportAsHtml = () => {
    setExportingHtml(true);
    try {
      const htmlContent = generateHtmlContent();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `eugine-report-${getFormattedDate()}.html`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting HTML:', error);
    } finally {
      setExportingHtml(false);
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
        <div className="flex gap-3">
          <Button
            onClick={exportAsImage}
            disabled={exportingImage}
            variant="outline"
            className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-400 text-emerald-400"
          >
            {exportingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
            {t('export.image')}
          </Button>
          <Button
            onClick={exportAsHtml}
            disabled={exportingHtml}
            variant="outline"
            className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400 text-blue-400"
          >
            {exportingHtml ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCode className="w-4 h-4" />}
            {t('export.html')}
          </Button>
        </div>
      </div>
    </div>
  );
}
