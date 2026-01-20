import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Calculator, Database, Cpu, Globe, Zap, Target, TrendingUp, 
  BarChart3, Scale, Shield, AlertCircle, CheckCircle2, Info, Mail
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TechnicalDocsTab() {
  return (
    <Tabs defaultValue="prompts" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="prompts" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Prompts & IA
        </TabsTrigger>
        <TabsTrigger value="calculations" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Lógica de Cálculos
        </TabsTrigger>
        <TabsTrigger value="apis" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          APIs Utilizadas
        </TabsTrigger>
        <TabsTrigger value="ai-gateway" className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Inteligência Artificial
        </TabsTrigger>
      </TabsList>

      {/* Prompts Tab */}
      <TabsContent value="prompts" className="space-y-4">
        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-400" />
              Sistema de Prompts do Eugine
            </CardTitle>
            <CardDescription>
              Como o Eugine processa e analisa os dados para gerar recomendações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivo Principal
                </h4>
                <p className="text-muted-foreground text-sm">
                  O Eugine é um motor de análise matemática que processa dados estatísticos de futebol 
                  para identificar oportunidades de apostas com edge positivo (Value Betting).
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Fluxo de Processamento
                </h4>
                <ol className="text-muted-foreground text-sm space-y-2 list-decimal list-inside">
                  <li>Coleta de dados via API-Football (fixtures, odds, estatísticas)</li>
                  <li>Enriquecimento com dados de H2H, forma, lesões e classificação</li>
                  <li>Cálculo de probabilidades estimadas usando pesos dinâmicos</li>
                  <li>Comparação com odds do mercado para identificar Value</li>
                  <li>Geração de recomendação com score de confiança</li>
                </ol>
              </div>

              {/* FASE 1: COLETA DE DADOS */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-emerald-500/30">
                <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  FASE 1: Coleta de Dados (API-Football)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  O sistema faz chamadas sequenciais com delays de 200-400ms para respeitar rate limits.
                </p>
                <ScrollArea className="h-[320px]">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-black/40 p-3 rounded">
{`// ============= ENDPOINTS CONSULTADOS =============

1. FIXTURES DO DIA
   Endpoint: /fixtures
   Params: { date: "YYYY-MM-DD", timezone: "America/Sao_Paulo" }
   Retorna: Lista de jogos com odds básicas
   → Fonte: https://v3.football.api-sports.io/fixtures

2. CONFRONTOS DIRETOS (H2H)
   Endpoint: /fixtures/headtohead
   Params: { h2h: "{homeTeamId}-{awayTeamId}", last: "10" }
   Retorna: Últimos 10 jogos entre os times
   → Fonte: https://v3.football.api-sports.io/fixtures/headtohead

3. ESTATÍSTICAS DO TIME
   Endpoint: /teams/statistics
   Params: { team: "{teamId}", league: "{leagueId}", season: "{year}" }
   Retorna: Gols, clean sheets, BTTS%, home/away splits
   → Fonte: https://v3.football.api-sports.io/teams/statistics

4. CLASSIFICAÇÃO
   Endpoint: /standings
   Params: { league: "{leagueId}", season: "{year}" }
   Retorna: Posição na tabela e forma (últimos 5 jogos)
   → Fonte: https://v3.football.api-sports.io/standings

5. LESÕES E SUSPENSÕES
   Endpoint: /injuries
   Params: { fixture: "{fixtureId}" }
   Retorna: Jogadores indisponíveis e motivos
   → Fonte: https://v3.football.api-sports.io/injuries

6. PREVISÃO DA API
   Endpoint: /predictions
   Params: { fixture: "{fixtureId}" }
   Retorna: Winner, confidence%, advice, under/over
   → Fonte: https://v3.football.api-sports.io/predictions

7. ESCALAÇÕES (Premium)
   Endpoint: /fixtures/lineups
   Params: { fixture: "{fixtureId}" }
   Retorna: 11 titulares + formação tática
   → Fonte: https://v3.football.api-sports.io/fixtures/lineups

8. ARTILHEIROS (Premium)
   Endpoint: /players/topscorers
   Params: { league: "{leagueId}", season: "{year}" }
   Retorna: Top 10 artilheiros da liga
   → Fonte: https://v3.football.api-sports.io/players/topscorers

9. ODDS BTTS (Premium)
   Endpoint: /odds
   Params: { fixture: "{fixtureId}", bookmaker: "8", bet: "8" }
   Retorna: Odds reais de BTTS Sim/Não
   → Fonte: https://v3.football.api-sports.io/odds`}
                  </pre>
                </ScrollArea>
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Rate Limit: 30 req/min | Delay entre chamadas: 200-400ms
                </p>
              </div>

              {/* FASE 2: PROCESSAMENTO */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  FASE 2: Motor de Análise (analyzeAdvanced)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Função principal que processa todos os dados e gera a recomendação.
                </p>
                <ScrollArea className="h-[450px]">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-black/40 p-3 rounded">
{`// ============= MOTOR EUGINE v4.0 =============
// Arquivo: supabase/functions/fetch-odds/index.ts
// Linha: ~764-1132

function analyzeAdvanced(game: Game, lang: string = 'pt'): BettingAnalysis {
  
  // Inicializa scores para cada tipo de aposta
  let over25Score = 50;
  let under25Score = 50;
  let bttsScore = 50;
  let homeWinScore = 50;
  let awayWinScore = 50;
  let drawScore = 50;
  
  // ===== 1. ANÁLISE DO H2H =====
  // Peso dinâmico: 10-22% dependendo da liga
  if (h2h.totalGames >= 3) {
    if (h2h.avgGoals >= 3.0) {
      over25Score += 15 * h2hMultiplier;
      factors.push("Média alta de gols no H2H");
    }
    if (homeWinRate >= 0.6) {
      homeWinScore += 12 * h2hMultiplier;
      factors.push("Casa venceu 60%+ dos confrontos");
    }
  }
  
  // ===== 2. ANÁLISE DE FORMA PONDERADA =====
  // Peso dinâmico: 18-25% dependendo da liga
  // FÓRMULA: formScore = (últimos3 × 0.6) + (últimos5 × 0.4)
  const homeFormScore = calculateWeightedForm(homeForm);
  
  if (homeFormScore >= 70) {
    homeWinScore += 15 * formMultiplier;
    factors.push("Casa em ótima forma");
  }
  if (homeFormScore <= 40 && awayFormScore <= 40) {
    drawScore += 12; // Ambos em má forma = empate
  }
  
  // ===== 3. ANÁLISE DE ESTATÍSTICAS =====
  // Peso dinâmico: 20-32% dependendo da liga
  const avgGoalsTotal = homeStats.avgGoalsScored + awayStats.avgGoalsScored;
  
  if (avgGoalsTotal >= 3.2) {
    over25Score += 20 * statsMultiplier;
    factors.push("Média combinada: X.X gols/jogo");
  }
  
  // BTTS baseado em percentual histórico
  const avgBtts = (homeStats.bttsPercentage + awayStats.bttsPercentage) / 2;
  if (avgBtts >= 60) {
    bttsScore += 18 * statsMultiplier;
  }
  
  // HOME/AWAY SPLITS
  if (homeStats.homeGoalsAvg - awayStats.awayGoalsConcededAvg > 0.5) {
    homeWinScore += 10;
    factors.push("Casa forte em casa");
  }
  
  // ===== 4. SHOTS & POSSESSION =====
  // Dados do fixture (se disponível)
  if (shotsDiff > 3) {
    homeWinScore += 8;
    over25Score += 5;
  }
  if (homePossession > 60) {
    homeWinScore += 5;
  }
  
  // ===== 5. ANÁLISE DE POSIÇÃO NA TABELA =====
  // Peso dinâmico: 10-15%
  const posDiff = awayPosition - homePosition;
  
  if (posDiff >= 10) {
    homeWinScore += 12 * standingsMultiplier;
    factors.push("Casa: Xº vs Fora: Yº");
  }
  if (Math.abs(posDiff) <= 3) {
    drawScore += 8; // Times próximos = empate
  }
  
  // ===== 6. ANÁLISE DE LESÕES =====
  // Peso dinâmico: 10-18%
  if (homeInjuries >= 3) {
    homeWinScore -= 10 * injuryMultiplier;
    awayWinScore += 8 * injuryMultiplier;
    factors.push("Casa: X desfalques");
  }
  
  // ===== 7. PREVISÃO DA API =====
  // Peso fixo: ~5% (confirmação externa)
  if (apiPrediction.advice.includes('over')) {
    over25Score += 10;
  }
  if (apiPrediction.winnerConfidence >= 60) {
    [winner]Score += 12;
  }
  
  // ===== DETERMINAR MELHOR APOSTA COM VALUE =====
  const allScores = [
    { type: "Over 2.5", score: over25Score, odd: game.odds.over },
    { type: "Under 2.5", score: under25Score, odd: game.odds.under },
    { type: "BTTS Sim", score: bttsScore, odd: avgOdd },
    { type: "Vitória Casa", score: homeWinScore, odd: game.odds.home },
    { type: "Vitória Fora", score: awayWinScore, odd: game.odds.away },
    { type: "Empate", score: drawScore, odd: game.odds.draw },
  ];
  
  // Calcular VALUE para cada opção
  scoresWithValue = allScores.map(bet => {
    const estimatedProb = Math.min(100, Math.max(0, bet.score));
    const impliedProb = (1 / bet.odd) * 100;
    const value = ((estimatedProb / impliedProb) - 1) * 100;
    return { ...bet, estimatedProb, impliedProb, value };
  });
  
  // Ordenar por score e selecionar melhor
  const best = scoresWithValue.sort((a, b) => b.score - a.score)[0];
  const confidence = Math.min(100, Math.max(30, best.score));
  
  // VERIFICAR SKIP
  if (confidence < 65 || best.value < 5) {
    return { type: "SKIP", isSkip: true, skipReason: "..." };
  }
  
  return {
    type: best.type,
    confidence: confidence,
    valuePercentage: best.value,
    factors: factors.slice(0, 5),
    isSkip: false
  };
}`}
                  </pre>
                </ScrollArea>
              </div>

              {/* FASE 3: OUTPUT */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30">
                <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  FASE 3: Estrutura de Saída (BettingAnalysis)
                </h4>
                <ScrollArea className="h-[200px]">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-black/40 p-3 rounded">
{`// ============= INTERFACE DE RETORNO =============

interface BettingAnalysis {
  type: string;           // "VITÓRIA CASA" | "MAIS DE 2.5 GOLS" | "SKIP"
  reason: string;         // "H2H favorável. Casa em ótima forma."
  profit: number;         // Lucro potencial (R$40 × odd - R$40)
  confidence: number;     // 0-100 (mínimo para recomendar: 65)
  
  // Fatores que influenciaram a decisão
  factors: AnalysisFactor[];  // Top 5 fatores
  
  // Value Betting
  valuePercentage: number;      // Edge % contra o mercado
  impliedProbability: number;   // Probabilidade das odds
  estimatedProbability: number; // Nossa estimativa
  
  // Skip info
  isSkip: boolean;        // true se não recomendamos apostar
  skipReason?: string;    // "Confiança baixa" | "Sem edge"
}

interface AnalysisFactor {
  name: string;           // "H2H" | "Forma" | "Estatísticas"
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;         // Peso aplicado (0-100)
  description: string;    // "Casa venceu 60% dos confrontos"
}

// ============= THRESHOLDS DE DECISÃO =============

const MIN_CONFIDENCE_THRESHOLD = 65;  // Mínimo para recomendar
const MIN_VALUE_THRESHOLD = 5;        // 5% edge mínimo
const MAX_VALUE_THRESHOLD = 8;        // 8% para mercados de resultado

// Se não atender ambos critérios → SKIP`}
                  </pre>
                </ScrollArea>
              </div>

              {/* FONTES E REFERÊNCIAS */}
              <div className="p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
                <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Fontes e Referências
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Código</Badge>
                    <code className="text-xs text-muted-foreground">supabase/functions/fetch-odds/index.ts</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">API</Badge>
                    <code className="text-xs text-muted-foreground">https://www.api-football.com/documentation-v3</code>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">Docs</Badge>
                    <code className="text-xs text-muted-foreground">docs/EUGINE_TECHNICAL_SPECIFICATION.md</code>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Para modificar a lógica, edite diretamente o arquivo <code className="bg-black/30 px-1 rounded">fetch-odds/index.ts</code> 
                  nas linhas 764-1132 (função analyzeAdvanced).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Calculations Tab */}
      <TabsContent value="calculations" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pesos Dinâmicos */}
          <Card className="border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-purple-400" />
                Pesos Dinâmicos por Liga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                O Eugine ajusta a importância de cada fator baseado nas características da liga:
              </p>
              
              <div className="space-y-2">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Premier League</span>
                    <Badge variant="outline" className="text-xs">Físico</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stats: 32% | Form: 18% | H2H: 10% | Injuries: 12%
                  </p>
                </div>
                
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Serie A (Itália)</span>
                    <Badge variant="outline" className="text-xs">Tático</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stats: 20% | Injuries: 18% | Standings: 15% | Form: 18%
                  </p>
                </div>
                
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Brasileirão</span>
                    <Badge variant="outline" className="text-xs">Casa Forte</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    HomeAway: 10% | Form: 25% | Standings: 12%
                  </p>
                </div>
                
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Champions League</span>
                    <Badge variant="outline" className="text-xs">H2H Crucial</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    H2H: 22% | Form: 18% | Stats: 25%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Betting */}
          <Card className="border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Cálculo de Value Betting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-cyan-400 mb-2">Probabilidade Implícita</h4>
                <code className="text-xs bg-black/50 px-2 py-1 rounded block">
                  Prob_Implícita = (1 / Odd) × 100
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Exemplo: Odd 2.0 → 50% de probabilidade implícita
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-emerald-400 mb-2">Value Edge</h4>
                <code className="text-xs bg-black/50 px-2 py-1 rounded block">
                  Value = ((Prob_Estimada / Prob_Implícita) - 1) × 100
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Exemplo: 60% estimado vs 50% implícita = +20% value
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
                <h4 className="font-semibold text-amber-400 mb-2">Thresholds de Skip</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span>Confiança &lt; 65%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span>Value &lt; 5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forma Ponderada */}
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Forma Ponderada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Últimos resultados têm peso maior na análise:
              </p>
              
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Últimos 3 jogos</span>
                  <Badge className="bg-cyan-500/20 text-cyan-400">60% peso</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Últimos 5 jogos</span>
                  <Badge className="bg-slate-500/20 text-slate-400">40% peso</Badge>
                </div>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-sm mb-2">Pontuação por Resultado</h4>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    V = 3 pts
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    E = 1 pt
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    D = 0 pts
                  </span>
                </div>
              </div>

              <code className="text-xs bg-black/50 px-2 py-1 rounded block">
                Forma = (Score_3j × 0.6) + (Score_5j × 0.4)
              </code>
            </CardContent>
          </Card>

          {/* Fatores de Análise */}
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-400" />
                7 Fatores de Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: 'H2H (Confrontos Diretos)', weight: '15%', desc: 'Histórico entre os times' },
                  { name: 'Forma Recente', weight: '20%', desc: 'Últimos 5 resultados' },
                  { name: 'Estatísticas Temporada', weight: '25%', desc: 'Gols, BTTS%, Over 2.5%' },
                  { name: 'Value das Odds', weight: '15%', desc: 'Edge vs mercado' },
                  { name: 'Classificação', weight: '10%', desc: 'Posição na tabela' },
                  { name: 'Lesões', weight: '10%', desc: 'Desfalques importantes' },
                  { name: 'API Prediction', weight: '5%', desc: 'Previsão externa' },
                ].map((factor, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <div>
                      <span className="text-sm font-medium">{factor.name}</span>
                      <p className="text-xs text-muted-foreground">{factor.desc}</p>
                    </div>
                    <Badge variant="outline">{factor.weight}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* APIs Tab */}
      <TabsContent value="apis" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-400" />
                API-Football (Principal)
              </CardTitle>
              <CardDescription>Fonte primária de dados esportivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm font-medium text-cyan-400">Base URL</span>
                  <code className="text-xs block mt-1">https://v3.football.api-sports.io</code>
                </div>
                
                <h4 className="font-semibold text-sm mt-4">Endpoints Utilizados:</h4>
                
                <div className="space-y-2">
                  {[
                    { endpoint: '/fixtures', desc: 'Lista de jogos do dia' },
                    { endpoint: '/odds', desc: 'Odds das casas de apostas' },
                    { endpoint: '/fixtures/headtohead', desc: 'Confrontos diretos (H2H)' },
                    { endpoint: '/teams/statistics', desc: 'Estatísticas dos times' },
                    { endpoint: '/standings', desc: 'Classificação da liga' },
                    { endpoint: '/injuries', desc: 'Lesões e suspensões' },
                    { endpoint: '/predictions', desc: 'Previsões da API' },
                    { endpoint: '/fixtures/lineups', desc: 'Escalações confirmadas' },
                    { endpoint: '/players/topscorers', desc: 'Artilheiros da liga' },
                  ].map((api, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-black/30 rounded text-sm">
                      <code className="text-cyan-300">{api.endpoint}</code>
                      <span className="text-muted-foreground text-xs">{api.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-400" />
                Stripe (Pagamentos)
              </CardTitle>
              <CardDescription>Processamento de assinaturas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm font-medium text-violet-400">Funcionalidades</span>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Checkout para assinaturas</li>
                    <li>Webhooks para eventos de pagamento</li>
                    <li>Portal do cliente para gerenciamento</li>
                    <li>Pagamentos recorrentes e day-use</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm font-medium text-violet-400">Webhooks Monitorados</span>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>checkout.session.completed</li>
                    <li>customer.subscription.updated</li>
                    <li>customer.subscription.deleted</li>
                    <li>invoice.payment_succeeded</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-400" />
                Resend (Emails)
              </CardTitle>
              <CardDescription>Envio transacional e marketing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-orange-400">Domínio</span>
                <code className="text-xs block mt-1">eugineai.com</code>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-orange-400">Tipos de Email</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Boas-vindas após cadastro</li>
                  <li>Lembrete de fim de trial</li>
                  <li>OTP para reset de senha</li>
                  <li>Email marketing (admin)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                Supabase (Backend)
              </CardTitle>
              <CardDescription>Banco de dados e autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-blue-400">Serviços Utilizados</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Auth: Autenticação de usuários</li>
                  <li>Database: PostgreSQL com RLS</li>
                  <li>Edge Functions: Lógica serverless</li>
                  <li>Realtime: Atualizações em tempo real</li>
                </ul>
              </div>
              
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <span className="text-sm font-medium text-blue-400">Tabelas Principais</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>profiles: Dados dos usuários</li>
                  <li>daily_searches: Controle de buscas</li>
                  <li>odds_cache: Cache de odds</li>
                  <li>backtest_results: Histórico backtests</li>
                  <li>user_roles: Permissões (admin)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* AI Gateway Tab */}
      <TabsContent value="ai-gateway" className="space-y-4">
        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" />
              Sistema de Inteligência Artificial
            </CardTitle>
            <CardDescription>
              Como o Eugine utiliza IA para análises avançadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-amber-500/30">
              <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Status Atual: Motor Matemático
              </h4>
              <p className="text-sm text-muted-foreground">
                Atualmente, o Eugine opera com um <strong>motor matemático determinístico</strong> que 
                utiliza fórmulas estatísticas e pesos ponderados para gerar análises. Não utiliza 
                modelos de linguagem (LLM) para as recomendações de apostas.
              </p>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
              <h4 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Lovable AI Gateway (Disponível)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                O projeto tem acesso ao Lovable AI Gateway para futuras integrações:
              </p>
              
              <div className="space-y-2">
                <div className="p-3 bg-black/30 rounded-lg">
                  <span className="text-sm font-medium text-cyan-400">URL do Gateway</span>
                  <code className="text-xs block mt-1">https://ai.gateway.lovable.dev/v1/chat/completions</code>
                </div>
                
                <div className="p-3 bg-black/30 rounded-lg">
                  <span className="text-sm font-medium text-cyan-400">Modelos Disponíveis</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { name: 'Gemini 2.5 Pro', id: 'google/gemini-2.5-pro', desc: 'Alta capacidade' },
                      { name: 'Gemini 2.5 Flash', id: 'google/gemini-2.5-flash', desc: 'Balanceado' },
                      { name: 'Gemini 3 Flash', id: 'google/gemini-3-flash-preview', desc: 'Rápido' },
                      { name: 'GPT-5', id: 'openai/gpt-5', desc: 'Premium' },
                      { name: 'GPT-5 Mini', id: 'openai/gpt-5-mini', desc: 'Custo efetivo' },
                      { name: 'GPT-5.2', id: 'openai/gpt-5.2', desc: 'Mais recente' },
                    ].map((model, i) => (
                      <div key={i} className="p-2 bg-slate-800/50 rounded text-xs">
                        <span className="font-medium">{model.name}</span>
                        <p className="text-muted-foreground">{model.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Integração DeepSeek (Planejada)
              </h4>
              <p className="text-sm text-muted-foreground">
                Existe um plano documentado para integrar o modelo DeepSeek para análises 
                quantitativas mais profundas, incluindo:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Cálculos de probabilidade com intervalos de confiança</li>
                <li>Análise de value contra odds de mercado</li>
                <li>Relatórios estruturados com premissas do modelo</li>
              </ul>
              <p className="text-xs text-amber-400 mt-2">
                Requer: DEEPSEEK_API_KEY (não configurada)
              </p>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-emerald-500/30">
              <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Vantagens do Motor Atual
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Resultados determinísticos e reproduzíveis</li>
                <li>Sem custos de API de IA por análise</li>
                <li>Transparência total nos cálculos</li>
                <li>Latência mínima (apenas API-Football)</li>
                <li>Facilidade de backtest e validação</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
