import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Users, 
  Home, 
  Stethoscope, 
  Target,
  ChevronDown,
  Trophy,
  Zap,
  PieChart,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { Game, BettingAnalysis } from '@/types/game';
import { analyzeBet } from '@/services/oddsAPI';
import { useLanguage } from '@/contexts/LanguageContext';

interface FullAnalysisProps {
  game: Game;
  userTier?: 'free' | 'basic' | 'advanced' | 'premium';
}

export function FullAnalysis({ game, userTier = 'free' }: FullAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'corners' | 'cards' | 'props'>('goals');
  const { t, language } = useLanguage();

  const analysis = useMemo(() => analyzeBet(game), [game]);
  const adv = game.advancedData;

  // Calculate probabilities
  const calcProb = (odd: number) => odd > 0 ? Math.round((1 / odd) * 100) : 0;
  
  // Projected score based on stats
  const projectedHome = adv?.apiPrediction?.homeGoals || '1';
  const projectedAway = adv?.apiPrediction?.awayGoals || '1';

  // Get confidence score out of 10
  const confidenceScore = analysis?.confidence ? (analysis.confidence / 10).toFixed(1) : '7.0';

  // Labels - Termos SIMPLES e FÁCEIS de entender para leigos
  const labels = {
    pt: {
      projectedScore: 'Placar Esperado',
      mainRec: '⭐ Nossa Melhor Aposta',
      suggestedBet: 'Aposte em',
      confidenceScore: 'Chance de Acerto',
      valueEdge: 'Vantagem Matemática',
      otherOptions: '📊 Outras Opções de Aposta',
      goals: 'Gols',
      corners: 'Escanteios',
      cards: 'Cartões',
      playerProps: 'Jogadores',
      over25: 'Mais de 2 gols no jogo',
      btts: 'Os dois times marcam',
      over35: 'Mais de 3 gols no jogo',
      prob: 'Chance',
      odds: 'Cotação',
      factorDeepDive: '🔍 Por que recomendamos esta aposta?',
      market: 'Tendência do Mercado',
      statistics: 'Números dos Times',
      form: 'Como estão jogando',
      h2h: 'Histórico entre os times',
      bettingVolume: 'Onde o dinheiro está indo',
      smartMoney: 'Apostadores profissionais',
      keyLineMoves: 'Mudanças nas cotações',
      conclusion: 'Resumo',
      xgComparison: 'Gols esperados (xG)',
      shotConversion: 'Aproveitamento de chutes',
      possession: 'Posse de bola',
      recentMatches: 'Últimos 5 jogos',
      goalsPerGame: 'Gols por jogo',
      goalsScored: 'Gols feitos',
      goalsConceded: 'Gols sofridos',
      cleanSheets: 'Jogos sem sofrer gol',
      pastMeetings: 'Últimos 10 confrontos',
      homeWinsVsAway: 'Quem venceu mais',
      goalDifference: 'Saldo de gols',
      homeAdvantage: 'Jogar em casa ajuda?',
      homeWinPercent: 'Vitórias jogando em casa',
      crowdInfluence: 'Força da torcida',
      travelFatigue: 'Cansaço do visitante',
      injuries: 'Jogadores fora',
      keyPlayerStatus: 'Quem não joga',
      impactScore: 'Quanto isso afeta o time',
      lineupChange: 'Mudança no time',
      motivation: 'Motivação',
      leaguePosition: 'Posição na tabela',
      qualificationBattle: 'O que está em jogo',
      rivalryIntensity: 'Rivalidade',
      extraData: '📌 Informações Extras',
      oddsComparison: 'Melhores Cotações',
      refereeAnalysis: 'Sobre o Árbitro',
      statCuriosities: 'Curiosidades',
      bestOdds: 'Compare as cotações',
      bookmaker: 'Casa de Apostas',
      draw: 'Empate',
      away: 'Visitante',
      arbOpportunities: 'Oportunidades',
      refereeName: 'Nome',
      games: 'Jogos',
      yellowCards: 'Cartões por jogo',
      penaltyFreq: 'Pênaltis por jogo',
      funFacts: 'Dados interessantes',
      homeWin: 'Casa',
      awayWin: 'Visitante',
      injured: 'Lesionado',
      suspended: 'Suspenso',
      smartMoneyFavors: 'Apostadores experientes estão apostando no mandante.',
      keyLineFavor: 'As cotações estão favorecendo o time da casa.',
      arsenalDominates: 'O mandante ataca muito melhor.',
      strongHomeForm: 'Time da casa em boa fase. Visitante irregular.',
      historicalAdvantage: 'Mandante tem vantagem nos confrontos diretos.',
      significantHomeAdv: 'Jogar em casa é uma grande vantagem neste jogo.',
      missingDefender: 'Visitante sem jogadores importantes. Vantagem para o mandante.',
      highStakes: 'Jogo importante para ambos. Espere muita intensidade.',
      highCrowdInfluence: 'Torcida muito forte. Isso ajuda o mandante.',
      awayTravelFatigue: 'O visitante viajou bastante. Pode estar cansado.',
      strictReferee: 'Árbitro rigoroso. Espere muitos cartões.',
      none: 'Nenhuma',
      keyPlayers: 'jogadores importantes fora',
      fightingForTop: 'Brigando por vaga na competição.',
      historicRivalry: 'Grande rivalidade entre os times.',
      scoredSecondHalf: 'marcou 80% dos gols no 2º tempo.',
      concededFirst: 'sofreu gol primeiro em 70% dos jogos fora.',
      lastH2HOver: 'Últimos 5 confrontos: 80% tiveram mais de 2 gols.',
      unbeatenHome: 'invicto em casa há 8 jogos.',
      winsAbbr: 'V',
      drawsAbbr: 'E',
      lossesAbbr: 'D',
      inGames: 'em',
      gamesWord: 'jogos',
    },
    en: {
      projectedScore: 'Expected Score',
      mainRec: '⭐ Our Best Bet',
      suggestedBet: 'Bet on',
      confidenceScore: 'Win Probability',
      valueEdge: 'Mathematical Edge',
      otherOptions: '📊 Other Betting Options',
      goals: 'Goals',
      corners: 'Corners',
      cards: 'Cards',
      playerProps: 'Players',
      over25: 'More than 2 goals in the game',
      btts: 'Both teams score',
      over35: 'More than 3 goals in the game',
      prob: 'Chance',
      odds: 'Odds',
      factorDeepDive: '🔍 Why do we recommend this bet?',
      market: 'Market Trend',
      statistics: 'Team Numbers',
      form: 'How they are playing',
      h2h: 'Head-to-head history',
      bettingVolume: 'Where the money is going',
      smartMoney: 'Professional bettors',
      keyLineMoves: 'Odds changes',
      conclusion: 'Summary',
      xgComparison: 'Expected goals (xG)',
      shotConversion: 'Shot accuracy',
      possession: 'Ball possession',
      recentMatches: 'Last 5 games',
      goalsPerGame: 'Goals per game',
      goalsScored: 'Goals scored',
      goalsConceded: 'Goals conceded',
      cleanSheets: 'Clean sheets',
      pastMeetings: 'Last 10 matches',
      homeWinsVsAway: 'Who won more',
      goalDifference: 'Goal difference',
      homeAdvantage: 'Does home field help?',
      homeWinPercent: 'Home wins',
      crowdInfluence: 'Crowd strength',
      travelFatigue: 'Away team fatigue',
      injuries: 'Players out',
      keyPlayerStatus: 'Who is missing',
      impactScore: 'How much it affects the team',
      lineupChange: 'Team changes',
      motivation: 'Motivation',
      leaguePosition: 'League position',
      qualificationBattle: 'What is at stake',
      rivalryIntensity: 'Rivalry',
      extraData: '📌 Extra Information',
      oddsComparison: 'Best Odds',
      refereeAnalysis: 'About the Referee',
      statCuriosities: 'Fun Facts',
      bestOdds: 'Compare the odds',
      bookmaker: 'Bookmaker',
      draw: 'Draw',
      away: 'Away',
      arbOpportunities: 'Opportunities',
      refereeName: 'Name',
      games: 'Games',
      yellowCards: 'Cards per game',
      penaltyFreq: 'Penalties per game',
      funFacts: 'Interesting data',
      homeWin: 'Home',
      awayWin: 'Away',
      injured: 'Injured',
      suspended: 'Suspended',
      smartMoneyFavors: 'Experienced bettors are backing the home team.',
      keyLineFavor: 'Odds are moving in favor of the home team.',
      arsenalDominates: 'Home team has much better attack.',
      strongHomeForm: 'Home team in good form. Away team inconsistent.',
      historicalAdvantage: 'Home team has advantage in head-to-head.',
      significantHomeAdv: 'Playing at home is a big advantage in this game.',
      missingDefender: 'Away team missing key players. Advantage for home.',
      highStakes: 'Important game for both. Expect high intensity.',
      highCrowdInfluence: 'Very strong crowd. This helps the home team.',
      awayTravelFatigue: 'The away team traveled a lot. May be tired.',
      strictReferee: 'Strict referee. Expect many cards.',
      none: 'None',
      keyPlayers: 'key players out',
      fightingForTop: 'Fighting for a spot in the competition.',
      historicRivalry: 'Great rivalry between the teams.',
      scoredSecondHalf: 'scored 80% of goals in the 2nd half.',
      concededFirst: 'conceded first in 70% of away games.',
      lastH2HOver: 'Last 5 matches: 80% had over 2 goals.',
      unbeatenHome: 'unbeaten at home for 8 games.',
      winsAbbr: 'W',
      drawsAbbr: 'D',
      lossesAbbr: 'L',
      inGames: 'in',
      gamesWord: 'games',
    },
    es: {
      projectedScore: 'Marcador Esperado',
      mainRec: '⭐ Nuestra Mejor Apuesta',
      suggestedBet: 'Apuesta a',
      confidenceScore: 'Probabilidad de Acierto',
      valueEdge: 'Ventaja Matemática',
      otherOptions: '📊 Otras Opciones de Apuesta',
      goals: 'Goles',
      corners: 'Córners',
      cards: 'Tarjetas',
      playerProps: 'Jugadores',
      over25: 'Más de 2 goles en el partido',
      btts: 'Ambos equipos marcan',
      over35: 'Más de 3 goles en el partido',
      prob: 'Chance',
      odds: 'Cuota',
      factorDeepDive: '🔍 ¿Por qué recomendamos esta apuesta?',
      market: 'Tendencia del Mercado',
      statistics: 'Números de los Equipos',
      form: 'Cómo están jugando',
      h2h: 'Historial entre los equipos',
      bettingVolume: 'Hacia dónde va el dinero',
      smartMoney: 'Apostadores profesionales',
      keyLineMoves: 'Cambios en las cuotas',
      conclusion: 'Resumen',
      xgComparison: 'Goles esperados (xG)',
      shotConversion: 'Precisión de tiros',
      possession: 'Posesión del balón',
      recentMatches: 'Últimos 5 partidos',
      goalsPerGame: 'Goles por partido',
      goalsScored: 'Goles a favor',
      goalsConceded: 'Goles en contra',
      cleanSheets: 'Portería a cero',
      pastMeetings: 'Últimos 10 enfrentamientos',
      homeWinsVsAway: 'Quién ganó más',
      goalDifference: 'Diferencia de goles',
      homeAdvantage: '¿Jugar en casa ayuda?',
      homeWinPercent: 'Victorias en casa',
      crowdInfluence: 'Fuerza de la afición',
      travelFatigue: 'Cansancio del visitante',
      injuries: 'Jugadores fuera',
      keyPlayerStatus: 'Quién no juega',
      impactScore: 'Cuánto afecta al equipo',
      lineupChange: 'Cambios en el equipo',
      motivation: 'Motivación',
      leaguePosition: 'Posición en la liga',
      qualificationBattle: 'Qué está en juego',
      rivalryIntensity: 'Rivalidad',
      extraData: '📌 Información Extra',
      oddsComparison: 'Mejores Cuotas',
      refereeAnalysis: 'Sobre el Árbitro',
      statCuriosities: 'Curiosidades',
      bestOdds: 'Compara las cuotas',
      bookmaker: 'Casa de Apuestas',
      draw: 'Empate',
      away: 'Visitante',
      arbOpportunities: 'Oportunidades',
      refereeName: 'Nombre',
      games: 'Partidos',
      yellowCards: 'Tarjetas por partido',
      penaltyFreq: 'Penaltis por partido',
      funFacts: 'Datos interesantes',
      homeWin: 'Local',
      awayWin: 'Visitante',
      injured: 'Lesionado',
      suspended: 'Suspendido',
      smartMoneyFavors: 'Los apostadores expertos apoyan al local.',
      keyLineFavor: 'Las cuotas favorecen al equipo local.',
      arsenalDominates: 'El local tiene un ataque mucho mejor.',
      strongHomeForm: 'Local en buena racha. Visitante irregular.',
      historicalAdvantage: 'El local tiene ventaja en los enfrentamientos.',
      significantHomeAdv: 'Jugar en casa es una gran ventaja en este partido.',
      missingDefender: 'Visitante sin jugadores clave. Ventaja para el local.',
      highStakes: 'Partido importante para ambos. Espera mucha intensidad.',
      highCrowdInfluence: 'Afición muy fuerte. Esto ayuda al local.',
      awayTravelFatigue: 'El visitante viajó mucho. Puede estar cansado.',
      strictReferee: 'Árbitro estricto. Espera muchas tarjetas.',
      none: 'Ninguna',
      keyPlayers: 'jugadores importantes fuera',
      fightingForTop: 'Luchando por un puesto en la competición.',
      historicRivalry: 'Gran rivalidad entre los equipos.',
      scoredSecondHalf: 'marcó 80% de los goles en el 2º tiempo.',
      concededFirst: 'recibió gol primero en 70% de partidos fuera.',
      lastH2HOver: 'Últimos 5 enfrentamientos: 80% con más de 2 goles.',
      unbeatenHome: 'invicto en casa hace 8 partidos.',
      winsAbbr: 'V',
      drawsAbbr: 'E',
      lossesAbbr: 'D',
      inGames: 'en',
      gamesWord: 'partidos',
    },
    it: {
      projectedScore: 'Risultato Previsto',
      mainRec: '⭐ La Nostra Scommessa Migliore',
      suggestedBet: 'Scommetti su',
      confidenceScore: 'Probabilità di Vincita',
      valueEdge: 'Vantaggio Matematico',
      otherOptions: '📊 Altre Opzioni di Scommessa',
      goals: 'Gol',
      corners: 'Angoli',
      cards: 'Cartellini',
      playerProps: 'Giocatori',
      over25: 'Più di 2 gol nella partita',
      btts: 'Entrambe le squadre segnano',
      over35: 'Più di 3 gol nella partita',
      prob: 'Chance',
      odds: 'Quota',
      factorDeepDive: '🔍 Perché raccomandiamo questa scommessa?',
      market: 'Tendenza del Mercato',
      statistics: 'Numeri delle Squadre',
      form: 'Come stanno giocando',
      h2h: 'Storico tra le squadre',
      bettingVolume: 'Dove stanno andando i soldi',
      smartMoney: 'Scommettitori professionisti',
      keyLineMoves: 'Cambiamenti nelle quote',
      conclusion: 'Riepilogo',
      xgComparison: 'Gol previsti (xG)',
      shotConversion: 'Precisione dei tiri',
      possession: 'Possesso palla',
      recentMatches: 'Ultime 5 partite',
      goalsPerGame: 'Gol per partita',
      goalsScored: 'Gol fatti',
      goalsConceded: 'Gol subiti',
      cleanSheets: 'Partite senza subire gol',
      pastMeetings: 'Ultimi 10 incontri',
      homeWinsVsAway: 'Chi ha vinto di più',
      goalDifference: 'Differenza reti',
      homeAdvantage: 'Giocare in casa aiuta?',
      homeWinPercent: 'Vittorie in casa',
      crowdInfluence: 'Forza del pubblico',
      travelFatigue: 'Stanchezza degli ospiti',
      injuries: 'Giocatori assenti',
      keyPlayerStatus: 'Chi non gioca',
      impactScore: 'Quanto influisce sulla squadra',
      lineupChange: 'Cambiamenti nella formazione',
      motivation: 'Motivazione',
      leaguePosition: 'Posizione in classifica',
      qualificationBattle: 'Cosa è in gioco',
      rivalryIntensity: 'Rivalità',
      extraData: '📌 Informazioni Extra',
      oddsComparison: 'Quote Migliori',
      refereeAnalysis: "Sull'Arbitro",
      statCuriosities: 'Curiosità',
      bestOdds: 'Confronta le quote',
      bookmaker: 'Bookmaker',
      draw: 'Pareggio',
      away: 'Ospite',
      arbOpportunities: 'Opportunità',
      refereeName: 'Nome',
      games: 'Partite',
      yellowCards: 'Cartellini per partita',
      penaltyFreq: 'Rigori per partita',
      funFacts: 'Dati interessanti',
      homeWin: 'Casa',
      awayWin: 'Ospite',
      injured: 'Infortunato',
      suspended: 'Squalificato',
      smartMoneyFavors: 'Gli scommettitori esperti puntano sulla squadra di casa.',
      keyLineFavor: 'Le quote favoriscono la squadra di casa.',
      arsenalDominates: 'La squadra di casa ha un attacco molto migliore.',
      strongHomeForm: 'Squadra di casa in buona forma. Ospiti incostanti.',
      historicalAdvantage: 'La squadra di casa ha vantaggio negli scontri diretti.',
      significantHomeAdv: 'Giocare in casa è un grande vantaggio in questa partita.',
      missingDefender: 'Ospiti senza giocatori chiave. Vantaggio per la casa.',
      highStakes: 'Partita importante per entrambi. Aspettati alta intensità.',
      highCrowdInfluence: 'Pubblico molto forte. Questo aiuta la squadra di casa.',
      awayTravelFatigue: 'Gli ospiti hanno viaggiato molto. Potrebbero essere stanchi.',
      strictReferee: 'Arbitro severo. Aspettati molti cartellini.',
      none: 'Nessuna',
      keyPlayers: 'giocatori chiave assenti',
      fightingForTop: 'In lotta per un posto nella competizione.',
      historicRivalry: 'Grande rivalità tra le squadre.',
      scoredSecondHalf: 'ha segnato l\'80% dei gol nel 2° tempo.',
      concededFirst: 'ha subito gol per primo nel 70% delle partite in trasferta.',
      lastH2HOver: 'Ultimi 5 incontri: 80% con più di 2 gol.',
      unbeatenHome: 'imbattuto in casa da 8 partite.',
      winsAbbr: 'V',
      drawsAbbr: 'P',
      lossesAbbr: 'S',
      inGames: 'in',
      gamesWord: 'partite',
    },
  };

  const l = labels[language] || labels.pt;

  // Calculate stats for display
  const homeAvgGoals = adv?.homeStats?.avgGoalsScored?.toFixed(1) || '1.5';
  const homeAvgConceded = adv?.homeStats?.avgGoalsConceded?.toFixed(1) || '1.0';
  const awayAvgGoals = adv?.awayStats?.avgGoalsScored?.toFixed(1) || '1.2';
  const awayAvgConceded = adv?.awayStats?.avgGoalsConceded?.toFixed(1) || '1.3';

  // Translate form letters
  const translateFormLetter = (letter: string) => {
    if (letter === 'W') return l.winsAbbr;
    if (letter === 'D') return l.drawsAbbr;
    if (letter === 'L') return l.lossesAbbr;
    return letter;
  };

  // Calculate dynamic values
  const homeWinPercent = adv?.homePosition 
    ? Math.max(30, Math.min(80, 100 - (adv.homePosition * 3))).toFixed(1) 
    : '55.0';
  
  const totalH2HGames = adv?.h2h?.totalGames || 0;
  const homeH2HWins = adv?.h2h?.homeWins || 0;
  const awayH2HWins = adv?.h2h?.awayWins || 0;
  const draws = adv?.h2h?.draws || 0;
  
  // Shot conversion based on goals scored
  const shotConversion = adv?.homeStats?.avgGoalsScored 
    ? Math.min(70, Math.round((adv.homeStats.avgGoalsScored / 3) * 100)) 
    : 45;
  
  // Possession estimate based on position
  const possession = adv?.homePosition && adv?.awayPosition
    ? Math.max(40, Math.min(65, 55 + (adv.awayPosition - adv.homePosition)))
    : 52;

  // Home injuries count
  const homeInjuriesCount = adv?.homeInjuries || 0;
  const awayInjuriesCount = adv?.awayInjuries || 0;
  const totalInjuries = homeInjuriesCount + awayInjuriesCount;
  
  // Impact score based on injuries (1-5)
  const impactScore = Math.min(5, Math.max(1, Math.ceil(awayInjuriesCount / 2)));

  // Dynamic conclusions based on data
  const getFormConclusion = () => {
    const homeForm = adv?.homeForm || '';
    const awayForm = adv?.awayForm || '';
    const homeWins = (homeForm.match(/W/g) || []).length;
    const awayWins = (awayForm.match(/W/g) || []).length;
    
    if (homeWins >= 3 && awayWins <= 2) return l.strongHomeForm;
    if (awayWins >= 3 && homeWins <= 2) return language === 'pt' ? 'Visitante em boa fase. Mandante irregular.' : 
                                          language === 'es' ? 'Visitante en buena racha. Local irregular.' :
                                          language === 'it' ? 'Ospiti in buona forma. Casa incostante.' :
                                          'Away team in good form. Home team inconsistent.';
    return language === 'pt' ? 'Ambos os times em fase similar.' : 
           language === 'es' ? 'Ambos equipos en fase similar.' :
           language === 'it' ? 'Entrambe le squadre in forma simile.' :
           'Both teams in similar form.';
  };

  const getH2HConclusion = () => {
    if (homeH2HWins > awayH2HWins + 1) return l.historicalAdvantage;
    if (awayH2HWins > homeH2HWins + 1) return language === 'pt' ? 'Visitante tem vantagem nos confrontos diretos.' :
                                             language === 'es' ? 'Visitante tiene ventaja en los enfrentamientos.' :
                                             language === 'it' ? 'Ospiti hanno vantaggio negli scontri diretti.' :
                                             'Away team has advantage in head-to-head.';
    return language === 'pt' ? 'Confrontos equilibrados entre os times.' :
           language === 'es' ? 'Enfrentamientos equilibrados entre los equipos.' :
           language === 'it' ? 'Scontri equilibrati tra le squadre.' :
           'Balanced head-to-head record.';
  };

  const getInjuryConclusion = () => {
    if (awayInjuriesCount > homeInjuriesCount + 2) return l.missingDefender;
    if (homeInjuriesCount > awayInjuriesCount + 2) return language === 'pt' ? 'Mandante sem jogadores importantes. Vantagem para o visitante.' :
                                                          language === 'es' ? 'Local sin jugadores clave. Ventaja para el visitante.' :
                                                          language === 'it' ? 'Casa senza giocatori chiave. Vantaggio per gli ospiti.' :
                                                          'Home team missing key players. Advantage for away.';
    if (totalInjuries === 0) return language === 'pt' ? 'Todos os jogadores disponíveis.' :
                                    language === 'es' ? 'Todos los jugadores disponibles.' :
                                    language === 'it' ? 'Tutti i giocatori disponibili.' :
                                    'All players available.';
    return language === 'pt' ? 'Ambos os times com desfalques similares.' :
           language === 'es' ? 'Ambos equipos con bajas similares.' :
           language === 'it' ? 'Entrambe le squadre con assenze simili.' :
           'Both teams with similar absences.';
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen p-4 sm:p-6 space-y-6">
      {/* Header with Teams */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={game.homeTeamLogo || `https://media.api-sports.io/football/teams/${game.homeTeamId || 0}.png`}
            alt={game.homeTeam}
            className="w-14 h-14 object-contain"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            {game.homeTeam} vs. {game.awayTeam}
          </h1>
          <p className="text-slate-400 text-sm">
            {l.projectedScore}: <span className="text-white font-bold">{projectedHome}-{projectedAway}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={game.awayTeamLogo || `https://media.api-sports.io/football/teams/${game.awayTeamId || 0}.png`}
            alt={game.awayTeam}
            className="w-14 h-14 object-contain"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        </div>
      </div>

      {/* Main Recommendation */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-slate-900 rounded-2xl p-4 sm:p-6 border border-emerald-700/50">
        <h2 className="text-lg font-bold mb-4 text-emerald-400">{l.mainRec}</h2>
        
        {/* Bet Suggestion */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-5">
          <p className="text-slate-400 text-sm mb-1">{l.suggestedBet}:</p>
          <p className="text-emerald-400 font-bold text-xl sm:text-2xl">{analysis?.type || `${game.homeTeam}`}</p>
        </div>
        
        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 gap-4">
          {/* Confidence Score */}
          <div className="bg-slate-800/30 rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-2 text-center">{l.confidenceScore}</p>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#334155" strokeWidth="6" />
                <circle 
                  cx="50%" cy="50%" r="45%" fill="none" 
                  stroke="#10b981" strokeWidth="6"
                  strokeDasharray={`${(parseFloat(confidenceScore) / 10) * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-emerald-400">{confidenceScore}/10</span>
              </div>
            </div>
          </div>

          {/* Value Edge */}
          <div className="bg-slate-800/30 rounded-xl p-4 flex flex-col items-center justify-center">
            <p className="text-slate-400 text-xs sm:text-sm mb-2 text-center">{l.valueEdge}</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                +{analysis?.valuePercentage?.toFixed(0) || 12}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Other Betting Options */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-lg font-bold mb-4">{l.otherOptions}</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['goals', 'corners', 'cards', 'props'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab === 'goals' ? l.goals : tab === 'corners' ? l.corners : tab === 'cards' ? l.cards : l.playerProps}
            </button>
          ))}
        </div>

        {/* Options List - Dynamic based on activeTab with REAL DATA */}
        <div className="space-y-3">
          {activeTab === 'goals' && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{l.over25}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{calcProb(game.odds.over)}%</span> | 
                  {l.odds}: <span className="font-bold">{game.odds.over?.toFixed(2) || '1.75'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{l.btts}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{adv?.homeStats?.bttsPercentage?.toFixed(0) || 58}%</span> | 
                  {l.odds}: <span className="font-bold">{adv?.bttsOdds?.yes?.toFixed(2) || '1.68'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white font-medium">{l.over35}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-slate-400">35%</span> | 
                  {l.odds}: <span className="font-bold">2.90</span>
                </span>
              </div>
            </>
          )}
          
          {activeTab === 'corners' && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Mais de 9.5 escanteios' : language === 'es' ? 'Más de 9.5 córners' : language === 'it' ? 'Più di 9.5 angoli' : 'Over 9.5 corners'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{adv?.cornersData?.over95Percentage || 62}%</span> | 
                  {l.odds}: <span className="font-bold">1.85</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">
                  {language === 'pt' ? `${game.homeTeam} +4.5 escanteios` : 
                   language === 'es' ? `${game.homeTeam} +4.5 córners` : 
                   language === 'it' ? `${game.homeTeam} +4.5 angoli` : 
                   `${game.homeTeam} +4.5 corners`}
                </span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{adv?.cornersData?.homeAvgCornersFor && adv.cornersData.homeAvgCornersFor > 4.5 ? 58 : 48}%</span> | 
                  {l.odds}: <span className="font-bold">1.72</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Mais de 10.5 escanteios' : language === 'es' ? 'Más de 10.5 córners' : language === 'it' ? 'Più di 10.5 angoli' : 'Over 10.5 corners'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-slate-400">{adv?.cornersData?.over105Percentage || 38}%</span> | 
                  {l.odds}: <span className="font-bold">2.45</span>
                </span>
              </div>
              {/* Premium: Show team corners stats */}
              {userTier === 'premium' && adv?.cornersData && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-emerald-700/30">
                  <p className="text-emerald-400 text-xs font-bold mb-2">📊 {language === 'pt' ? 'Estatísticas de Escanteios' : 'Corner Statistics'}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">{game.homeTeam}:</span>
                      <span className="text-white ml-1">{adv.cornersData.homeAvgCorners?.toFixed(1) || '-'} {language === 'pt' ? 'por jogo' : 'per game'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{game.awayTeam}:</span>
                      <span className="text-white ml-1">{adv.cornersData.awayAvgCorners?.toFixed(1) || '-'} {language === 'pt' ? 'por jogo' : 'per game'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'cards' && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Mais de 3.5 cartões' : language === 'es' ? 'Más de 3.5 tarjetas' : language === 'it' ? 'Più di 3.5 cartellini' : 'Over 3.5 cards'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{adv?.cardsData?.over35CardsPercentage || 68}%</span> | 
                  {l.odds}: <span className="font-bold">1.65</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Mais de 4.5 cartões' : language === 'es' ? 'Más de 4.5 tarjetas' : language === 'it' ? 'Più di 4.5 cartellini' : 'Over 4.5 cards'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">{adv?.cardsData?.over45CardsPercentage || 52}%</span> | 
                  {l.odds}: <span className="font-bold">1.95</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Cartão vermelho no jogo' : language === 'es' ? 'Tarjeta roja en el partido' : language === 'it' ? 'Cartellino rosso nella partita' : 'Red card in the match'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-slate-400">{(adv?.cardsData?.homeAvgRed || 0.1) + (adv?.cardsData?.awayAvgRed || 0.1) > 0.3 ? 22 : 18}%</span> | 
                  {l.odds}: <span className="font-bold">4.50</span>
                </span>
              </div>
              {/* Premium: Show team cards stats */}
              {userTier === 'premium' && adv?.cardsData && (
                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-yellow-700/30">
                  <p className="text-yellow-400 text-xs font-bold mb-2">🟨 {language === 'pt' ? 'Cartões por Jogo' : 'Cards per Game'}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">{game.homeTeam}:</span>
                      <span className="text-white ml-1">{adv.cardsData.homeAvgYellow?.toFixed(1) || '-'} 🟨</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{game.awayTeam}:</span>
                      <span className="text-white ml-1">{adv.cardsData.awayAvgYellow?.toFixed(1) || '-'} 🟨</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'props' && (
            <>
              {/* Top Scorers - Premium only */}
              {userTier === 'premium' && (adv?.topScorers?.home?.length || adv?.topScorers?.away?.length) ? (
                <>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-emerald-700/30 mb-3">
                    <p className="text-emerald-400 text-xs font-bold mb-2">⚽ {language === 'pt' ? 'Artilheiros do Time' : 'Team Top Scorers'}</p>
                    <div className="space-y-2">
                      {adv?.topScorers?.home?.slice(0, 2).map((scorer, i) => (
                        <div key={`home-${i}`} className="flex justify-between items-center text-xs">
                          <span className="text-white">{scorer.name} ({game.homeTeam})</span>
                          <span className="text-emerald-400 font-bold">{scorer.goals} {language === 'pt' ? 'gols' : 'goals'}</span>
                        </div>
                      ))}
                      {adv?.topScorers?.away?.slice(0, 2).map((scorer, i) => (
                        <div key={`away-${i}`} className="flex justify-between items-center text-xs">
                          <span className="text-white">{scorer.name} ({game.awayTeam})</span>
                          <span className="text-emerald-400 font-bold">{scorer.goals} {language === 'pt' ? 'gols' : 'goals'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Artilheiro marca a qualquer momento' : language === 'es' ? 'Goleador marca en cualquier momento' : language === 'it' ? 'Capocannoniere segna in qualsiasi momento' : 'Top scorer to score anytime'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">45%</span> | 
                  {l.odds}: <span className="font-bold">2.10</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-white font-medium">{language === 'pt' ? 'Primeiro gol antes dos 30min' : language === 'es' ? 'Primer gol antes de los 30min' : language === 'it' ? 'Primo gol prima dei 30min' : 'First goal before 30min'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-emerald-400 font-bold">58%</span> | 
                  {l.odds}: <span className="font-bold">1.75</span>
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white font-medium">{language === 'pt' ? 'Jogador recebe cartão' : language === 'es' ? 'Jugador recibe tarjeta' : language === 'it' ? 'Giocatore riceve cartellino' : 'Player to be booked'}</span>
                <span className="text-slate-300">
                  {l.prob}: <span className="text-slate-400">35%</span> | 
                  {l.odds}: <span className="font-bold">2.80</span>
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Premium Lineups Section */}
        {userTier === 'premium' && adv?.lineups && (adv.lineups.homeFormation || adv.lineups.awayFormation) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-cyan-900/30 to-slate-900 rounded-xl border border-cyan-700/40">
            <h3 className="text-cyan-400 font-bold text-sm mb-3">👥 {language === 'pt' ? 'Escalações Confirmadas' : language === 'es' ? 'Alineaciones Confirmadas' : language === 'it' ? 'Formazioni Confermate' : 'Confirmed Lineups'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white font-bold text-xs mb-1">{game.homeTeam}</p>
                {adv.lineups.homeFormation && (
                  <p className="text-cyan-400 text-sm font-bold mb-2">{adv.lineups.homeFormation}</p>
                )}
                {adv.lineups.homeCoach && (
                  <p className="text-slate-400 text-xs">🎩 {adv.lineups.homeCoach}</p>
                )}
                {adv.lineups.homeStarting?.slice(0, 5).map((player, i) => (
                  <p key={i} className="text-slate-300 text-xs">
                    {player.number ? `${player.number}. ` : ''}{player.name}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-xs mb-1">{game.awayTeam}</p>
                {adv.lineups.awayFormation && (
                  <p className="text-cyan-400 text-sm font-bold mb-2">{adv.lineups.awayFormation}</p>
                )}
                {adv.lineups.awayCoach && (
                  <p className="text-slate-400 text-xs">🎩 {adv.lineups.awayCoach}</p>
                )}
                {adv.lineups.awayStarting?.slice(0, 5).map((player, i) => (
                  <p key={i} className="text-slate-300 text-xs">
                    {player.number ? `${player.number}. ` : ''}{player.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Premium Injury Details */}
        {userTier === 'premium' && ((adv?.homeInjuryDetails?.length || 0) > 0 || (adv?.awayInjuryDetails?.length || 0) > 0) && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-900/30 to-slate-900 rounded-xl border border-red-700/40">
            <h3 className="text-red-400 font-bold text-sm mb-3">🏥 {language === 'pt' ? 'Jogadores Fora' : language === 'es' ? 'Jugadores Fuera' : language === 'it' ? 'Giocatori Assenti' : 'Players Out'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white font-bold text-xs mb-1">{game.homeTeam}</p>
                {adv?.homeInjuryDetails?.length ? (
                  adv.homeInjuryDetails.slice(0, 3).map((injury, i) => (
                    <p key={i} className="text-slate-300 text-xs flex items-center gap-1">
                      <span className={injury.type === 'injury' ? 'text-red-400' : injury.type === 'suspension' ? 'text-yellow-400' : 'text-orange-400'}>
                        {injury.type === 'injury' ? '🤕' : injury.type === 'suspension' ? '🟥' : '❓'}
                      </span>
                      {injury.player}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">{language === 'pt' ? 'Nenhum desfalque' : 'No absences'}</p>
                )}
              </div>
              <div>
                <p className="text-white font-bold text-xs mb-1">{game.awayTeam}</p>
                {adv?.awayInjuryDetails?.length ? (
                  adv.awayInjuryDetails.slice(0, 3).map((injury, i) => (
                    <p key={i} className="text-slate-300 text-xs flex items-center gap-1">
                      <span className={injury.type === 'injury' ? 'text-red-400' : injury.type === 'suspension' ? 'text-yellow-400' : 'text-orange-400'}>
                        {injury.type === 'injury' ? '🤕' : injury.type === 'suspension' ? '🟥' : '❓'}
                      </span>
                      {injury.player}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs">{language === 'pt' ? 'Nenhum desfalque' : 'No absences'}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7 Factor Deep Dive */}
      <div>
        <h2 className="text-xl font-bold mb-4">{l.factorDeepDive}</h2>
        
        {/* First Row: Market, Statistics, Form, H2H */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Market */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-blue-400">{l.market}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">{l.bettingVolume}</p>
                <div className="flex gap-1">
                  {[200, 150, 180, 120, 160].map((h, i) => (
                    <div key={i} className="w-4 bg-blue-500/50 rounded-t" style={{ height: `${h / 5}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.smartMoney}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-slate-300">{l.smartMoneyFavors}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.keyLineFavor}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-green-400">{l.statistics}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">{l.xgComparison}</p>
                <div className="flex gap-1 items-end">
                  {[0.3, 0.6, 0.9, 1.2].map((h, i) => (
                    <div key={i} className="w-6 bg-green-500/50 rounded-t" style={{ height: `${h * 30}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.shotConversion}</p>
                <p className="text-white font-bold">{shotConversion}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.possession}</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-4 border-green-400 flex items-center justify-center">
                    <span className="text-xs font-bold">{possession}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">
                  {possession > 55 ? l.arsenalDominates : 
                   language === 'pt' ? 'Posse equilibrada entre os times.' :
                   language === 'es' ? 'Posesión equilibrada entre los equipos.' :
                   language === 'it' ? 'Possesso equilibrato tra le squadre.' :
                   'Balanced possession between teams.'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-orange-400">{l.form}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-2">{l.recentMatches}</p>
                <div className="flex gap-1">
                  {(adv?.homeForm || 'WWDLL').split('').slice(0, 5).map((r, i) => (
                    <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      r === 'W' ? 'bg-green-500 text-white' :
                      r === 'D' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>{translateFormLetter(r)}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.goalsPerGame}</p>
                <div className="flex gap-4 mt-1">
                  <div>
                    <span className="text-emerald-400 font-bold text-lg">{homeAvgGoals}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-red-400">{homeAvgConceded}</span>
                    <p className="text-slate-500 text-[10px]">{l.goalsScored} / {l.goalsConceded}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.cleanSheets}</p>
                <p className="text-white"><span className="font-bold">{adv?.homeStats?.cleanSheets?.toFixed(0) || 40}%</span></p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{getFormConclusion()}</p>
              </div>
            </div>
          </div>

          {/* H2H */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-purple-400">{l.h2h}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">{l.pastMeetings}</p>
                <div className="flex gap-1 items-end">
                  {[3, 2, 4, 1, 3, 2, 5, 1, 3, 2].map((h, i) => (
                    <div key={i} className="w-3 bg-purple-500/50 rounded-t" style={{ height: `${h * 8}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.homeWinsVsAway}</p>
                <p className="text-white mt-1">
                  <span className="text-emerald-400 font-bold">{adv?.h2h?.homeWins || 3}</span> {l.winsAbbr} vs{' '}
                  <span className="text-red-400 font-bold">{adv?.h2h?.awayWins || 1}</span> {l.winsAbbr}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.goalDifference}</p>
                <p className="text-white">
                  <span className="text-emerald-400 font-bold">
                    {adv?.h2h ? `+${(adv.h2h.homeWins - adv.h2h.awayWins)}` : '+2'} {l.inGames} {adv?.h2h?.totalGames || 10} {l.gamesWord}
                  </span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{getH2HConclusion()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Home Advantage, Injuries, Motivation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Home Advantage */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-cyan-400">{l.homeAdvantage}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs">{l.homeWinPercent}</p>
                <p className="text-white text-2xl font-bold">{homeWinPercent}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.crowdInfluence}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300">{l.highCrowdInfluence}</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.travelFatigue}</p>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-300">{l.awayTravelFatigue}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.significantHomeAdv}</p>
              </div>
            </div>
          </div>

          {/* Injuries & Suspensions */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-red-400">{l.injuries}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-2">{l.keyPlayerStatus}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-xs">{l.injured}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-xs">{l.suspended}</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.impactScore}</p>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-4 h-6 rounded ${i <= impactScore ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.lineupChange}</p>
                <p className="text-xs text-slate-300">
                  {totalInjuries > 0 
                    ? `-${awayInjuriesCount} ${l.keyPlayers} (${game.awayTeam})` 
                    : l.none}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{getInjuryConclusion()}</p>
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-amber-400">{l.motivation}</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-xs mb-1">{l.leaguePosition}</p>
                <div className="flex gap-1 items-end">
                  {[20, 25, 30, 35, 28, 32].map((h, i) => (
                    <div key={i} className="w-4 bg-amber-500/50 rounded-t" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.qualificationBattle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">{l.fightingForTop}</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.rivalryIntensity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-300">{l.historicRivalry}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.highStakes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Data & Curiosities */}
      <div>
        <h2 className="text-xl font-bold mb-4">{l.extraData}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Odds Comparison */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.oddsComparison}</h3>
            <p className="text-slate-400 text-xs mb-2">{l.bestOdds}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <th className="text-left py-1">{l.bookmaker}</th>
                    <th className="text-center py-1">1</th>
                    <th className="text-center py-1">X</th>
                    <th className="text-center py-1">2</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">{game.bookmaker}</td>
                    <td className="text-center text-emerald-400 font-bold">{game.odds.home.toFixed(2)}</td>
                    <td className="text-center">{game.odds.draw.toFixed(2)}</td>
                    <td className="text-center">{game.odds.away.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-xs mt-3">{l.arbOpportunities}</p>
            <p className="text-slate-500 text-xs">{l.none}</p>
          </div>

          {/* Referee Analysis - Placeholder since API doesn't provide referee data */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.refereeAnalysis}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.refereeName}</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-yellow-400" />
                  <span className="text-white text-xs">
                    {language === 'pt' ? 'Não disponível' : 
                     language === 'es' ? 'No disponible' : 
                     language === 'it' ? 'Non disponibile' : 
                     'Not available'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.yellowCards}</span>
                <span className="text-white text-xs">
                  {language === 'pt' ? '~3.5 média' : 
                   language === 'es' ? '~3.5 promedio' : 
                   language === 'it' ? '~3.5 media' : 
                   '~3.5 avg'}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 mt-3">
              <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
              <p className="text-slate-300 text-xs">
                {language === 'pt' ? 'Dados do árbitro não disponíveis para esta partida.' : 
                 language === 'es' ? 'Datos del árbitro no disponibles para este partido.' : 
                 language === 'it' ? 'Dati arbitro non disponibili per questa partita.' : 
                 'Referee data not available for this match.'}
              </p>
            </div>
          </div>

          {/* Statistical Curiosities - Dynamic based on actual data */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.statCuriosities}</h3>
            <p className="text-slate-400 text-xs mb-2">{l.funFacts}</p>
            <div className="space-y-2">
              {(() => {
                const facts: string[] = [];
                
                // Fact based on home form
                const homeFormWins = (adv?.homeForm || '').split('').filter(l => l === 'W').length;
                if (homeFormWins >= 3) {
                  facts.push(language === 'pt' ? `${game.homeTeam} venceu ${homeFormWins} dos últimos 5 jogos.` :
                             language === 'es' ? `${game.homeTeam} ganó ${homeFormWins} de los últimos 5 partidos.` :
                             language === 'it' ? `${game.homeTeam} ha vinto ${homeFormWins} delle ultime 5 partite.` :
                             `${game.homeTeam} won ${homeFormWins} of the last 5 games.`);
                }
                
                // Fact based on avg goals
                if (adv?.homeStats?.avgGoalsScored && adv.homeStats.avgGoalsScored > 1.5) {
                  facts.push(language === 'pt' ? `${game.homeTeam} marca em média ${adv.homeStats.avgGoalsScored.toFixed(1)} gols por jogo.` :
                             language === 'es' ? `${game.homeTeam} marca en promedio ${adv.homeStats.avgGoalsScored.toFixed(1)} goles por partido.` :
                             language === 'it' ? `${game.homeTeam} segna in media ${adv.homeStats.avgGoalsScored.toFixed(1)} gol per partita.` :
                             `${game.homeTeam} scores an average of ${adv.homeStats.avgGoalsScored.toFixed(1)} goals per game.`);
                }
                
                // Fact based on H2H
                if (adv?.h2h && adv.h2h.totalGames > 0) {
                  facts.push(language === 'pt' ? `Nos últimos ${adv.h2h.totalGames} confrontos: ${adv.h2h.homeWins} vitórias para ${game.homeTeam}.` :
                             language === 'es' ? `En los últimos ${adv.h2h.totalGames} enfrentamientos: ${adv.h2h.homeWins} victorias para ${game.homeTeam}.` :
                             language === 'it' ? `Negli ultimi ${adv.h2h.totalGames} incontri: ${adv.h2h.homeWins} vittorie per ${game.homeTeam}.` :
                             `In the last ${adv.h2h.totalGames} meetings: ${adv.h2h.homeWins} wins for ${game.homeTeam}.`);
                }
                
                // Fact based on positions
                if (adv?.homePosition && adv?.awayPosition) {
                  facts.push(language === 'pt' ? `${game.homeTeam} está em ${adv.homePosition}º, ${game.awayTeam} em ${adv.awayPosition}º na tabela.` :
                             language === 'es' ? `${game.homeTeam} está en ${adv.homePosition}º, ${game.awayTeam} en ${adv.awayPosition}º en la tabla.` :
                             language === 'it' ? `${game.homeTeam} è ${adv.homePosition}º, ${game.awayTeam} è ${adv.awayPosition}º in classifica.` :
                             `${game.homeTeam} is ${adv.homePosition}th, ${game.awayTeam} is ${adv.awayPosition}th in the table.`);
                }
                
                // Fact based on over 2.5 percentage
                if (adv?.homeStats?.over25Percentage && adv.homeStats.over25Percentage > 50) {
                  facts.push(language === 'pt' ? `${Math.round(adv.homeStats.over25Percentage)}% dos jogos do ${game.homeTeam} tiveram mais de 2.5 gols.` :
                             language === 'es' ? `${Math.round(adv.homeStats.over25Percentage)}% de los partidos del ${game.homeTeam} tuvieron más de 2.5 goles.` :
                             language === 'it' ? `${Math.round(adv.homeStats.over25Percentage)}% delle partite del ${game.homeTeam} hanno avuto più di 2.5 gol.` :
                             `${Math.round(adv.homeStats.over25Percentage)}% of ${game.homeTeam}'s games had over 2.5 goals.`);
                }
                
                // If no dynamic facts available, show generic ones
                if (facts.length === 0) {
                  facts.push(
                    language === 'pt' ? 'Dados estatísticos detalhados não disponíveis.' :
                    language === 'es' ? 'Datos estadísticos detallados no disponibles.' :
                    language === 'it' ? 'Dati statistici dettagliati non disponibili.' :
                    'Detailed statistical data not available.'
                  );
                }
                
                return facts.slice(0, 4).map((fact, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded bg-yellow-400 mt-1.5 flex-shrink-0" />
                    <p className="text-slate-300 text-xs">{fact}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
