import type { Game } from '../types/game';

export function analyzeBet(game: Game): { type: string; reason: string; profit: number } {
  const betAmount = 40;
  
  if (game.odds.over > 0 && game.odds.over < 2.0) {
    return {
      type: 'MAIS DE 2.5 GOLS',
      reason: `Odd de ${game.odds.over.toFixed(2)} indica alta expectativa de gols. Mercado aposta em jogo movimentado entre ${game.homeTeam} e ${game.awayTeam}.`,
      profit: parseFloat((betAmount * game.odds.over - betAmount).toFixed(2))
    };
  }
  
  const avgOdd = (game.odds.home + game.odds.away) / 2;
  return {
    type: 'AMBAS EQUIPES MARCAM',
    reason: `Jogo equilibrado com odds similares (Casa: ${game.odds.home.toFixed(2)} / Fora: ${game.odds.away.toFixed(2)}). Times tendem a ter boa performance ofensiva.`,
    profit: parseFloat((betAmount * avgOdd - betAmount).toFixed(2))
  };
}

const API_KEY = import.meta.env.VITE_ODDS_API_KEY || '524754a5712dadce50182933dd68e47e';

const API_BASE = 'https://api.the-odds-api.com/v4';

interface OddsResponse {
  games: Game[];
  remaining: number;
}

export async function fetchOdds(): Promise<OddsResponse> {
  try {
    // Buscar esportes disponíveis
    const sportsResponse = await fetch(
      `${API_BASE}/sports?apiKey=${API_KEY}`
    );
    
    if (!sportsResponse.ok) {
      throw new Error(`Erro ao buscar esportes: ${sportsResponse.status}`);
    }
    
    const sports = await sportsResponse.json();
    const remaining = sportsResponse.headers.get('x-requests-remaining');
    
    console.log('Esportes disponíveis:', sports);
    
    // Filtrar futebol - aceitar qualquer que tenha soccer
    const soccerSports = sports.filter((s: any) => 
      s.group === 'Soccer' || s.key.includes('soccer')
    );
    
    if (soccerSports.length === 0) {
      throw new Error('Nenhum campeonato de futebol disponível');
    }
    
    // Pegar primeiro campeonato que tem jogos in-season
    const activeSport = soccerSports.find((s: any) => s.active) || soccerSports[0];
    
    console.log('Buscando odds para:', activeSport);
    
    // Buscar odds - SEM barra antes do ?
    const oddsResponse = await fetch(
      `${API_BASE}/sports/${activeSport.key}/odds?apiKey=${API_KEY}&regions=us&markets=h2h,totals&oddsFormat=decimal`
    );
    
    if (!oddsResponse.ok) {
      const errorText = await oddsResponse.text();
      throw new Error(`Erro ${oddsResponse.status}: ${errorText}`);
    }
    
    const oddsData = await oddsResponse.json();
    
    console.log('Odds recebidas:', oddsData);
    
    if (!oddsData || oddsData.length === 0) {
      throw new Error('Nenhum jogo disponível no momento');
    }
    
    // Processar jogos
    const games: Game[] = oddsData
      .slice(0, 5)
      .map((game: any, idx: number) => {
        const bookmaker = game.bookmakers?.[0];
        if (!bookmaker) return null;
        
        const h2h = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        const totals = bookmaker.markets?.find((m: any) => m.key === 'totals');
        
        if (!h2h) return null;
        
        return {
          id: idx + 1,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          league: activeSport.title,
          startTime: new Date(game.commence_time),
          bookmaker: bookmaker.title,
          odds: {
            home: h2h.outcomes.find((o: any) => o.name === game.home_team)?.price || 2.0,
            draw: h2h.outcomes.find((o: any) => o.name === 'Draw')?.price || 3.2,
            away: h2h.outcomes.find((o: any) => o.name === game.away_team)?.price || 3.5,
            over: totals?.outcomes.find((o: any) => o.name === 'Over')?.price || 1.85,
            under: totals?.outcomes.find((o: any) => o.name === 'Under')?.price || 1.9,
          }
        };
      })
      .filter((game): game is Game => game !== null);
    
    if (games.length === 0) {
      throw new Error('Não foi possível processar os jogos');
    }
    
    return { 
      games, 
      remaining: parseInt(remaining || '0') 
    };
    
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
}
