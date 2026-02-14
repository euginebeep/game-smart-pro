import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, TrendingUp, Target, BarChart3, PieChart, Trophy, XCircle, Clock, 
  Filter, ArrowUpRight, ArrowDownRight, Minus, Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

interface BetRecord {
  id: string;
  fixture_id: string;
  home_team: string;
  away_team: string;
  league: string;
  bet_type: string;
  bet_label: string;
  odd: number;
  confidence: number;
  estimated_probability: number;
  implied_probability: number;
  value_edge: number;
  match_date: string;
  result: string | null;
  actual_score: string | null;
  was_skip: boolean | null;
  created_at: string;
}

const COLORS = {
  win: '#22c55e',
  loss: '#ef4444',
  pending: '#f59e0b',
  primary: '#00ffff',
  secondary: '#8b5cf6',
};

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

export function BacktestDashboard() {
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLeague, setFilterLeague] = useState('all');
  const [filterBetType, setFilterBetType] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const fetchBets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bet_tracking')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setBets((data as BetRecord[]) || []);
    } catch (err) {
      console.error('Error fetching bets:', err);
      toast.error('Erro ao carregar dados de tracking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  // Filters
  const filteredBets = bets.filter(bet => {
    if (filterLeague !== 'all' && bet.league !== filterLeague) return false;
    if (filterBetType !== 'all' && bet.bet_type !== filterBetType) return false;
    if (filterResult !== 'all' && (bet.result || 'pending') !== filterResult) return false;
    if (filterDateFrom && bet.match_date < filterDateFrom) return false;
    if (filterDateTo && bet.match_date > filterDateTo) return false;
    return true;
  });

  // Stats
  const resolved = filteredBets.filter(b => b.result === 'win' || b.result === 'loss');
  const wins = filteredBets.filter(b => b.result === 'win').length;
  const losses = filteredBets.filter(b => b.result === 'loss').length;
  const pending = filteredBets.filter(b => !b.result || b.result === 'pending').length;
  const hitRate = resolved.length > 0 ? (wins / resolved.length) * 100 : 0;
  
  // ROI calculation
  const totalRoi = resolved.reduce((sum, b) => {
    if (b.result === 'win') return sum + (b.odd - 1);
    return sum - 1;
  }, 0);
  const yieldPerBet = resolved.length > 0 ? (totalRoi / resolved.length) * 100 : 0;

  // Avg stats
  const avgOdd = filteredBets.length > 0 ? filteredBets.reduce((s, b) => s + b.odd, 0) / filteredBets.length : 0;
  const avgConf = filteredBets.length > 0 ? filteredBets.reduce((s, b) => s + b.confidence, 0) / filteredBets.length : 0;
  const avgEdge = filteredBets.length > 0 ? filteredBets.reduce((s, b) => s + b.value_edge, 0) / filteredBets.length : 0;

  // Unique values for filters
  const leagues = [...new Set(bets.map(b => b.league))].sort();
  const betTypes = [...new Set(bets.map(b => b.bet_type))].sort();

  // Charts data
  const pieData = [
    { name: 'Acertos', value: wins, color: COLORS.win },
    { name: 'Erros', value: losses, color: COLORS.loss },
    { name: 'Pendentes', value: pending, color: COLORS.pending },
  ].filter(d => d.value > 0);

  // By bet type
  const byBetType = betTypes.map(type => {
    const typeBets = filteredBets.filter(b => b.bet_type === type);
    const typeResolved = typeBets.filter(b => b.result === 'win' || b.result === 'loss');
    const typeWins = typeBets.filter(b => b.result === 'win').length;
    const typeRate = typeResolved.length > 0 ? (typeWins / typeResolved.length) * 100 : 0;
    const typeRoi = typeResolved.reduce((sum, b) => b.result === 'win' ? sum + (b.odd - 1) : sum - 1, 0);
    return {
      name: type.length > 18 ? type.substring(0, 18) + '...' : type,
      fullName: type,
      total: typeBets.length,
      wins: typeWins,
      losses: typeBets.filter(b => b.result === 'loss').length,
      pending: typeBets.filter(b => !b.result || b.result === 'pending').length,
      hitRate: typeRate,
      roi: typeRoi,
    };
  });

  // By league
  const byLeague = leagues.map(league => {
    const leagueBets = filteredBets.filter(b => b.league === league);
    const leagueResolved = leagueBets.filter(b => b.result === 'win' || b.result === 'loss');
    const leagueWins = leagueBets.filter(b => b.result === 'win').length;
    const leagueRate = leagueResolved.length > 0 ? (leagueWins / leagueResolved.length) * 100 : 0;
    const leagueRoi = leagueResolved.reduce((sum, b) => b.result === 'win' ? sum + (b.odd - 1) : sum - 1, 0);
    return {
      name: league.length > 15 ? league.substring(0, 15) + '...' : league,
      fullName: league,
      total: leagueBets.length,
      wins: leagueWins,
      losses: leagueBets.filter(b => b.result === 'loss').length,
      hitRate: leagueRate,
      roi: leagueRoi,
    };
  });

  // Confidence distribution
  const confRanges = [
    { range: '60-65%', min: 60, max: 65 },
    { range: '65-70%', min: 65, max: 70 },
    { range: '70-75%', min: 70, max: 75 },
    { range: '75-80%', min: 75, max: 80 },
    { range: '80-85%', min: 80, max: 85 },
    { range: '85-90%', min: 85, max: 90 },
    { range: '90-95%', min: 90, max: 95 },
    { range: '95-100%', min: 95, max: 101 },
  ];
  const confData = confRanges.map(r => {
    const rangeBets = filteredBets.filter(b => b.confidence >= r.min && b.confidence < r.max);
    const rangeResolved = rangeBets.filter(b => b.result === 'win' || b.result === 'loss');
    const rangeWins = rangeBets.filter(b => b.result === 'win').length;
    return {
      name: r.range,
      total: rangeBets.length,
      hitRate: rangeResolved.length > 0 ? (rangeWins / rangeResolved.length) * 100 : 0,
    };
  }).filter(d => d.total > 0);

  const clearFilters = () => {
    setFilterLeague('all');
    setFilterBetType('all');
    setFilterResult('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = filterLeague !== 'all' || filterBetType !== 'all' || filterResult !== 'all' || filterDateFrom || filterDateTo;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="border-primary/30">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs">Total</CardDescription>
            <CardTitle className="text-2xl">{filteredBets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs flex items-center gap-1"><Trophy className="h-3 w-3" />Acertos</CardDescription>
            <CardTitle className="text-2xl text-green-500">{wins}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs flex items-center gap-1"><XCircle className="h-3 w-3" />Erros</CardDescription>
            <CardTitle className="text-2xl text-red-500">{losses}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />Pendentes</CardDescription>
            <CardTitle className="text-2xl text-yellow-500">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={hitRate >= 55 ? 'border-green-500/30' : hitRate >= 45 ? 'border-yellow-500/30' : 'border-red-500/30'}>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs">Taxa Acerto</CardDescription>
            <CardTitle className={`text-2xl ${hitRate >= 55 ? 'text-green-500' : hitRate >= 45 ? 'text-yellow-500' : 'text-red-500'}`}>
              {resolved.length > 0 ? `${hitRate.toFixed(1)}%` : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={totalRoi > 0 ? 'border-green-500/30' : 'border-red-500/30'}>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs">ROI</CardDescription>
            <CardTitle className={`text-2xl ${totalRoi > 0 ? 'text-green-500' : totalRoi < 0 ? 'text-red-500' : ''}`}>
              {resolved.length > 0 ? `${totalRoi > 0 ? '+' : ''}${totalRoi.toFixed(2)}u` : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs">Odd Média</CardDescription>
            <CardTitle className="text-2xl">{avgOdd.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardDescription className="text-xs">Confiança Média</CardDescription>
            <CardTitle className="text-2xl text-primary">{avgConf.toFixed(0)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">Liga</label>
              <Select value={filterLeague} onValueChange={setFilterLeague}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {leagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tipo Aposta</label>
              <Select value={filterBetType} onValueChange={setFilterBetType}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {betTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Resultado</label>
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="win">Acerto ✅</SelectItem>
                  <SelectItem value="loss">Erro ❌</SelectItem>
                  <SelectItem value="pending">Pendente ⏳</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">De</label>
              <Input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} className="w-[140px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Até</label>
              <Input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} className="w-[140px]" />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar</Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchBets}>
              <RefreshCw className="h-3 w-3 mr-1" /> Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pie Chart - Results */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Distribuição de Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - By Bet Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Por Tipo de Aposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byBetType.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byBetType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2035', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 8 }} />
                  <Bar dataKey="wins" stackId="a" fill={COLORS.win} name="Acertos" />
                  <Bar dataKey="losses" stackId="a" fill={COLORS.loss} name="Erros" />
                  <Bar dataKey="pending" stackId="a" fill={COLORS.pending} name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sem dados</p>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - By League */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Por Liga
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byLeague.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byLeague} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a2035', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 8 }} />
                  <Bar dataKey="wins" stackId="a" fill={COLORS.win} name="Acertos" />
                  <Bar dataKey="losses" stackId="a" fill={COLORS.loss} name="Erros" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-10">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confidence vs Hit Rate Chart */}
      {confData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Confiança vs Taxa de Acerto (calibração)
            </CardTitle>
            <CardDescription>Verifica se a confiança do Eugine corresponde à taxa de acerto real</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={confData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2035', border: '1px solid rgba(0,255,255,0.2)', borderRadius: 8 }} />
                <Bar dataKey="hitRate" fill={COLORS.primary} name="Taxa de Acerto %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill={COLORS.secondary} name="Qtd Apostas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed breakdown tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Bet Type Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Desempenho por Tipo de Aposta</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">✅</TableHead>
                  <TableHead className="text-center">❌</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-center">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byBetType.map(row => (
                  <TableRow key={row.fullName}>
                    <TableCell className="font-medium text-xs">{row.fullName}</TableCell>
                    <TableCell className="text-center">{row.total}</TableCell>
                    <TableCell className="text-center text-green-500">{row.wins}</TableCell>
                    <TableCell className="text-center text-red-500">{row.losses}</TableCell>
                    <TableCell className="text-center">
                      {row.wins + row.losses > 0 ? (
                        <Badge className={row.hitRate >= 55 ? 'bg-green-500/20 text-green-400' : row.hitRate >= 45 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                          {row.hitRate.toFixed(0)}%
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${row.roi > 0 ? 'text-green-500' : row.roi < 0 ? 'text-red-500' : ''}`}>
                      {row.wins + row.losses > 0 ? `${row.roi > 0 ? '+' : ''}${row.roi.toFixed(2)}u` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By League Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🏆 Desempenho por Liga</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Liga</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">✅</TableHead>
                  <TableHead className="text-center">❌</TableHead>
                  <TableHead className="text-center">Taxa</TableHead>
                  <TableHead className="text-center">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byLeague.map(row => (
                  <TableRow key={row.fullName}>
                    <TableCell className="font-medium text-xs">{row.fullName}</TableCell>
                    <TableCell className="text-center">{row.total}</TableCell>
                    <TableCell className="text-center text-green-500">{row.wins}</TableCell>
                    <TableCell className="text-center text-red-500">{row.losses}</TableCell>
                    <TableCell className="text-center">
                      {row.wins + row.losses > 0 ? (
                        <Badge className={row.hitRate >= 55 ? 'bg-green-500/20 text-green-400' : row.hitRate >= 45 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                          {row.hitRate.toFixed(0)}%
                        </Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${row.roi > 0 ? 'text-green-500' : row.roi < 0 ? 'text-red-500' : ''}`}>
                      {row.wins + row.losses > 0 ? `${row.roi > 0 ? '+' : ''}${row.roi.toFixed(2)}u` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* All Bets Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Todas as Recomendações ({filteredBets.length})
          </CardTitle>
          <CardDescription>Lista detalhada de todas as indicações feitas pelo Eugine aos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Liga</TableHead>
                  <TableHead>Indicação</TableHead>
                  <TableHead className="text-center">Odd</TableHead>
                  <TableHead className="text-center">Confiança</TableHead>
                  <TableHead className="text-center">Value Edge</TableHead>
                  <TableHead className="text-center">Placar</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.slice(0, 100).map(bet => (
                  <TableRow key={bet.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(bet.match_date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-xs font-medium whitespace-nowrap">
                      {bet.home_team} vs {bet.away_team}
                    </TableCell>
                    <TableCell className="text-xs">{bet.league}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        {bet.bet_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">{bet.odd.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <span className={bet.confidence >= 80 ? 'text-green-400' : bet.confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'}>
                        {bet.confidence}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={bet.value_edge >= 10 ? 'text-green-400' : 'text-yellow-400'}>
                        {bet.value_edge.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {bet.actual_score || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {bet.result === 'win' ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✅ Acerto</Badge>
                      ) : bet.result === 'loss' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">❌ Erro</Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⏳ Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredBets.length > 100 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Mostrando 100 de {filteredBets.length} registros
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
