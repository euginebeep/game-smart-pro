import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Calculator, Database, Cpu, Globe, Zap, Target, TrendingUp, 
  BarChart3, Scale, Shield, AlertCircle, CheckCircle2, Info, Mail,
  Layers, DollarSign
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
        <TabsTrigger value="accumulators" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Acumuladas
        </TabsTrigger>
        <TabsTrigger value="apis" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          APIs & Pagamentos
        </TabsTrigger>
        <TabsTrigger value="ai-gateway" className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Inteligência Artificial
        </TabsTrigger>
      </TabsList>

      {/* Prompts Tab */}
      <TabsContent value="prompts" className="space-y-4">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Sistema de Prompts do Eugine
            </CardTitle>
            <CardDescription>
              Como o Eugine processa e analisa os dados para gerar recomendações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivo Principal
                </h4>
                <p className="text-muted-foreground text-sm">
                  O Eugine é um motor de análise matemática v8 que processa dados estatísticos de futebol 
                  usando <strong>distribuição de Poisson</strong> para probabilidades de gols e <strong>função Sigmoid</strong> (fator 0.06) 
                  para normalizar confiança e scores entre 5% e 95%. Identifica oportunidades de Value Betting com edge positivo.
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Fluxo de Processamento
                </h4>
                <ol className="text-muted-foreground text-sm space-y-2 list-decimal list-inside">
                  <li>Coleta de dados via API-Football (fixtures, odds, estatísticas)</li>
                  <li>Enriquecimento com H2H, forma, lesões, classificação e odds BTTS/Over 3.5</li>
                  <li>Cálculo de probabilidades usando <strong>Poisson + Sigmoid</strong></li>
                  <li>Comparação com odds do mercado para identificar Value</li>
                  <li>Gestão de stakes com <strong>1/4 Kelly Criterion</strong></li>
                  <li>Geração de recomendação com score de confiança</li>
                </ol>
              </div>

              {/* FASE 1: COLETA DE DADOS */}
              <div className="p-4 bg-muted/50 rounded-lg border border-primary/30">
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  FASE 1: Coleta de Dados (API-Football)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  O sistema faz chamadas sequenciais com delays de 200-400ms para respeitar rate limits.
                </p>
                <ScrollArea className="h-[320px]">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/60 p-3 rounded">
{`// ============= ENDPOINTS CONSULTADOS =============

1. FIXTURES DO DIA
   Endpoint: /fixtures
   Params: { date: "YYYY-MM-DD", timezone: "America/Sao_Paulo" }

2. CONFRONTOS DIRETOS (H2H)
   Endpoint: /fixtures/headtohead
   Params: { h2h: "{homeTeamId}-{awayTeamId}", last: "10" }

3. ESTATÍSTICAS DO TIME
   Endpoint: /teams/statistics
   Params: { team: "{teamId}", league: "{leagueId}", season: "{year}" }

4. CLASSIFICAÇÃO
   Endpoint: /standings
   Params: { league: "{leagueId}", season: "{year}" }

5. LESÕES E SUSPENSÕES
   Endpoint: /injuries
   Params: { fixture: "{fixtureId}" }

6. PREVISÃO DA API
   Endpoint: /predictions
   Params: { fixture: "{fixtureId}" }

7. ESCALAÇÕES (Premium)
   Endpoint: /fixtures/lineups

8. ARTILHEIROS (Premium)
   Endpoint: /players/topscorers

9. ODDS BTTS (Premium)
   Endpoint: /odds
   Params: { fixture: "{fixtureId}", bookmaker: "8", bet: "8" }
   Retorna: Odds reais de BTTS Sim/Não

10. ODDS OVER 3.5 / 4.5 (Premium)
    Endpoint: /odds
    Params: { fixture: "{fixtureId}", bookmaker: "8", bet: "5" }
    Retorna: Odds reais de Over/Under 3.5 e 4.5

11. ODDS DOUBLE CHANCE
    Endpoint: /odds
    Params: { fixture: "{fixtureId}", bookmaker: "8", bet: "12" }
    Retorna: Odds reais de Double Chance`}
                  </pre>
                </ScrollArea>
                <p className="text-xs text-accent mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Rate Limit: 30 req/min | Delay entre chamadas: 200-400ms
                </p>
              </div>

              {/* FASE 2: PROCESSAMENTO */}
              <div className="p-4 bg-muted/50 rounded-lg border border-primary/30">
                <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  FASE 2: Motor Matemático v8 (Poisson + Sigmoid)
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Função principal usa distribuição de Poisson para gols e Sigmoid para normalização.
                </p>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background/60 p-3 rounded">
{`// ============= MOTOR EUGINE v8 =============
// Arquivo: supabase/functions/fetch-odds/index.ts

// 1. POISSON DISTRIBUTION
// Calcula probabilidade de X gols usando lambda (média esperada)
// P(X=k) = (e^-λ × λ^k) / k!
function poissonProbability(lambda: number, k: number): number

// 2. SIGMOID NORMALIZATION  
// Normaliza scores entre 5% e 95% com fator 0.06
// sigmoid(x) = 1 / (1 + e^(-0.06 × (x - 50)))
// Resultado: min 5%, max 95%

// 3. KELLY CRITERION (1/4 Kelly)
// Calcula stake ótimo baseado em edge vs mercado
// kelly = (estimatedProb × odd - 1) / (odd - 1)
// stake = bankroll × kelly × 0.25  (quarter Kelly)

// 4. VALUE BETTING
// Edge = ((Prob_Estimada / Prob_Implícita) - 1) × 100
// MIN_CONFIDENCE = 65%
// MIN_VALUE = 5%

// 7 FATORES DE ANÁLISE:
// 1. H2H (10-22%) - Confrontos diretos
// 2. Forma (18-25%) - Últimos resultados ponderados
// 3. Stats (20-32%) - Gols, BTTS%, Over 2.5%
// 4. Shots & Possession - Dados do fixture
// 5. Classificação (10-15%) - Posição na tabela
// 6. Lesões (10-18%) - Desfalques
// 7. API Prediction (~5%) - Confirmação externa`}
                  </pre>
                </ScrollArea>
              </div>

              {/* Fontes */}
              <div className="p-4 bg-muted/50 rounded-lg border border-accent/30">
                <h4 className="font-semibold text-accent mb-3 flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Calculations Tab */}
      <TabsContent value="calculations" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pesos Dinâmicos */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Pesos Dinâmicos por Liga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                O Eugine ajusta a importância de cada fator baseado nas características da liga:
              </p>
              
              <div className="space-y-2">
                {[
                  { name: 'Premier League', tag: 'Físico', weights: 'Stats: 32% | Form: 18% | H2H: 10% | Injuries: 12%' },
                  { name: 'Serie A (Itália)', tag: 'Tático', weights: 'Stats: 20% | Injuries: 18% | Standings: 15% | Form: 18%' },
                  { name: 'Brasileirão', tag: 'Casa Forte', weights: 'HomeAway: 10% | Form: 25% | Standings: 12%' },
                  { name: 'Champions League', tag: 'H2H Crucial', weights: 'H2H: 22% | Form: 18% | Stats: 25%' },
                ].map((league, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{league.name}</span>
                      <Badge variant="outline" className="text-xs">{league.tag}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{league.weights}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Value Betting */}
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Value Betting + Kelly Criterion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-primary mb-2">Probabilidade Implícita</h4>
                <code className="text-xs bg-background/60 px-2 py-1 rounded block">
                  Prob_Implícita = (1 / Odd) × 100
                </code>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-accent mb-2">Value Edge</h4>
                <code className="text-xs bg-background/60 px-2 py-1 rounded block">
                  Value = ((Prob_Estimada / Prob_Implícita) - 1) × 100
                </code>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-primary mb-2">1/4 Kelly Criterion (Stakes)</h4>
                <code className="text-xs bg-background/60 px-2 py-1 rounded block">
                  kelly = (prob × odd - 1) / (odd - 1) × 0.25
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Stakes dinâmicos: $10-$150 baseado na vantagem calculada
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-accent/30">
                <h4 className="font-semibold text-accent mb-2">Thresholds de Skip</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Confiança &lt; 65%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>Value &lt; 5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forma Ponderada */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Forma Ponderada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Últimos resultados têm peso maior na análise:
              </p>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Últimos 3 jogos</span>
                  <Badge className="bg-primary/20 text-primary">60% peso</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Últimos 5 jogos</span>
                  <Badge className="bg-muted text-muted-foreground">40% peso</Badge>
                </div>
              </div>

              <code className="text-xs bg-background/60 px-2 py-1 rounded block">
                Forma = (Score_3j × 0.6) + (Score_5j × 0.4)
              </code>
            </CardContent>
          </Card>

          {/* 7 Fatores */}
          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
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
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
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

      {/* Accumulators Tab (NEW) */}
      <TabsContent value="accumulators" className="space-y-4">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Estrutura das Acumuladas
            </CardTitle>
            <CardDescription>
              Configuração comercial otimizada para atratividade do apostador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold">Categoria</th>
                    <th className="text-center py-2 px-3 font-semibold">Pernas</th>
                    <th className="text-center py-2 px-3 font-semibold">Odd Total</th>
                    <th className="text-center py-2 px-3 font-semibold">Prob. Alvo</th>
                    <th className="text-center py-2 px-3 font-semibold">Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { cat: '🛡️ Gols - Seguro', legs: '2', odds: '1.50-1.80', prob: '35-55%', stake: '$50-150', color: 'text-primary' },
                    { cat: '⚖️ Gols - Moderado', legs: '2', odds: '3.00-4.50', prob: '18-30%', stake: '$25-80', color: 'text-accent' },
                    { cat: '🚀 Gols - Arrojado', legs: '3', odds: '5.00-12.00', prob: '8-18%', stake: '$10-30', color: 'text-destructive' },
                    { cat: '🛡️ Dupla Chance', legs: '2', odds: '1.30-2.50', prob: '35-60%', stake: '$50-150', color: 'text-primary' },
                    { cat: '⚖️ Vitórias - Moderado', legs: '2', odds: '2.50-5.00', prob: '15-30%', stake: '$25-80', color: 'text-accent' },
                    { cat: '🚀 Placares Exatos', legs: '2', odds: '40-80', prob: '3-8%', stake: '$10-30', color: 'text-destructive' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className={`py-2 px-3 font-medium ${row.color}`}>{row.cat}</td>
                      <td className="py-2 px-3 text-center">{row.legs}</td>
                      <td className="py-2 px-3 text-center">{row.odds}</td>
                      <td className="py-2 px-3 text-center font-semibold">{row.prob}</td>
                      <td className="py-2 px-3 text-center">{row.stake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Cálculo de Chance Real
                </h4>
                <code className="text-xs bg-background/60 px-2 py-1 rounded block mb-2">
                  chance = Π(1/odd_i × 0.93) × 100
                </code>
                <p className="text-xs text-muted-foreground">
                  Fator de margem: 0.93 (desconta ~7% de vig das casas)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Gestão de Stakes (Kelly)
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Risco Baixo: $50 - $150 (30% edge × bankroll)</p>
                  <p>• Risco Médio: $25 - $80 (20% edge × bankroll)</p>
                  <p>• Risco Alto: $10 - $30 (10% edge × bankroll)</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-accent/30">
              <h4 className="font-semibold text-accent mb-2">Filtros Mínimos de Qualidade</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Risco Baixo: chance mínima 25% (remove acumuladas fracas)</p>
                <p>• Risco Médio: chance mínima 10%</p>
                <p>• Risco Alto: chance mínima 3%</p>
                <p>• Premium: 3x mais cards por categoria + filtros por tipo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* APIs Tab */}
      <TabsContent value="apis" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                API-Football (Principal)
              </CardTitle>
              <CardDescription>Fonte primária de dados esportivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-primary">Base URL</span>
                  <code className="text-xs block mt-1">https://v3.football.api-sports.io</code>
                </div>
                
                <h4 className="font-semibold text-sm mt-4">Endpoints Utilizados:</h4>
                
                <div className="space-y-2">
                  {[
                    { endpoint: '/fixtures', desc: 'Lista de jogos do dia' },
                    { endpoint: '/odds', desc: 'Odds (BTTS, Over 3.5, DC)' },
                    { endpoint: '/fixtures/headtohead', desc: 'Confrontos diretos' },
                    { endpoint: '/teams/statistics', desc: 'Estatísticas dos times' },
                    { endpoint: '/standings', desc: 'Classificação da liga' },
                    { endpoint: '/injuries', desc: 'Lesões e suspensões' },
                    { endpoint: '/predictions', desc: 'Previsões da API' },
                    { endpoint: '/fixtures/lineups', desc: 'Escalações confirmadas' },
                    { endpoint: '/players/topscorers', desc: 'Artilheiros da liga' },
                  ].map((api, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-background/60 rounded text-sm">
                      <code className="text-primary">{api.endpoint}</code>
                      <span className="text-muted-foreground text-xs">{api.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Stripe (Pagamentos)
              </CardTitle>
              <CardDescription>Processamento multi-moeda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-accent">Price IDs Mapeados</span>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p><strong>BRL:</strong> basic, advanced, premium ✅</p>
                    <p><strong>USD:</strong> basic, advanced, premium ✅</p>
                    <p><strong>EUR:</strong> basic, advanced, premium ✅</p>
                    <p className="text-accent">Day Use: placeholder (bloqueado)</p>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-accent">Webhooks Monitorados</span>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>checkout.session.completed</li>
                    <li>customer.subscription.updated</li>
                    <li>customer.subscription.deleted</li>
                    <li>invoice.payment_succeeded</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-accent">URLs de Retorno</span>
                  <code className="text-xs block mt-1">https://www.eugineai.com</code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Resend (Emails)
              </CardTitle>
              <CardDescription>Envio transacional e marketing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-primary">Domínio</span>
                <code className="text-xs block mt-1">eugineai.com</code>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-primary">Tipos de Email</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Boas-vindas após cadastro</li>
                  <li>Lembrete de fim de trial</li>
                  <li>OTP para reset de senha</li>
                  <li>Email marketing (admin)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Lovable Cloud (Backend)
              </CardTitle>
              <CardDescription>Banco de dados e autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-primary">Serviços Utilizados</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Auth: Autenticação de usuários</li>
                  <li>Database: PostgreSQL com RLS</li>
                  <li>Edge Functions: Lógica serverless</li>
                  <li>Realtime: Atualizações em tempo real</li>
                </ul>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-primary">Tabelas Principais</span>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>profiles: Dados dos usuários</li>
                  <li>daily_searches: Controle de buscas</li>
                  <li>odds_cache: Cache de odds</li>
                  <li>accumulator_tracking: Histórico acumuladas</li>
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
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Sistema de Inteligência Artificial
            </CardTitle>
            <CardDescription>
              Motor matemático determinístico + gateway IA disponível
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-accent/30">
              <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Motor Atual: Matemático v8
              </h4>
              <p className="text-sm text-muted-foreground">
                O Eugine opera com um <strong>motor matemático determinístico v8</strong> usando 
                Poisson + Sigmoid + Kelly Criterion. Resultados reproduzíveis, sem custos de API de IA, 
                transparência total nos cálculos e latência mínima.
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Lovable AI Gateway (Disponível)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Gateway disponível para futuras integrações de IA:
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Gemini 2.5 Pro', desc: 'Alta capacidade' },
                  { name: 'Gemini 2.5 Flash', desc: 'Balanceado' },
                  { name: 'GPT-5', desc: 'Premium' },
                  { name: 'GPT-5 Mini', desc: 'Custo efetivo' },
                ].map((model, i) => (
                  <div key={i} className="p-2 bg-background/60 rounded text-xs">
                    <span className="font-medium">{model.name}</span>
                    <p className="text-muted-foreground">{model.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-primary/30">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
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
