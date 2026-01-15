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
import { ArrowLeft, RefreshCw, Users, Search, Edit, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Loading } from '@/components/Loading';

const TIER_LIMITS = {
  free: 0,
  basic: 1,
  advanced: 3,
  premium: 6
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading, users, usersLoading, fetchUsers, updateUser, resetSearches, setSearchCount } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    subscription_tier: '',
    subscription_status: '',
    is_active: true
  });
  const [searchCountInput, setSearchCountInput] = useState<{ userId: string; count: string } | null>(null);

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
    }
  }, [isAdmin]);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      subscription_tier: user.subscription_tier,
      subscription_status: user.subscription_status || 'inactive',
      is_active: user.is_active
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const updates: any = {
        subscription_tier: editForm.subscription_tier,
        subscription_status: editForm.subscription_status,
        is_active: editForm.is_active
      };

      if (editForm.subscription_status === 'active') {
        updates.subscription_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      await updateUser(editingUser.user_id, updates);
      toast.success('Usuário atualizado com sucesso');
      setEditingUser(null);
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
          <Button onClick={() => fetchUsers()} disabled={usersLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        {/* Users Table */}
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
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Buscas Hoje</TableHead>
                      <TableHead>Trial Até</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const maxSearches = user.subscription_status === 'active' 
                        ? TIER_LIMITS[user.subscription_tier as keyof typeof TIER_LIMITS] || 1
                        : 3; // trial

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
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
                                        <SelectItem value="inactive">Inativo</SelectItem>
                                        <SelectItem value="active">Ativo</SelectItem>
                                        <SelectItem value="past_due">Pagamento Atrasado</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="is_active"
                                      checked={editForm.is_active}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                      className="rounded"
                                    />
                                    <label htmlFor="is_active" className="text-sm">Usuário Ativo</label>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={handleSaveUser}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
      </div>
    </div>
  );
}
