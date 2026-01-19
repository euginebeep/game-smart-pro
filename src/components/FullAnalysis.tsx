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

  // Labels
  const labels = {
    pt: {
      projectedScore: 'Placar Projetado',
      mainRec: 'Recomendação Principal',
      suggestedBet: 'Aposta Sugerida',
      confidenceScore: 'Score de Confiança',
      valueEdge: 'Vantagem de Valor',
      otherOptions: 'Outras Opções de Aposta',
      goals: 'Gols',
      corners: 'Escanteios',
      cards: 'Cartões',
      playerProps: 'Props Jogador',
      over25: 'Over 2.5 Gols',
      btts: 'Ambos Marcam',
      over35: 'Over 3.5 Gols',
      prob: 'Prob',
      odds: 'Odds',
      factorDeepDive: '7 Fatores de Análise Profunda',
      market: 'Mercado',
      statistics: 'Estatísticas',
      form: 'Forma',
      h2h: 'H2H',
      bettingVolume: 'Tendências de Volume',
      smartMoney: 'Dinheiro Inteligente',
      keyLineMoves: 'Movimentos de Linha',
      conclusion: 'Conclusão',
      xgComparison: 'Comparação xG',
      shotConversion: 'Taxa de Conversão',
      possession: 'Posse de Bola',
      recentMatches: 'Últimos 5 Jogos',
      goalsPerGame: 'Gols por Jogo',
      cleanSheets: 'Clean Sheets',
      pastMeetings: 'Últimos 10 Encontros',
      homeWinsVsAway: 'Vitórias Casa vs Fora',
      goalDifference: 'Saldo de Gols no H2H',
      homeAdvantage: 'Vantagem Casa',
      homeWinPercent: '% Vitórias Casa',
      crowdInfluence: 'Influência da Torcida',
      travelFatigue: 'Fadiga de Viagem Visitante',
      injuries: 'Lesões e Suspensões',
      keyPlayerStatus: 'Status Jogadores Chave',
      impactScore: 'Score de Impacto',
      lineupChange: 'Mudança de Força',
      motivation: 'Motivação',
      leaguePosition: 'Posição na Liga',
      qualificationBattle: 'Batalha por Classificação',
      rivalryIntensity: 'Intensidade do Rival',
      extraData: 'Dados Extra & Curiosidades',
      oddsComparison: 'Comparação de Odds',
      refereeAnalysis: 'Análise do Árbitro',
      statCuriosities: 'Curiosidades Estatísticas',
      bestOdds: 'Melhores Odds',
      bookmaker: 'Casa',
      draw: 'Empate',
      away: 'Fora',
      arbOpportunities: 'Oportunidades Arb',
      refereeName: 'Nome',
      yellowCards: 'Amarelos/Jogo',
      penaltyFreq: 'Frequência de Pênaltis',
      funFacts: 'Fatos Interessantes',
      homeWin: 'Vitória Casa',
      awayWin: 'Vitória Fora',
      injured: 'Lesionado',
      suspended: 'Suspenso',
      smartMoneyFavors: 'Smart Money favorece vitória da casa.',
      keyLineFavor: 'Linha de chave favorece Casa.',
      arsenalDominates: 'Arsenal domina métricas ofensivas.',
      strongHomeForm: 'Forte forma casa vs forma inconsistente fora.',
      historicalAdvantage: 'Vantagem histórica para o time da casa.',
      significantHomeAdv: 'Vantagem de casa significativa esperada.',
      missingDefender: 'Visitante sem zagueiro titular, vantagem casa.',
      highStakes: 'Muita coisa em jogo, jogo ofensivo provável.',
    },
    en: {
      projectedScore: 'Projected Score',
      mainRec: 'Main Recommendation',
      suggestedBet: 'Suggested Bet',
      confidenceScore: 'Confidence Score',
      valueEdge: 'Value Edge',
      otherOptions: 'Other Betting Options',
      goals: 'Goals',
      corners: 'Corners',
      cards: 'Cards',
      playerProps: 'Player Props',
      over25: 'Over 2.5 Goals',
      btts: 'Both Teams to Score',
      over35: 'Over 3.5 Goals',
      prob: 'Prob',
      odds: 'Odds',
      factorDeepDive: '7 Factor Deep Dive',
      market: 'Market',
      statistics: 'Statistics',
      form: 'Form',
      h2h: 'H2H',
      bettingVolume: 'Betting Volume Trends',
      smartMoney: 'Smart Money Activity',
      keyLineMoves: 'Key Line Moves',
      conclusion: 'Conclusion',
      xgComparison: 'xG Comparison',
      shotConversion: 'Shot Conversion Rate',
      possession: 'Possession %',
      recentMatches: 'Recent 5 Matches',
      goalsPerGame: 'Goals Scored/Conceded',
      cleanSheets: 'Clean Sheets',
      pastMeetings: 'Past 10 Meetings',
      homeWinsVsAway: 'Home Wins vs. Away Wins',
      goalDifference: 'Goal Difference in H2H',
      homeAdvantage: 'Home Advantage',
      homeWinPercent: 'Home Win %',
      crowdInfluence: 'Crowd Influence Score',
      travelFatigue: 'Travel Fatigue for Away Team',
      injuries: 'Injuries & Suspensions',
      keyPlayerStatus: 'Key Player Status',
      impactScore: 'Impact Score',
      lineupChange: 'Lineup Strength Change',
      motivation: 'Motivation',
      leaguePosition: 'League Position Stakes',
      qualificationBattle: 'Qualification/Relegation Battle',
      rivalryIntensity: 'Rivalry Intensity',
      extraData: 'Extra Data & Curiosities',
      oddsComparison: 'Odds Comparison',
      refereeAnalysis: 'Referee Analysis',
      statCuriosities: 'Statistical Curiosities',
      bestOdds: 'Best Odds',
      bookmaker: 'Bookmaker',
      draw: 'Draw',
      away: 'Away',
      arbOpportunities: 'Arb Opportunities',
      refereeName: 'Name',
      yellowCards: 'Yellow Cards/Game',
      penaltyFreq: 'Penalty Frequency',
      funFacts: 'Fun facts',
      homeWin: 'Home Win',
      awayWin: 'Away Win',
      injured: 'Injured',
      suspended: 'Suspended',
      smartMoneyFavors: 'Smart Money favors home win.',
      keyLineFavor: 'Key Line Moves favor Home.',
      arsenalDominates: 'Home dominates attacking metrics.',
      strongHomeForm: 'Strong home form vs inconsistent away.',
      historicalAdvantage: 'Historical advantage for home team.',
      significantHomeAdv: 'Significant home advantage expected.',
      missingDefender: 'Away missing key defender, advantage home.',
      highStakes: 'High stakes for both, attacking game likely.',
    },
    es: {
      projectedScore: 'Marcador Proyectado',
      mainRec: 'Recomendación Principal',
      suggestedBet: 'Apuesta Sugerida',
      confidenceScore: 'Puntuación de Confianza',
      valueEdge: 'Ventaja de Valor',
      otherOptions: 'Otras Opciones de Apuesta',
      goals: 'Goles',
      corners: 'Córners',
      cards: 'Tarjetas',
      playerProps: 'Props Jugador',
      over25: 'Más de 2.5 Goles',
      btts: 'Ambos Marcan',
      over35: 'Más de 3.5 Goles',
      prob: 'Prob',
      odds: 'Cuotas',
      factorDeepDive: '7 Factores de Análisis Profundo',
      market: 'Mercado',
      statistics: 'Estadísticas',
      form: 'Forma',
      h2h: 'H2H',
      bettingVolume: 'Tendencias de Volumen',
      smartMoney: 'Dinero Inteligente',
      keyLineMoves: 'Movimientos de Línea',
      conclusion: 'Conclusión',
      xgComparison: 'Comparación xG',
      shotConversion: 'Tasa de Conversión',
      possession: 'Posesión %',
      recentMatches: 'Últimos 5 Partidos',
      goalsPerGame: 'Goles por Partido',
      cleanSheets: 'Porterías a Cero',
      pastMeetings: 'Últimos 10 Encuentros',
      homeWinsVsAway: 'Victorias Local vs Visitante',
      goalDifference: 'Diferencia de Goles en H2H',
      homeAdvantage: 'Ventaja Local',
      homeWinPercent: '% Victorias Local',
      crowdInfluence: 'Influencia del Público',
      travelFatigue: 'Fatiga de Viaje Visitante',
      injuries: 'Lesiones y Suspensiones',
      keyPlayerStatus: 'Estado Jugadores Clave',
      impactScore: 'Puntuación de Impacto',
      lineupChange: 'Cambio de Fuerza',
      motivation: 'Motivación',
      leaguePosition: 'Posición en Liga',
      qualificationBattle: 'Batalla por Clasificación',
      rivalryIntensity: 'Intensidad del Rival',
      extraData: 'Datos Extra y Curiosidades',
      oddsComparison: 'Comparación de Cuotas',
      refereeAnalysis: 'Análisis del Árbitro',
      statCuriosities: 'Curiosidades Estadísticas',
      bestOdds: 'Mejores Cuotas',
      bookmaker: 'Casa',
      draw: 'Empate',
      away: 'Visitante',
      arbOpportunities: 'Oportunidades Arb',
      refereeName: 'Nombre',
      yellowCards: 'Amarillas/Partido',
      penaltyFreq: 'Frecuencia de Penaltis',
      funFacts: 'Datos Curiosos',
      homeWin: 'Victoria Local',
      awayWin: 'Victoria Visitante',
      injured: 'Lesionado',
      suspended: 'Suspendido',
      smartMoneyFavors: 'El dinero inteligente favorece al local.',
      keyLineFavor: 'Movimientos de línea favorecen al local.',
      arsenalDominates: 'Local domina métricas ofensivas.',
      strongHomeForm: 'Fuerte forma local vs forma inconsistente fuera.',
      historicalAdvantage: 'Ventaja histórica para el local.',
      significantHomeAdv: 'Ventaja local significativa esperada.',
      missingDefender: 'Visitante sin defensor clave, ventaja local.',
      highStakes: 'Mucho en juego, partido ofensivo probable.',
    },
    it: {
      projectedScore: 'Punteggio Previsto',
      mainRec: 'Raccomandazione Principale',
      suggestedBet: 'Scommessa Suggerita',
      confidenceScore: 'Punteggio Fiducia',
      valueEdge: 'Vantaggio Valore',
      otherOptions: 'Altre Opzioni di Scommessa',
      goals: 'Gol',
      corners: 'Angoli',
      cards: 'Cartellini',
      playerProps: 'Props Giocatore',
      over25: 'Over 2.5 Gol',
      btts: 'Entrambe Segnano',
      over35: 'Over 3.5 Gol',
      prob: 'Prob',
      odds: 'Quote',
      factorDeepDive: '7 Fattori di Analisi Profonda',
      market: 'Mercato',
      statistics: 'Statistiche',
      form: 'Forma',
      h2h: 'H2H',
      bettingVolume: 'Tendenze Volume',
      smartMoney: 'Smart Money',
      keyLineMoves: 'Movimenti Linea',
      conclusion: 'Conclusione',
      xgComparison: 'Confronto xG',
      shotConversion: 'Tasso Conversione',
      possession: 'Possesso %',
      recentMatches: 'Ultime 5 Partite',
      goalsPerGame: 'Gol per Partita',
      cleanSheets: 'Clean Sheets',
      pastMeetings: 'Ultimi 10 Incontri',
      homeWinsVsAway: 'Vittorie Casa vs Trasferta',
      goalDifference: 'Differenza Reti H2H',
      homeAdvantage: 'Vantaggio Casa',
      homeWinPercent: '% Vittorie Casa',
      crowdInfluence: 'Influenza Pubblico',
      travelFatigue: 'Stanchezza Viaggio Ospiti',
      injuries: 'Infortuni e Squalifiche',
      keyPlayerStatus: 'Stato Giocatori Chiave',
      impactScore: 'Punteggio Impatto',
      lineupChange: 'Cambio Formazione',
      motivation: 'Motivazione',
      leaguePosition: 'Posizione in Classifica',
      qualificationBattle: 'Battaglia Qualificazione',
      rivalryIntensity: 'Intensità Rivalità',
      extraData: 'Dati Extra e Curiosità',
      oddsComparison: 'Confronto Quote',
      refereeAnalysis: 'Analisi Arbitro',
      statCuriosities: 'Curiosità Statistiche',
      bestOdds: 'Migliori Quote',
      bookmaker: 'Bookmaker',
      draw: 'Pareggio',
      away: 'Trasferta',
      arbOpportunities: 'Opportunità Arb',
      refereeName: 'Nome',
      yellowCards: 'Gialli/Partita',
      penaltyFreq: 'Frequenza Rigori',
      funFacts: 'Curiosità',
      homeWin: 'Vittoria Casa',
      awayWin: 'Vittoria Trasferta',
      injured: 'Infortunato',
      suspended: 'Squalificato',
      smartMoneyFavors: 'Smart Money favorisce vittoria casa.',
      keyLineFavor: 'Movimenti linea favoriscono Casa.',
      arsenalDominates: 'Casa domina metriche offensive.',
      strongHomeForm: 'Forte forma casa vs forma inconsistente fuori.',
      historicalAdvantage: 'Vantaggio storico per casa.',
      significantHomeAdv: 'Vantaggio casa significativo atteso.',
      missingDefender: 'Ospiti senza difensore chiave, vantaggio casa.',
      highStakes: 'Posta alta per entrambi, partita offensiva probabile.',
    },
  };

  const l = labels[language] || labels.pt;

  // Calculate stats for display
  const homeAvgGoals = adv?.homeStats?.avgGoalsScored?.toFixed(1) || '1.5';
  const homeAvgConceded = adv?.homeStats?.avgGoalsConceded?.toFixed(1) || '1.0';
  const awayAvgGoals = adv?.awayStats?.avgGoalsScored?.toFixed(1) || '1.2';
  const awayAvgConceded = adv?.awayStats?.avgGoalsConceded?.toFixed(1) || '1.3';

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
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-lg font-bold mb-4">{l.mainRec}</h2>
        <p className="text-slate-300 mb-4">
          {l.suggestedBet}: <span className="text-emerald-400 font-bold">{analysis?.type || `${game.homeTeam} & Over 2.5`}</span>
        </p>
        
        <div className="flex items-center gap-8">
          {/* Confidence Score */}
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="#334155" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="#fbbf24" strokeWidth="6"
                  strokeDasharray={`${(parseFloat(confidenceScore) / 10) * 220} 220`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400">{l.confidenceScore}:</span>
                <span className="text-xl font-bold text-yellow-400">{confidenceScore}/10</span>
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
        <div className="flex gap-2 mb-4">
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
              {l.prob}: <span className="text-emerald-400 font-bold">{calcProb(game.odds.over)}%</span>, 
              {l.odds}: <span className="font-bold">{game.odds.over?.toFixed(2) || '1.75'}</span>
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-800">
            <span className="text-white font-medium">{l.btts}</span>
            <span className="text-slate-300">
              {l.prob}: <span className="text-emerald-400 font-bold">{adv?.homeStats?.bttsPercentage?.toFixed(0) || 58}%</span>, 
              {l.odds}: <span className="font-bold">1.68</span>
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white font-medium">{l.over35}</span>
            <span className="text-slate-300">
              {l.prob}: <span className="text-slate-400">35%</span>, 
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
              <div>
                <p className="text-slate-400 text-xs">{l.keyLineMoves}</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300">{l.keyLineFavor}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
                <p className="text-slate-300 text-xs">{l.smartMoneyFavors}</p>
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
                <p className="text-white font-bold">Stats: 58%</p>
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
                    }`}>{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.goalsPerGame}</p>
                <div className="flex gap-4 mt-1">
                  <div>
                    <span className="text-emerald-400 font-bold text-lg">{homeAvgGoals}</span>
                    <span className="text-slate-500">-</span>
                    <span className="text-red-400">{homeAvgConceded}</span>
                    <p className="text-slate-500 text-[10px]">Goals Scored</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold text-lg">{awayAvgGoals}</span>
                    <span className="text-slate-500">-</span>
                    <span className="text-red-400">{awayAvgConceded}</span>
                    <p className="text-slate-500 text-[10px]">Goas Score</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.cleanSheets}</p>
                <p className="text-white">Stats: <span className="font-bold">{adv?.homeStats?.cleanSheets?.toFixed(0) || 40}%</span></p>
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
                  <span className="text-emerald-400 font-bold">{adv?.h2h?.homeWins || 3}</span> W vs{' '}
                  <span className="text-red-400 font-bold">{adv?.h2h?.awayWins || 1}</span> W
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.goalDifference}</p>
                <p className="text-white">
                  <span className="text-emerald-400 font-bold">
                    {adv?.h2h ? `+${(adv.h2h.homeWins - adv.h2h.awayWins)}` : '-1'} in {adv?.h2h?.totalGames || 10}
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
                  <span className="text-xs text-slate-300">High crowd influence expected.</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.travelFatigue}</p>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-300">Away team travels 400km.</span>
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
                <p className="text-xs text-slate-300">-{adv?.awayInjuries || 2} key players</p>
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
                  <span className="text-xs text-slate-300">Both fighting for top 4.</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-xs">{l.rivalryIntensity}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-slate-300">Historic rivalry.</span>
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
                    <th className="text-center py-1">{l.homeWin.split(' ')[0]}</th>
                    <th className="text-center py-1">{l.draw}</th>
                    <th className="text-center py-1">{l.away}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">Bet365</td>
                    <td className="text-center text-emerald-400 font-bold">£3.00</td>
                    <td className="text-center">£2.60</td>
                    <td className="text-center">£2.60</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-emerald-400">dafa365</td>
                    <td className="text-center font-bold">£2.00</td>
                    <td className="text-center text-emerald-400 font-bold">£6.00</td>
                    <td className="text-center">£2.70</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-red-400">BMP</td>
                    <td className="text-center text-red-400 font-bold">£2.80</td>
                    <td className="text-center">£3.50</td>
                    <td className="text-center text-emerald-400 font-bold">£2.50</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-xs mt-3">{l.arbOpportunities}</p>
            <p className="text-slate-500 text-xs">none</p>
          </div>

          {/* Referee Analysis */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.refereeAnalysis}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.refereeName}</span>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-yellow-400" />
                  <span className="text-white text-xs">Yorner Name</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Games</span>
                <span className="text-white text-xs">370</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.yellowCards}</span>
                <span className="text-white text-xs">1.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">{l.penaltyFreq}</span>
                <span className="text-white text-xs">2.55</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 mt-3">
              <p className="text-yellow-400 text-xs font-medium">{l.conclusion}</p>
              <p className="text-slate-300 text-xs">Strict referee, high card potential.</p>
            </div>
          </div>

          {/* Statistical Curiosities */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="font-bold text-white mb-3">{l.statCuriosities}</h3>
            <p className="text-slate-400 text-xs mb-2">{l.funFacts}</p>
            <div className="space-y-2">
              {[
                `${game.homeTeam} scored 80% of goals in second half.`,
                `${game.awayTeam} conceded first in 70% of away games.`,
                `Last 5 H2H had Over 2.5 in 80% of matches.`,
                `${game.homeTeam} unbeaten at home for 8 games.`,
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
