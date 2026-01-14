import type { Game, OddsResponse } from '../types/game';

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

// Função para filtrar jogos válidos de um dia específico
function filtrarJogosValidos(jogos: any[], dataReferencia: Date): any[] {
  const agora = new Date();
  const limiteMinimo = new Date(agora.getTime() + 10 * 60 * 1000); // +10 minutos
  
  const inicioDia = new Date(dataReferencia);
  inicioDia.setHours(0, 0, 0, 0);
  
  const fimDia = new Date(dataReferencia);
  fimDia.setHours(23, 59, 59, 999);
  
  return jogos.filter((game: any) => {
    const dataJogo = new Date(game.commence_time);
    
    // Jogo está no dia certo?
    const noDiaCerto = dataJogo >= inicioDia && dataJogo <= fimDia;
    
    // Jogo tem pelo menos 10 minutos antes de começar?
    const temTempo = dataJogo > limiteMinimo;
    
    return noDiaCerto && temTempo;
  });
}

// Buscar jogos dia por dia até encontrar
interface ResultadoBusca {
  jogos: any[];
  diaEncontrado: number;
  dataAlvo: Date;
  mensagem: string;
}

function buscarJogosDisponiveis(oddsData: any[]): ResultadoBusca {
  const hoje = new Date();
  
  // Tentar buscar jogos dia por dia até 7 dias no futuro
  for (let diasNoFuturo = 0; diasNoFuturo <= 7; diasNoFuturo++) {
    const dataAlvo = new Date(hoje);
    dataAlvo.setDate(dataAlvo.getDate() + diasNoFuturo);
    
    const jogosValidos = filtrarJogosValidos(oddsData, dataAlvo);
    
    if (jogosValidos.length > 0) {
      const diaTexto = diasNoFuturo === 0 ? 'HOJE' : 
                       diasNoFuturo === 1 ? 'AMANHÃ' :
                       dataAlvo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      console.log(`✅ Encontrados ${jogosValidos.length} jogos para ${diaTexto}`);
      
      return {
        jogos: jogosValidos,
        diaEncontrado: diasNoFuturo,
        dataAlvo: dataAlvo,
        mensagem: diasNoFuturo === 0 ? '🔴 JOGOS DE HOJE' :
                  diasNoFuturo === 1 ? '📅 JOGOS DE AMANHÃ' :
                  `📅 JOGOS DE ${diaTexto}`
      };
    }
    
    console.log(`⚠️ Nenhum jogo válido para dia +${diasNoFuturo}. Tentando próximo dia...`);
  }
  
  throw new Error('Nenhum jogo encontrado nos próximos 7 dias');
}

// Determinar o tipo de dia para badges
function getDayType(diaEncontrado: number): 'today' | 'tomorrow' | 'future' {
  if (diaEncontrado === 0) return 'today';
  if (diaEncontrado === 1) return 'tomorrow';
  return 'future';
}

function getDayLabel(dataJogo: Date): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const dataJogoNormalizada = new Date(dataJogo);
  dataJogoNormalizada.setHours(0, 0, 0, 0);
  
  const diffDias = Math.round((dataJogoNormalizada.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDias === 0) return '🔴 HOJE';
  if (diffDias === 1) return '📅 AMANHÃ';
  return `📅 ${dataJogo.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
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
    
    // Pegar campeonatos ativos
    const activeSports = soccerSports.filter((s: any) => s.active);
    
    console.log('Campeonatos ativos:', activeSports);
    
    // Buscar jogos de múltiplos campeonatos
    let allOddsData: any[] = [];
    let apiRemaining = parseInt(remaining || '0');
    
    for (const sport of activeSports) {
      console.log('Buscando odds para:', sport.title);
      
      try {
        const oddsResponse = await fetch(
          `${API_BASE}/sports/${sport.key}/odds?apiKey=${API_KEY}&regions=us&markets=h2h,totals&oddsFormat=decimal`
        );
        
        if (!oddsResponse.ok) {
          console.warn(`Erro ao buscar ${sport.title}: ${oddsResponse.status}`);
          continue;
        }
        
        apiRemaining = parseInt(oddsResponse.headers.get('x-requests-remaining') || '0');
        const oddsData = await oddsResponse.json();
        
        if (oddsData && oddsData.length > 0) {
          // Adicionar info da liga em cada jogo
          const jogosComLiga = oddsData.map((game: any) => ({
            ...game,
            leagueTitle: sport.title
          }));
          allOddsData = [...allOddsData, ...jogosComLiga];
        }
        
        console.log(`${oddsData?.length || 0} jogos de ${sport.title}. Total acumulado: ${allOddsData.length}`);
        
      } catch (err) {
        console.warn(`Erro ao processar ${sport.title}:`, err);
        continue;
      }
    }
    
    if (allOddsData.length === 0) {
      throw new Error('Não foi possível encontrar jogos disponíveis');
    }
    
    // BUSCAR JOGOS DIA POR DIA
    const resultado = buscarJogosDisponiveis(allOddsData);
    
    const dayType = getDayType(resultado.diaEncontrado);
    
    // Processar os jogos encontrados (máximo 5)
    const games: Game[] = resultado.jogos
      .slice(0, 5)
      .map((game: any) => {
        const bookmaker = game.bookmakers?.[0];
        if (!bookmaker) return null;
        
        const h2h = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        const totals = bookmaker.markets?.find((m: any) => m.key === 'totals');
        
        if (!h2h) return null;
        
        const startTime = new Date(game.commence_time);
        
        return {
          id: game.id || `${game.home_team}-${game.away_team}`,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          league: game.leagueTitle || 'Futebol',
          startTime,
          bookmaker: bookmaker.title,
          odds: {
            home: h2h.outcomes.find((o: any) => o.name === game.home_team)?.price || 2.0,
            draw: h2h.outcomes.find((o: any) => o.name === 'Draw')?.price || 3.2,
            away: h2h.outcomes.find((o: any) => o.name === game.away_team)?.price || 3.5,
            over: totals?.outcomes.find((o: any) => o.name === 'Over')?.price || 1.85,
            under: totals?.outcomes.find((o: any) => o.name === 'Under')?.price || 1.9,
          },
          dayType,
          dayLabel: getDayLabel(startTime)
        };
      })
      .filter((game): game is NonNullable<typeof game> => game !== null) as Game[];
    
    if (games.length === 0) {
      throw new Error('Não foi possível processar os jogos encontrados');
    }
    
    console.log(`Total de ${games.length} jogos processados para análise`);
    
    return { 
      games, 
      remaining: apiRemaining,
      isToday: resultado.diaEncontrado === 0,
      alertMessage: resultado.mensagem,
      foundDate: resultado.dataAlvo
    };
    
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
}
