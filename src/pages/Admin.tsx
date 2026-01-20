import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, RefreshCw, Users, Search, Edit, RotateCcw, Save, Activity, MapPin, Building2, 
  BarChart3, TrendingUp, Target, Play, History, Ban, ShieldX, ShieldCheck, Globe, Mail, 
  Send, DollarSign, CreditCard, Repeat, Calendar, Gauge, Zap, AlertCircle, Trash2, CheckSquare, Square
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loading } from '@/components/Loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const TIER_LIMITS = {
  free: 0,
  basic: 1,
  advanced: 3,
  premium: 6
};

// Brazilian states map
const BRAZILIAN_STATES: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
  'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
  'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
  'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
  'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
  'SE': 'Sergipe', 'TO': 'Tocantins'
};

export default function Admin() {
  const navigate = useNavigate();
  const { 
    isAdmin, loading, users, usersLoading, analytics, emailLoading,
    fetchUsers, fetchAnalytics, updateUser, resetSearches, setSearchCount, 
    blockUser, sendMassEmail, getFilteredUserCount, deleteUser 
  } = useAdmin();
  
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    subscription_tier: '',
    subscription_status: '',
    is_active: true,
    phone: ''
  });
  const [searchCountInput, setSearchCountInput] = useState<{ userId: string; count: string } | null>(null);
  
  // Email state
  const [emailFilters, setEmailFilters] = useState({
    city: '',
    state: '',
    country_code: '',
    subscription_tier: ''
  });
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [filteredUsersCount, setFilteredUsersCount] = useState(0);
  
  // Backtest state
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestHistory, setBacktestHistory] = useState<any[]>([]);
  const [backtestDateFrom, setBacktestDateFrom] = useState('');
  const [backtestDateTo, setBacktestDateTo] = useState('');
  const [latestBacktest, setLatestBacktest] = useState<any>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Acesso negado. Você não tem permissão de administrador.');
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers().catch(() => {
        toast.error('Erro ao carregar usuários');
      });
      fetchAnalytics();
      fetchBacktestHistory();
    }
  }, [isAdmin]);

  // Update filtered users count when email filters change
  useEffect(() => {
    const updateCount = async () => {
      const count = await getFilteredUserCount(emailFilters);
      setFilteredUsersCount(count);
    };
    if (isAdmin) {
      updateCount();
    }
  }, [emailFilters, isAdmin]);

  const fetchBacktestHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('run-backtest', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: 'history' },
      });

      if (error) throw error;
      
      setBacktestHistory(data.history || []);
      if (data.history && data.history.length > 0) {
        setLatestBacktest(data.history[0]);
      }
    } catch (err) {
      console.error('Error fetching backtest history:', err);
    }
  };

  const runBacktest = async () => {
    if (!backtestDateFrom || !backtestDateTo) {
      toast.error('Selecione as datas de início e fim');
      return;
    }

    setBacktestLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data, error } = await supabase.functions.invoke('run-backtest', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          action: 'run',
          dateFrom: backtestDateFrom,
          dateTo: backtestDateTo,
        },
      });

      if (error) throw error;

      toast.success(`Backtest concluído: ${data.summary.hitRate.toFixed(1)}% de acertos, ROI ${data.summary.totalRoi > 0 ? '+' : ''}${data.summary.totalRoi.toFixed(2)} unidades`);
      fetchBacktestHistory();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao executar backtest');
    } finally {
      setBacktestLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      subscription_tier: user.subscription_tier,
      subscription_status: user.subscription_status || 'inactive',
      is_active: user.is_active,
      phone: user.phone || ''
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const updates: any = {
        subscription_tier: editForm.subscription_tier,
        subscription_status: editForm.subscription_status,
        is_active: editForm.is_active,
        phone: editForm.phone.trim() || null
      };

      if (editForm.subscription_status === 'active') {
        updates.subscription_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      await updateUser(editingUser.user_id, updates);
      toast.success('Usuário atualizado com sucesso');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleResetSearches = async (userId: string) => {
    try {
      await resetSearches(userId);
      toast.success('Buscas resetadas com sucesso');
    } catch (error) {
      toast.error('Erro ao resetar buscas');
    }
  };

  const handleSetSearchCount = async () => {
    if (!searchCountInput) return;
    
    try {
      await setSearchCount(searchCountInput.userId, parseInt(searchCountInput.count) || 0);
      toast.success('Contagem de buscas atualizada');
      setSearchCountInput(null);
    } catch (error) {
      toast.error('Erro ao definir contagem');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Preencha o assunto e conteúdo do email');
      return;
    }

    const targetCount = selectedUsers.length > 0 ? selectedUsers.length : filteredUsersCount;
    if (targetCount === 0) {
      toast.error('Nenhum usuário selecionado ou corresponde aos filtros');
      return;
    }

    try {
      const result = await sendMassEmail(
        emailFilters, 
        emailSubject, 
        emailContent, 
        selectedUsers.length > 0 ? selectedUsers : undefined
      );
      toast.success(`Email enviado para ${result.sent} usuários (${result.failed} falhas)`);
      setEmailSubject('');
      setEmailContent('');
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Erro ao enviar emails');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja DELETAR permanentemente o usuário ${email}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('Usuário deletado com sucesso');
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.user_id));
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black';
      case 'advanced': return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white';
      case 'basic': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'past_due': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground">Gerencie usuários, planos e limites de busca</p>
            </div>
          </div>
          <Button onClick={() => { fetchUsers(); fetchAnalytics(); }} disabled={usersLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Usuários</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Assinantes Ativos</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {users.filter(u => u.subscription_status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Em Trial</CardDescription>
              <CardTitle className="text-3xl text-blue-500">
                {users.filter(u => new Date(u.trial_end_date) > new Date() && u.subscription_status !== 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Premium</CardDescription>
              <CardTitle className="text-3xl text-amber-500">
                {users.filter(u => u.subscription_tier === 'premium' && u.subscription_status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendas Hoje</CardDescription>
              <CardTitle className="text-3xl text-emerald-500">
                R$ {analytics?.totalRevenueToday?.toFixed(2) || '0.00'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Buscas Hoje</CardDescription>
              <CardTitle className="text-3xl text-purple-500">
                {analytics?.todayApiCalls || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Uso API
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Marketing
            </TabsTrigger>
            <TabsTrigger value="backtest" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Backtest
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Sales Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-emerald-500/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Receita Hoje
                  </CardDescription>
                  <CardTitle className="text-2xl text-emerald-500">
                    R$ {analytics?.totalRevenueToday?.toFixed(2) || '0.00'}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Repeat className="h-4 w-4" />
                    Recorrentes
                  </CardDescription>
                  <CardTitle className="text-2xl text-blue-500">
                    {analytics?.recurringCount || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Day Use
                  </CardDescription>
                  <CardTitle className="text-2xl text-orange-500">
                    {analytics?.dayUseCount || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Pagamentos
                  </CardDescription>
                  <CardTitle className="text-2xl text-purple-500">
                    {(analytics?.recurringCount || 0) + (analytics?.dayUseCount || 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Plan Breakdown */}
            {analytics?.planBreakdown && analytics.planBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Vendas por Plano (Hoje)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analytics.planBreakdown.map((item) => (
                      <div key={item.plan} className="text-center p-4 bg-muted rounded-lg">
                        <Badge className={getTierBadgeColor(item.plan)} variant="default">
                          {item.plan.toUpperCase()}
                        </Badge>
                        <p className="text-2xl font-bold mt-2">{item.count}</p>
                        <p className="text-sm text-muted-foreground">R$ {item.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Countries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Top Países
                  </CardTitle>
                  <CardDescription>Países com mais cadastros</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topCountries && analytics.topCountries.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topCountries.map((item: any, index: number) => (
                        <div key={item.code} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-6">{index + 1}.</span>
                            <span className="font-medium">{item.country}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                  )}
                </CardContent>
              </Card>

              {/* Top States */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Top Estados
                  </CardTitle>
                  <CardDescription>Estados com mais cadastros</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topStates && analytics.topStates.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topStates.map((item, index) => (
                        <div key={item.state} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-6">{index + 1}.</span>
                            <span className="font-medium">{BRAZILIAN_STATES[item.state] || item.state}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Cities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Top Cidades
                  </CardTitle>
                  <CardDescription>Cidades com mais cadastros</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topCities && analytics.topCities.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topCities.map((item, index) => (
                        <div key={item.city} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-6">{index + 1}.</span>
                            <span className="font-medium">{item.city}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Today Sales Table */}
            {analytics?.todaySales && analytics.todaySales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Vendas de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.todaySales.map((sale: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{new Date(sale.date).toLocaleTimeString('pt-BR')}</TableCell>
                          <TableCell>{sale.customer_email}</TableCell>
                          <TableCell>
                            <Badge className={getTierBadgeColor(sale.plan)}>{sale.plan}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={sale.type === 'recurring' ? 'border-blue-500/30 text-blue-400' : 'border-orange-500/30 text-orange-400'}>
                              {sale.type === 'recurring' ? 'Recorrente' : 'Day Use'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-emerald-500 font-medium">R$ {sale.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Usage Tab */}
          <TabsContent value="api" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API-Football Usage - REAL DATA */}
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    API-Football
                  </CardTitle>
                  <CardDescription>
                    Consumo real da sua conta API-Football
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.apiUsage?.apiFootballError ? (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-400">{analytics.apiUsage.apiFootballError}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>Plano</span>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {analytics?.apiUsage?.apiFootballPlan || 'Carregando...'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Chamadas Hoje</span>
                        <span className="font-medium">
                          {analytics?.apiUsage?.apiFootballUsed || 0} / {analytics?.apiUsage?.apiFootballLimit || 0}
                        </span>
                      </div>
                      <Progress 
                        value={analytics?.apiUsage?.apiFootballPercentage || 0} 
                        className="h-3"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(analytics?.apiUsage?.apiFootballPercentage || 0) >= 80 ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (analytics?.apiUsage?.apiFootballPercentage || 0) >= 50 ? (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          )}
                          <span className={`text-sm ${
                            (analytics?.apiUsage?.apiFootballPercentage || 0) >= 80 ? 'text-red-500' :
                            (analytics?.apiUsage?.apiFootballPercentage || 0) >= 50 ? 'text-amber-500' :
                            'text-green-500'
                          }`}>
                            {(analytics?.apiUsage?.apiFootballPercentage || 0).toFixed(1)}% utilizado
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {analytics?.apiUsage?.apiFootballRemaining || 0} restantes
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Odds API Usage */}
              <Card className="border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Odds API
                  </CardTitle>
                  <CardDescription>Chamadas nos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-purple-500">{analytics?.apiUsage?.oddsApiUsed || 0}</p>
                    <p className="text-sm text-muted-foreground">chamadas registradas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Resumo de Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-purple-500">{analytics?.todayApiCalls || 0}</p>
                    <p className="text-sm text-muted-foreground">Buscas Hoje</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-cyan-500">{analytics?.totalApiCalls || 0}</p>
                    <p className="text-sm text-muted-foreground">Total de Buscas</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-green-500">
                      {users.length > 0 ? ((analytics?.totalApiCalls || 0) / users.length).toFixed(1) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Média por Usuário</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-amber-500">
                      {analytics?.topStates?.length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Estados Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Marketing Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Envio de Email em Massa
                </CardTitle>
                <CardDescription>Envie emails filtrados por cidade, estado, país ou plano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input
                      placeholder="Ex: São Paulo"
                      value={emailFilters.city}
                      onChange={(e) => setEmailFilters(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select
                      value={emailFilters.state}
                      onValueChange={(value) => setEmailFilters(prev => ({ ...prev, state: value === 'all' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {Object.entries(BRAZILIAN_STATES).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">País</label>
                    <Select
                      value={emailFilters.country_code}
                      onValueChange={(value) => setEmailFilters(prev => ({ ...prev, country_code: value === 'all' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="BR">Brasil</SelectItem>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="US">Estados Unidos</SelectItem>
                        <SelectItem value="AR">Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plano</label>
                    <Select
                      value={emailFilters.subscription_tier}
                      onValueChange={(value) => setEmailFilters(prev => ({ ...prev, subscription_tier: value === 'all' ? '' : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* User Count */}
                {selectedUsers.length > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium">{selectedUsers.length}</span>
                      <span className="text-muted-foreground">usuários selecionados manualmente</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                    >
                      Limpar seleção
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">{filteredUsersCount}</span>
                    <span className="text-muted-foreground">usuários serão notificados (baseado nos filtros)</span>
                  </div>
                )}

                {/* Email Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assunto</label>
                    <Input
                      placeholder="Assunto do email..."
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conteúdo (HTML)</label>
                    <Textarea
                      placeholder="<h1>Olá!</h1><p>Conteúdo do email...</p>"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Send Button */}
                <Button 
                  onClick={handleSendEmail} 
                  disabled={emailLoading || !emailSubject.trim() || !emailContent.trim() || (selectedUsers.length === 0 && filteredUsersCount === 0)}
                  className="w-full"
                >
                  {emailLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para {selectedUsers.length > 0 ? selectedUsers.length : filteredUsersCount} usuários
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backtest Tab */}
          <TabsContent value="backtest" className="space-y-4">
            {/* Latest Backtest Summary */}
            {latestBacktest && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Taxa de Acerto</CardDescription>
                    <CardTitle className={`text-3xl ${latestBacktest.hit_rate >= 55 ? 'text-green-500' : latestBacktest.hit_rate >= 45 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {latestBacktest.hit_rate?.toFixed(1)}%
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>ROI Total</CardDescription>
                    <CardTitle className={`text-3xl ${latestBacktest.total_roi > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {latestBacktest.total_roi > 0 ? '+' : ''}{latestBacktest.total_roi?.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Yield por Aposta</CardDescription>
                    <CardTitle className={`text-3xl ${latestBacktest.yield_per_bet > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(latestBacktest.yield_per_bet * 100)?.toFixed(1)}%
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Recomendações</CardDescription>
                    <CardTitle className="text-3xl text-purple-500">
                      {latestBacktest.total_recommendations}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Run Backtest */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Executar Backtest
                </CardTitle>
                <CardDescription>
                  Simule recomendações passadas com a lógica atual do motor de análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Início</label>
                    <Input
                      type="date"
                      value={backtestDateFrom}
                      onChange={(e) => setBacktestDateFrom(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Fim</label>
                    <Input
                      type="date"
                      value={backtestDateTo}
                      onChange={(e) => setBacktestDateTo(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button onClick={runBacktest} disabled={backtestLoading}>
                    {backtestLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Backtest
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Backtest History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Backtests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {backtestHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Fixtures</TableHead>
                          <TableHead>Recomendações</TableHead>
                          <TableHead>Acertos</TableHead>
                          <TableHead>Taxa</TableHead>
                          <TableHead>ROI</TableHead>
                          <TableHead>Yield</TableHead>
                          <TableHead>Melhor Tipo</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backtestHistory.map((bt) => (
                          <TableRow key={bt.id}>
                            <TableCell className="font-medium">
                              {new Date(bt.date_from).toLocaleDateString('pt-BR')} - {new Date(bt.date_to).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>{bt.total_fixtures}</TableCell>
                            <TableCell>{bt.total_recommendations}</TableCell>
                            <TableCell>
                              <span className="text-green-500">{bt.total_hits}</span>
                              <span className="text-muted-foreground"> / </span>
                              <span className="text-red-500">{bt.total_misses}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={bt.hit_rate >= 55 ? 'bg-green-500/20 text-green-400' : bt.hit_rate >= 45 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                                {bt.hit_rate?.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={bt.total_roi > 0 ? 'text-green-500' : 'text-red-500'}>
                                {bt.total_roi > 0 ? '+' : ''}{bt.total_roi?.toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={bt.yield_per_bet > 0 ? 'text-green-500' : 'text-red-500'}>
                                {(bt.yield_per_bet * 100)?.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {bt.best_bet_type || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(bt.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Nenhum backtest executado ainda. Execute um backtest para ver os resultados.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Usuários</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Selected users action bar */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-4 p-3 mb-4 bg-muted rounded-lg border">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-primary" />
                      <span className="font-medium">{selectedUsers.length}</span>
                      <span className="text-muted-foreground">usuários selecionados</span>
                    </div>
                    <div className="flex-1" />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedUsers([])}
                    >
                      Limpar Seleção
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => {
                        // Switch to email tab with selected users
                        const tabsTrigger = document.querySelector('[value="email"]') as HTMLButtonElement;
                        if (tabsTrigger) tabsTrigger.click();
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                  </div>
                )}
                
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <Checkbox
                              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                              onCheckedChange={toggleAllUsers}
                            />
                          </TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>IP Cadastro</TableHead>
                          <TableHead>Nascimento</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bloqueado</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Buscas Hoje</TableHead>
                          <TableHead>Trial Até</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const maxSearches = user.subscription_status === 'active' 
                            ? TIER_LIMITS[user.subscription_tier as keyof typeof TIER_LIMITS] || 1
                            : 3;

                          return (
                            <TableRow key={user.id} className={user.is_blocked ? 'bg-destructive/10' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.includes(user.user_id)}
                                  onCheckedChange={() => toggleUserSelection(user.user_id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.phone || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{user.registration_ip || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs">
                                  {user.birth_date ? new Date(user.birth_date).toLocaleDateString('pt-BR') : '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getTierBadgeColor(user.subscription_tier)}>
                                  {user.subscription_tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getStatusBadgeColor(user.subscription_status)}>
                                  {user.subscription_status || 'inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.is_blocked ? (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                    <ShieldX className="w-3 h-3 mr-1" />
                                    Bloqueado
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    OK
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={user.stripe_subscription_id 
                                    ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                  }
                                >
                                  {user.stripe_subscription_id ? 'Stripe' : 'Manual'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={user.today_searches >= maxSearches ? 'text-red-400' : ''}>
                                    {user.today_searches}/{maxSearches}
                                  </span>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => setSearchCountInput({ userId: user.user_id, count: String(user.today_searches) })}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Definir Contagem de Buscas</DialogTitle>
                                        <DialogDescription>
                                          Defina quantas buscas o usuário já realizou hoje.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <Input
                                        type="number"
                                        min="0"
                                        value={searchCountInput?.count || '0'}
                                        onChange={(e) => setSearchCountInput(prev => prev ? { ...prev, count: e.target.value } : null)}
                                      />
                                      <DialogFooter>
                                        <Button onClick={handleSetSearchCount}>
                                          <Save className="h-4 w-4 mr-2" />
                                          Salvar
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => handleResetSearches(user.user_id)}
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(user.trial_end_date).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant={user.is_blocked ? "default" : "destructive"}
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        await blockUser(user.user_id, !user.is_blocked, user.is_blocked ? undefined : 'Blocked by admin');
                                        toast.success(user.is_blocked ? 'Usuário desbloqueado' : 'Usuário bloqueado');
                                      } catch (error) {
                                        toast.error('Erro ao alterar bloqueio');
                                      }
                                    }}
                                  >
                                    {user.is_blocked ? (
                                      <>
                                        <ShieldCheck className="h-4 w-4 mr-1" />
                                        Desbloquear
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="h-4 w-4 mr-1" />
                                        Bloquear
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Editar Usuário</DialogTitle>
                                        <DialogDescription>{editingUser?.email}</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">Telefone</label>
                                          <Input
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+55 11999999999"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">Plano</label>
                                          <Select
                                            value={editForm.subscription_tier}
                                            onValueChange={(value) => setEditForm(prev => ({ ...prev, subscription_tier: value }))}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="free">Free</SelectItem>
                                              <SelectItem value="basic">Basic</SelectItem>
                                              <SelectItem value="advanced">Advanced</SelectItem>
                                              <SelectItem value="premium">Premium</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-sm font-medium">Status da Assinatura</label>
                                          <Select
                                            value={editForm.subscription_status}
                                            onValueChange={(value) => setEditForm(prev => ({ ...prev, subscription_status: value }))}
                                          >
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="active">Ativo</SelectItem>
                                              <SelectItem value="inactive">Inativo</SelectItem>
                                              <SelectItem value="past_due">Pendente</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button onClick={handleSaveUser}>
                                          <Save className="h-4 w-4 mr-2" />
                                          Salvar
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteUser(user.user_id, user.email)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
