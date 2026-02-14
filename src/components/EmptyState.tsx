import { Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function EmptyState() {
  const { t, language } = useLanguage();

  const labels = {
    pt: {
      title: 'Analise os jogos de hoje',
      subtitle: 'Clique em Buscar Jogos para receber análises com probabilidades reais.',
      cta: 'Buscar Jogos',
      stats: '23 ligas monitoradas • Odds de 6+ casas • Atualizado a cada 10min',
    },
    en: {
      title: 'Analyze today\'s games',
      subtitle: 'Click Fetch Games to receive analysis with real probabilities.',
      cta: 'Fetch Games',
      stats: '23 leagues monitored • Odds from 6+ bookmakers • Updated every 10min',
    },
    es: {
      title: 'Analiza los juegos de hoy',
      subtitle: 'Haz clic en Buscar Juegos para recibir análisis con probabilidades reales.',
      cta: 'Buscar Juegos',
      stats: '23 ligas monitoreadas • Odds de 6+ casas • Actualizado cada 10min',
    },
    it: {
      title: 'Analizza le partite di oggi',
      subtitle: 'Clicca su Cerca Partite per ricevere analisi con probabilità reali.',
      cta: 'Cerca Partite',
      stats: '23 campionati monitorati • Quote da 6+ bookmaker • Aggiornato ogni 10min',
    },
  };

  const l = labels[language] || labels.pt;

  return (
    <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
        {l.title}
      </h2>
      <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-md">
        {l.subtitle}
      </p>

      <p className="text-muted-foreground/50 text-xs sm:text-sm mt-10 tracking-wide">
        {l.stats}
      </p>
    </div>
  );
}
