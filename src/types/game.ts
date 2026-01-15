export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  league: string;
  leagueId?: number;
  season?: number;
  startTime: Date;
  bookmaker: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
  };
  dayType?: 'today' | 'tomorrow' | 'future';
  dayLabel?: string;
  analysis?: BettingAnalysis;
  advancedData?: AdvancedGameData;
}

export interface AdvancedGameData {
  // Head 2 Head
  h2h?: {
    totalGames: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    avgGoals: number;
    lastGames: { home: number; away: number; date: string }[];
  };
  // Team Statistics
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  // Standings
  homePosition?: number;
  awayPosition?: number;
  homeForm?: string; // e.g., "WWDLW"
  awayForm?: string;
  // Injuries
  homeInjuries?: number;
  awayInjuries?: number;
  // API Predictions
  apiPrediction?: {
    winner?: string;
    winnerConfidence?: number;
    homeGoals?: string;
    awayGoals?: string;
    advice?: string;
    under_over?: string;
  };
}

export interface TeamStats {
  goalsScored: number;
  goalsConceded: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  cleanSheets: number;
  failedToScore: number;
  bttsPercentage: number;
  over25Percentage: number;
}

export interface OddsResponse {
  games: Game[];
  remaining: number;
  isToday: boolean;
  alertMessage: string;
  foundDate: Date;
  dailySearchesRemaining?: number;
  isTrial?: boolean;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
  confidence?: number; // 0-100
  factors?: AnalysisFactor[];
}

export interface AnalysisFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}
