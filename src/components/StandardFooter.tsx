import USFlag3D from '@/components/USFlag3D';
import { useLanguage } from '@/contexts/LanguageContext';

const footerLabels: Record<string, any> = {
  pt: {
    about: 'Sobre Nós',
    terms: 'Termos de Uso',
    privacy: 'Política de Privacidade',
    responsible: 'Jogo Responsável',
    disclaimer: 'O EUGINE é uma ferramenta de análise estatística. Resultados passados não garantem resultados futuros. Apostas esportivas envolvem risco de perda. Aposte com responsabilidade e apenas valores que você pode perder.',
    copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos os direitos reservados.`,
  },
  en: {
    about: 'About Us',
    terms: 'Terms of Use',
    privacy: 'Privacy Policy',
    responsible: 'Responsible Gambling',
    disclaimer: 'EUGINE is a statistical analysis tool. Past results do not guarantee future results. Sports betting involves risk of loss. Bet responsibly and only with money you can afford to lose.',
    copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. All rights reserved.`,
  },
  es: {
    about: 'Sobre Nosotros',
    terms: 'Términos de Uso',
    privacy: 'Política de Privacidad',
    responsible: 'Juego Responsable',
    disclaimer: 'EUGINE es una herramienta de análisis estadístico. Resultados pasados no garantizan resultados futuros. Las apuestas deportivas implican riesgo de pérdida. Apueste con responsabilidad.',
    copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Todos los derechos reservados.`,
  },
  it: {
    about: 'Chi Siamo',
    terms: 'Termini di Utilizzo',
    privacy: 'Privacy Policy',
    responsible: 'Gioco Responsabile',
    disclaimer: 'EUGINE è uno strumento di analisi statistica. I risultati passati non garantiscono risultati futuri. Le scommesse sportive comportano rischio di perdita. Scommetti responsabilmente.',
    copyright: `© ${new Date().getFullYear()} GS ITALY INVESTMENTS LLC. Tutti i diritti riservati.`,
  },
};

export function StandardFooter({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const l = footerLabels[language] || footerLabels.pt;

  return (
    <footer className={`rounded-2xl p-8 sm:p-10 ${className}`} style={{ background: '#0A1A2F' }}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <a href="/about" className="text-sm hover:text-white transition-colors" style={{ color: '#7EB8D0', fontFamily: "'Poppins', sans-serif" }}>
            {l.about}
          </a>
          <a href="/termos-de-uso" className="text-sm hover:text-white transition-colors" style={{ color: '#7EB8D0', fontFamily: "'Poppins', sans-serif" }}>
            {l.terms}
          </a>
          <a href="/politica-de-privacidade" className="text-sm hover:text-white transition-colors" style={{ color: '#7EB8D0', fontFamily: "'Poppins', sans-serif" }}>
            {l.privacy}
          </a>
          <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors" style={{ color: '#7EB8D0', fontFamily: "'Poppins', sans-serif" }}>
            {l.responsible}
          </a>
        </div>

        {/* Disclaimer */}
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#808A94', fontFamily: "'Poppins', sans-serif" }}>
          {l.disclaimer}
        </p>

        {/* Copyright */}
        <p className="text-xs" style={{ color: '#808A94' }}>
          <span className="inline-flex items-center gap-1">
            <USFlag3D className="w-3.5 h-2.5" /> {l.copyright} <USFlag3D className="w-3.5 h-2.5" />
          </span>
        </p>
      </div>
    </footer>
  );
}
