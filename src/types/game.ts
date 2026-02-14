export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  league: string;
  leagueId?: number;
  leagueLogo?: string;
  season?: number;
  startTime: Date;
  startTimeUTC?: string; // Horário original UTC
  brazilTime?: string; // Horário de Brasília formatado (HH:mm)
  localTime?: string; // Horário local do evento
  bookmaker: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over: number;
    under: number;
    over15?: number;
    under15?: number;
    over35?: number;
    under35?: number;
    over45?: number;
    under45?: number;
    bttsYes?: number;
    bttsNo?: number;
    doubleChanceHomeOrDraw?: number;
    doubleChanceAwayOrDraw?: number;
    doubleChanceHomeOrAway?: number;
    drawNoBet?: number;
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
  // Injury Details (Premium)
  homeInjuryDetails?: InjuryDetail[];
  awayInjuryDetails?: InjuryDetail[];
  // API Predictions
  apiPrediction?: {
    winner?: string;
    winnerConfidence?: number;
    homeGoals?: string;
    awayGoals?: string;
    advice?: string;
    under_over?: string;
    // Campos traduzidos adicionados pelo backend
    winnerLabel?: string;
    confidenceLabel?: string;
  };
  // ===== PREMIUM DATA =====
  // Corners Statistics
  cornersData?: {
    homeAvgCorners: number;
    awayAvgCorners: number;
    homeAvgCornersFor: number;
    awayAvgCornersFor: number;
    homeAvgCornersAgainst: number;
    awayAvgCornersAgainst: number;
    over95Percentage: number;
    over105Percentage: number;
  };
  // Cards Statistics  
  cardsData?: {
    homeAvgYellow: number;
    awayAvgYellow: number;
    homeAvgRed: number;
    awayAvgRed: number;
    over35CardsPercentage: number;
    over45CardsPercentage: number;
  };
  // Lineups
  lineups?: {
    homeFormation?: string;
    awayFormation?: string;
    homeStarting?: PlayerInfo[];
    awayStarting?: PlayerInfo[];
    homeCoach?: string;
    awayCoach?: string;
  };
  // BTTS Odds (real from bookmaker)
  bttsOdds?: {
    yes: number;
    no: number;
  };
  // Top Scorers
  topScorers?: {
    home?: TopScorerInfo[];
    away?: TopScorerInfo[];
  };
}

export interface InjuryDetail {
  player: string;
  type: 'injury' | 'suspension' | 'doubt';
  reason?: string;
}

export interface PlayerInfo {
  name: string;
  number?: number;
  position?: string;
}

export interface TopScorerInfo {
  name: string;
  goals: number;
  assists?: number;
  team: string;
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
  registrationSource?: string;
  isFreeReport?: boolean;
  isFreeSource?: boolean;
  maxAccumulators?: number;
  maxZebras?: number;
  maxDoubles?: number;
  fullAnalysisCached?: boolean;
}

export interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
  confidence?: number; // 0-100
  valuePercentage?: number; // Value edge %
  impliedProbability?: number; // Prob que a casa calcula
  estimatedProbability?: number; // Prob que o EUGINE calcula
  isSkip?: boolean;
  skipReason?: string;
  factors?: AnalysisFactor[];
}

export interface AnalysisFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}
