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
  Send, DollarSign, CreditCard, Repeat, Calendar, Gauge, Zap, AlertCircle, Trash2, CheckSquare, Square,
  BookOpen, Clock, Wifi, WifiOff, Filter
} from 'lucide-react';
import { TechnicalDocsTab } from '@/components/admin/TechnicalDocsTab';
import { BacktestDashboard } from '@/components/admin/BacktestDashboard';
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

// Format relative time (e.g. "há 3 min", "há 2h", "há 3 dias")
const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 30) return `há ${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
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
  // User table filters
  const [filterTier, setFilterTier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterOnline, setFilterOnline] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
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
  const [showPreview, setShowPreview] = useState(false);

  // Professional HTML Email Template
  const generateEmailTemplate = (title: string, bodyContent: string) => {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0f1a;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 100%);">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background: linear-gradient(180deg, #1a2035 0%, #141824 100%); border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.2);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid rgba(0, 255, 255, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <div style="display: inline-block; background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 180, 200, 0.1)); padding: 16px 32px; border-radius: 12px; border: 1px solid rgba(0, 255, 255, 0.3);">
                      <span style="font-size: 28px; font-weight: 800; background: linear-gradient(90deg, #00ffff, #00b4c8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: 2px;">⚡ EUGINE</span>
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 12px; letter-spacing: 1px;">INTELIGÊNCIA ESPORTIVA AVANÇADA</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.4;">${title}</h1>
              <div style="color: #cbd5e1; font-size: 16px; line-height: 1.8;">
                ${bodyContent}
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <a href="https://game-smart-pro.lovable.app" style="display: inline-block; background: linear-gradient(135deg, #00ffff 0%, #00b4c8 100%); color: #0a0f1a; font-weight: 700; font-size: 16px; text-decoration: none; padding: 16px 40px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 255, 255, 0.3);">
                Acessar Eugine →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); border-radius: 0 0 16px 16px; border-top: 1px solid rgba(0, 255, 255, 0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">
                      <strong style="color: #00ffff;">Eugine</strong> - Análise esportiva com Inteligência Artificial
                    </p>
                    <p style="color: #475569; font-size: 12px; margin: 0 0 8px 0;">
                      © ${new Date().getFullYear()} Eugine. Todos os direitos reservados.
                    </p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">
                      Este email foi enviado para você porque você é um usuário registrado do Eugine.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
        <!-- Unsubscribe Link -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 20px auto 0 auto;">
          <tr>
            <td style="text-align: center;">
              <p style="color: #475569; font-size: 11px; margin: 0;">
                Se você não deseja mais receber emails, entre em contato conosco.
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  // Quick template presets
  const emailTemplates = [
    {
      name: 'Novidade/Atualização',
      subject: '🚀 Nova funcionalidade no Eugine!',
      body: `<p>Temos uma novidade incrível para você!</p>
<p>[Descreva a novidade aqui]</p>
<p>Esta atualização foi pensada para melhorar ainda mais sua experiência de análise esportiva.</p>
<p><strong>Principais melhorias:</strong></p>
<ul>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Melhoria 1</li>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Melhoria 2</li>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Melhoria 3</li>
</ul>`
    },
    {
      name: 'Promoção',
      subject: '🔥 Oferta Especial - Tempo Limitado!',
      body: `<p style="font-size: 18px; color: #00ffff; font-weight: bold;">Aproveite nossa oferta exclusiva!</p>
<p>Por tempo limitado, estamos oferecendo condições especiais para você:</p>
<div style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
  <p style="font-size: 32px; color: #00ffff; font-weight: 800; margin: 0;">XX% OFF</p>
  <p style="color: #94a3b8; margin: 8px 0 0 0;">em todos os planos</p>
</div>
<p>Não perca essa oportunidade de turbinar suas análises com Eugine!</p>`
    },
    {
      name: 'Lembrete Trial',
      subject: '⏰ Seu período de teste está acabando!',
      body: `<p>Olá!</p>
<p>Seu período de teste gratuito do Eugine está chegando ao fim.</p>
<p>Durante estes dias, você teve acesso a:</p>
<ul>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Análises Premium com IA avançada</li>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Estatísticas detalhadas de times</li>
  <li style="color: #00ffff; margin-bottom: 8px;">✅ Recomendações baseadas em dados</li>
</ul>
<p><strong>Não deixe de aproveitar!</strong> Assine agora e continue com acesso completo.</p>`
    },
    {
      name: 'Relatório Semanal',
      subject: '📊 Seu Relatório Semanal Eugine',
      body: `<p>Confira o resumo da semana no Eugine:</p>
<div style="background: rgba(0, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid rgba(0, 255, 255, 0.2);">
        <span style="color: #94a3b8;">Jogos analisados:</span>
        <span style="color: #00ffff; font-weight: bold; float: right;">XX</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid rgba(0, 255, 255, 0.2);">
        <span style="color: #94a3b8;">Taxa de acerto:</span>
        <span style="color: #22c55e; font-weight: bold; float: right;">XX%</span>
      </td>
    </tr>
    <tr>
      <td style="padding: 12px;">
        <span style="color: #94a3b8;">Melhores ligas:</span>
        <span style="color: #ffffff; font-weight: bold; float: right;">Liga A, Liga B</span>
      </td>
    </tr>
  </table>
</div>
<p>Continue acompanhando suas análises para melhores resultados!</p>`
    }
  ];

  const applyTemplate = (template: typeof emailTemplates[0]) => {
    setEmailSubject(template.subject);
    setEmailContent(generateEmailTemplate(template.subject.replace(/^[^\s]+ /, ''), template.body));
  };
  const [filteredUsersCount, setFilteredUsersCount] = useState(0);
  
  // Backtest state removed - now handled by BacktestDashboard component

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier;
    const matchesStatus = filterStatus === 'all' || (user.subscription_status || 'inactive') === filterStatus;
    const matchesState = filterState === 'all' || user.state === filterState;
    const matchesOnline = filterOnline === 'all' || 
      (filterOnline === 'online' && user.is_online) || 
      (filterOnline === 'offline' && !user.is_online);
    const matchesSource = filterSource === 'all' || 
      (filterSource === 'free' && (user as any).registration_source === 'free') ||
      (filterSource === 'organic' && (user as any).registration_source !== 'free' && !user.stripe_subscription_id) ||
      (filterSource === 'stripe' && !!user.stripe_subscription_id);
    return matchesSearch && matchesTier && matchesStatus && matchesState && matchesOnline && matchesSource;
  });

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
          <Card className="border-green-500/30">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Wifi className="h-3 w-3 text-green-500" />
                Online Agora
              </CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {users.filter(u => u.is_online).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Vendas Hoje</CardDescription>
              <CardTitle className="text-3xl text-emerald-500">
                $ {analytics?.totalRevenueToday?.toFixed(2) || '0.00'}
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
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentação
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
                    $ {analytics?.totalRevenueToday?.toFixed(2) || '0.00'}
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
                        <p className="text-sm text-muted-foreground">$ {item.revenue.toFixed(2)}</p>
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
                          <TableCell className="text-emerald-500 font-medium">$ {sale.amount.toFixed(2)}</TableCell>
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

                {/* Quick Templates */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Templates Rápidos</label>
                  <div className="flex flex-wrap gap-2">
                    {emailTemplates.map((template, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                        className="text-xs"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Conteúdo (HTML)</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'Editar' : 'Preview'}
                      </Button>
                    </div>
                    {showPreview ? (
                      <div 
                        className="border rounded-lg overflow-hidden bg-[#0a0f1a] min-h-[400px]"
                        dangerouslySetInnerHTML={{ __html: emailContent }}
                      />
                    ) : (
                      <Textarea
                        placeholder="Cole seu HTML aqui ou use um template rápido acima..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                      />
                    )}
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
            <BacktestDashboard />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2">
                    Usuários
                    <Badge variant="secondary">{filteredUsers.length}/{users.length}</Badge>
                  </CardTitle>
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
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filtros:
                  </div>
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Planos</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="past_due">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterOnline} onValueChange={setFilterOnline}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Online" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="online">🟢 Online</SelectItem>
                      <SelectItem value="offline">⚫ Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSource} onValueChange={setFilterSource}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Origens</SelectItem>
                      <SelectItem value="free">🎁 Grátis</SelectItem>
                      <SelectItem value="organic">Orgânico</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Estados</SelectItem>
                      {Object.entries(BRAZILIAN_STATES).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(filterTier !== 'all' || filterStatus !== 'all' || filterOnline !== 'all' || filterSource !== 'all' || filterState !== 'all') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={() => {
                        setFilterTier('all');
                        setFilterStatus('all');
                        setFilterOnline('all');
                        setFilterSource('all');
                        setFilterState('all');
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  )}
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
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>IP Cadastro</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Assinatura</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Buscas Hoje</TableHead>
                          <TableHead>Último Acesso</TableHead>
                          <TableHead>Cadastro</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => {
                          const maxSearches = user.subscription_status === 'active' 
                            ? TIER_LIMITS[user.subscription_tier as keyof typeof TIER_LIMITS] || 1
                            : (user as any).registration_source === 'free' ? 1 : 3;

                          return (
                            <TableRow key={user.id} className={user.is_blocked ? 'bg-destructive/10' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.includes(user.user_id)}
                                  onCheckedChange={() => toggleUserSelection(user.user_id)}
                                />
                              </TableCell>
                              {/* Online status */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-3 w-3">
                                    {user.is_online ? (
                                      <>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                                      </>
                                    ) : (
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-muted-foreground/30" />
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.is_online ? 'Online' : 'Offline'}
                                  </span>
                                  {user.is_blocked && (
                                    <ShieldX className="w-3 h-3 text-destructive" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-sm">{user.email}</TableCell>
                              <TableCell className="text-xs">{user.phone || '-'}</TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground font-mono">{user.registration_ip || '-'}</span>
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
                                <Badge 
                                  variant="outline" 
                                  className={
                                    (user as any).registration_source === 'free' 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : user.stripe_subscription_id 
                                        ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                  }
                                >
                                  {(user as any).registration_source === 'free' ? '🎁 Grátis' : (user.stripe_subscription_id ? 'Stripe' : 'Orgânico')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className={user.today_searches >= maxSearches ? 'text-red-400 font-bold' : ''}>
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
                              {/* Last access */}
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {user.last_active_at 
                                      ? formatRelativeTime(user.last_active_at)
                                      : '-'}
                                  </span>
                                </div>
                              </TableCell>
                              {/* Registration date */}
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </span>
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

          {/* Technical Documentation Tab */}
          <TabsContent value="docs" className="space-y-4">
            <TechnicalDocsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
