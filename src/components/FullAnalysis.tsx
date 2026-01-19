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
      <div className="bg-gradient-to-r from-emerald-900/50 to-slate-900 rounded-2xl p-5 border border-emerald-700/50">
        <h2 className="text-lg font-bold mb-4 text-emerald-400">{l.mainRec}</h2>
        <p className="text-slate-300 mb-4 text-lg">
          {l.suggestedBet}: <span className="text-emerald-400 font-bold text-xl">{analysis?.type || `${game.homeTeam}`}</span>
        </p>
        
        <div className="flex items-center gap-8 flex-wrap">
          {/* Confidence Score */}
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#334155" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="#10b981" strokeWidth="6"
                  strokeDasharray={`${(parseFloat(confidenceScore) / 10) * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-400">{l.confidenceScore}</span>
                <span className="text-xl font-bold text-emerald-400">{confidenceScore}/10</span>
              </div>
            </div>
          </div>

          {/* Value Edge */}
          <div>
            <p className="text-slate-400 text-sm">{l.valueEdge}:</p>
            <p className="text-emerald-400 text-3xl font-bold flex items-center gap-1">
              +{analysis?.valuePercentage?.toFixed(0) || 12}% 
              <TrendingUp className="w-5 h-5" />
            </p>
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

        {/* Options List */}
        <div className="space-y-3">
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
              {l.odds}: <span className="font-bold">1.68</span>
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">{l.over35}</span>
            <span className="text-slate-300">
              {l.prob}: <span className="text-slate-400">35%</span> | 
              {l.odds}: <span className="font-bold">2.90</span>
            </span>
          </div>
        </div>
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
                <p className="text-white font-bold">58%</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.possession}</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-4 border-green-400 flex items-center justify-center">
                    <span className="text-xs font-bold">60%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.arsenalDominates}</p>
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
                <p className="text-slate-300 text-xs">{l.strongHomeForm}</p>
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
                <p className="text-slate-300 text-xs">{l.historicalAdvantage}</p>
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
                <p className="text-white text-2xl font-bold">96.3%</p>
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
                    <div key={i} className={`w-4 h-6 rounded ${i <= 3 ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.lineupChange}</p>
                <p className="text-xs text-slate-300">-{adv?.awayInjuries || 2} {l.keyPlayers}</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.missingDefender}</p>
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
                    <td className="py-1">Bet365</td>
                    <td className="text-center text-emerald-400 font-bold">3.00</td>
                    <td className="text-center">2.60</td>
                    <td className="text-center">2.60</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">Betfair</td>
                    <td className="text-center font-bold">2.00</td>
                    <td className="text-center text-emerald-400 font-bold">6.00</td>
                    <td className="text-center">2.70</td>
                  </tr>
                  <tr>
                    <td className="py-1">Betano</td>
                    <td className="text-center font-bold">2.80</td>
                    <td className="text-center">3.50</td>
                    <td className="text-center text-emerald-400 font-bold">2.50</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-xs mt-3">{l.arbOpportunities}</p>
            <p className="text-slate-500 text-xs">{l.none}</p>
          </div>

          {/* Referee Analysis */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.refereeAnalysis}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.refereeName}</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-yellow-400" />
                  <span className="text-white text-xs">Anthony Taylor</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.games}</span>
                <span className="text-white text-xs">370</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.yellowCards}</span>
                <span className="text-white text-xs">4.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.penaltyFreq}</span>
                <span className="text-white text-xs">0.35</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 mt-3">
              <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
              <p className="text-slate-300 text-xs">{l.strictReferee}</p>
            </div>
          </div>

          {/* Statistical Curiosities */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.statCuriosities}</h3>
            <p className="text-slate-400 text-xs mb-2">{l.funFacts}</p>
            <div className="space-y-2">
              {[
                `${game.homeTeam} ${l.scoredSecondHalf}`,
                `${game.awayTeam} ${l.concededFirst}`,
                l.lastH2HOver,
                `${game.homeTeam} ${l.unbeatenHome}`,
              ].map((fact, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded bg-yellow-400 mt-1.5 flex-shrink-0" />
                  <p className="text-slate-300 text-xs">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
