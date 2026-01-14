import { Game, OddsResponse } from '@/types/game';

const API_KEY = import.meta.env.VITE_ODDS_API_KEY;
const API_BASE = 'https://api.the-odds-api.com/v4';
const CACHE_KEY = 'eugine_odds_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: OddsResponse;
  timestamp: number;
}

function getCachedOdds(): OddsResponse | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp }: CachedData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return {
      ...data,
      games: data.games.map(g => ({ ...g, startTime: new Date(g.startTime) }))
    };
  } catch {
    return null;
  }
}

function setCachedOdds(data: OddsResponse): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore storage errors
  }
}

export async function fetchOdds(): Promise<OddsResponse> {
  // Check cache first
  const cached = getCachedOdds();
  if (cached) {
    console.log('📦 Using cached odds');
    return cached;
  }

  if (!API_KEY) {
    throw new Error('API key não configurada. Adicione VITE_ODDS_API_KEY nas variáveis de ambiente.');
  }

  try {
    // Fetch available sports
    const sportsResponse = await fetch(`${API_BASE}/sports?apiKey=${API_KEY}`);
    
    if (!sportsResponse.ok) {
      throw new Error(`Erro ao buscar esportes: ${sportsResponse.status}`);
    }

    const sports = await sportsResponse.json();
    
    // Filter soccer sports
    const soccerSports = sports.filter((sport: { key: string; active: boolean }) => 
      sport.key.includes('soccer') && sport.active
    );

    if (soccerSports.length === 0) {
      throw new Error('Nenhum campeonato de futebol disponível no momento.');
    }

    // Get the first available soccer league
    const selectedSport = soccerSports[0];
    
    // Fetch odds for the selected sport
    const oddsResponse = await fetch(
      `${API_BASE}/sports/${selectedSport.key}/odds?` +
      `apiKey=${API_KEY}&regions=br,us,eu&markets=h2h,totals&oddsFormat=decimal`
    );

    if (!oddsResponse.ok) {
      throw new Error(`Erro ao buscar odds: ${oddsResponse.status}`);
    }

    const remaining = parseInt(oddsResponse.headers.get('x-requests-remaining') || '0', 10);
    const oddsData = await oddsResponse.json();

    // Process games (limit to 5)
    const games: Game[] = oddsData.slice(0, 5).map((event: any) => {
      const bookmaker = event.bookmakers?.[0];
      const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
      const totalsMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');

      const homeOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === event.home_team);
      const awayOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === event.away_team);
      const drawOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === 'Draw');
      const overOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Over');
      const underOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Under');

      return {
        id: event.id,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        league: selectedSport.title || selectedSport.key,
        startTime: new Date(event.commence_time),
        bookmaker: bookmaker?.title || 'Unknown',
        odds: {
          home: homeOutcome?.price || 0,
          draw: drawOutcome?.price || 0,
          away: awayOutcome?.price || 0,
          over: overOutcome?.price || 0,
          under: underOutcome?.price || 0,
        }
      };
    });

    const result = { games, remaining };
    setCachedOdds(result);
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar odds:', error);
    throw error;
  }
}

export function analyzeBet(game: Game): { type: string; reason: string; profit: number } {
  const betAmount = 40;
  
  if (game.odds.over > 0 && game.odds.over < 2.0) {
    return {
      type: 'MAIS DE 2.5 GOLS',
      reason: `Odd de ${game.odds.over.toFixed(2)} indica alta expectativa de gols. Mercado aposta em jogo movimentado entre ${game.homeTeam} e ${game.awayTeam}.`,
      profit: parseFloat((betAmount * game.odds.over - betAmount).toFixed(2))
    };
  }
  
  // Default: Both teams to score analysis
  const avgOdd = (game.odds.home + game.odds.away) / 2;
  return {
    type: 'AMBAS EQUIPES MARCAM',
    reason: `Jogo equilibrado com odds similares (Casa: ${game.odds.home.toFixed(2)} / Fora: ${game.odds.away.toFixed(2)}). Times tendem a ter boa performance ofensiva.`,
    profit: parseFloat((betAmount * avgOdd - betAmount).toFixed(2))
  };
}
