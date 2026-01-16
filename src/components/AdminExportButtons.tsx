import { useState } from 'react';
import { FileCode, Image, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface AdminExportButtonsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function AdminExportButtons({ containerRef }: AdminExportButtonsProps) {
  const [exportingHtml, setExportingHtml] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);

  const exportAsHtml = async () => {
    if (!containerRef.current) return;
    
    setExportingHtml(true);
    try {
      const styles = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

      const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>EUGINE - ${new Date().toLocaleDateString('pt-BR')}</title>
  <style>${styles}</style>
</head>
<body style="background: #0f172a; min-height: 100vh;">
  ${containerRef.current.outerHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eugine-${new Date().toISOString().split('T')[0]}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingHtml(false);
    }
  };

  const exportAsImage = async () => {
    if (!containerRef.current) return;
    
    setExportingImage(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `eugine-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
      <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mr-4">
        <Download className="w-4 h-4" />
        <span>Admin Export</span>
      </div>
      
      <Button
        onClick={exportAsHtml}
        disabled={exportingHtml}
        variant="outline"
        size="sm"
        className="gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
      >
        <FileCode className="w-4 h-4" />
        {exportingHtml ? 'Exportando...' : 'Exportar HTML'}
      </Button>
      
      <Button
        onClick={exportAsImage}
        disabled={exportingImage}
        variant="outline"
        size="sm"
        className="gap-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
      >
        <Image className="w-4 h-4" />
        {exportingImage ? 'Exportando...' : 'Exportar Imagem'}
      </Button>
    </div>
  );
}
