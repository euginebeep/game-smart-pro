export interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
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
}

export interface OddsResponse {
  games: Game[];
  remaining: number;
  isToday: boolean;
  alertMessage: string;
  foundDate: Date;
}

export interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
}
