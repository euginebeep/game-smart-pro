/**
 * Analysis Page - Full screen independent page for game analysis
 * Opens when user clicks "View Full Analysis" on MatchCard
 * Preserves game state when navigating back
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FullAnalysis } from '@/components/FullAnalysis';
import { useLanguage } from '@/contexts/LanguageContext';
import { Game } from '@/types/game';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  // Get game data from navigation state
  const { game, userTier } = (location.state as { game: Game; userTier: string }) || {};

  const labels = {
    pt: { back: 'Voltar', noData: 'Dados do jogo não encontrados' },
    en: { back: 'Back', noData: 'Game data not found' },
    es: { back: 'Volver', noData: 'Datos del juego no encontrados' },
    it: { back: 'Indietro', noData: 'Dati della partita non trovati' },
  };

  const l = labels[language] || labels.pt;

  // Handle back navigation - go back without refreshing
  const handleBack = () => {
    navigate(-1);
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{l.noData}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            {l.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{l.back}</span>
          </button>

          <div className="flex-1 flex items-center justify-center gap-3">
            <span className="text-foreground font-bold">{game.homeTeam}</span>
            <span className="text-muted-foreground text-sm">vs</span>
            <span className="text-foreground font-bold">{game.awayTeam}</span>
          </div>

          {/* Spacer for alignment */}
          <div className="w-20" />
        </div>
      </header>

      {/* Full Analysis Content */}
      <main className="max-w-7xl mx-auto">
        <FullAnalysis 
          game={game} 
          userTier={userTier as 'free' | 'basic' | 'advanced' | 'premium'} 
        />
      </main>
    </div>
  );
}
