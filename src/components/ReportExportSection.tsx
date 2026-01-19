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

  // Allow premium users and admins
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
      
      // Clone the element for export to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Create a wrapper with proper styling
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: ${element.scrollWidth}px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        padding: 20px;
      `;
      
      // Add header
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; padding: 30px 20px; margin-bottom: 20px; background: rgba(30, 41, 59, 0.9); border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h1 style="font-size: 2rem; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">🎯 EUGINE Analytics</h1>
          <p style="color: #94a3b8; font-size: 0.875rem;">${t('export.generatedAt')}: ${new Date().toLocaleString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US')}</p>
          <p style="color: #fbbf24; font-size: 0.875rem; margin-top: 4px;">${t('export.totalGames')}: ${games.length}</p>
        </div>
      `;
      wrapper.appendChild(header);
      wrapper.appendChild(clone);
      
      // Add footer
      const footer = document.createElement('div');
      footer.innerHTML = `
        <div style="text-align: center; padding: 20px; margin-top: 20px; color: #64748b; font-size: 0.75rem;">
          EUGINE Analytics™ v3.0 • GS ITALYINVESTMENTS • Premium Report
        </div>
      `;
      wrapper.appendChild(footer);
      
      document.body.appendChild(wrapper);
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(wrapper, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: wrapper.scrollWidth,
        height: wrapper.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(wrapper);

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

  const exportAsHtml = () => {
    if (!contentRef.current) return;
    
    setExportingHtml(true);
    try {
      const element = contentRef.current;
      const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : language === 'it' ? 'it-IT' : 'en-US';
      
      // Get all styles from the page
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Clone and get HTML content
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Remove any interactive elements
      clone.querySelectorAll('button, input, select').forEach(el => {
        if (!el.closest('[data-keep-for-export]')) {
          el.remove();
        }
      });

      const htmlContent = `<!DOCTYPE html>
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
    .report-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    .report-header {
      text-align: center;
      padding: 30px 20px;
      margin-bottom: 30px;
      background: rgba(30, 41, 59, 0.9);
      border-radius: 16px;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
    .report-header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #fbbf24;
      margin-bottom: 8px;
    }
    .report-header p { color: #94a3b8; font-size: 0.875rem; }
    .report-header .highlight { color: #fbbf24; }
    .report-footer { 
      text-align: center; 
      padding: 20px; 
      margin-top: 30px; 
      color: #64748b; 
      font-size: 0.75rem; 
      border-top: 1px solid rgba(100, 116, 139, 0.3);
    }
    
    /* Include page styles */
    ${styles}
    
    /* Export-specific overrides */
    .glass-card {
      background: rgba(30, 41, 59, 0.9) !important;
      border: 1px solid rgba(148, 163, 184, 0.2) !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-bottom: 16px !important;
    }
    [class*="animate-"] { animation: none !important; }
    .transition-all { transition: none !important; }
  </style>
</head>
<body>
  <div class="report-wrapper">
    <div class="report-header">
      <h1>🎯 EUGINE Analytics</h1>
      <p>${t('export.generatedAt')}: ${new Date().toLocaleString(locale)}</p>
      <p class="highlight">${t('export.totalGames')}: ${games.length}</p>
    </div>
    
    <div class="report-content">
      ${clone.innerHTML}
    </div>
    
    <div class="report-footer">
      EUGINE Analytics™ v3.0 • GS ITALYINVESTMENTS • Premium Report
    </div>
  </div>
</body>
</html>`;

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
