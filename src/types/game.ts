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
}

export interface OddsResponse {
  games: Game[];
  remaining: number;
}

export interface BettingAnalysis {
  type: string;
  reason: string;
  profit: number;
}
