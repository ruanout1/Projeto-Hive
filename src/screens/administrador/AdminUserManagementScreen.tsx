import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Power, Search, Filter, Mail, Phone, Calendar, Check, X, Trash2, UserCheck } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { HighlightText } from '../../components/ui/search-highlight';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================
const API_URL = 'http://localhost:3000/api';

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Função helper para criar headers com autenticação
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'gestor' | 'colaborador';
  position?: string;
  team?: string;
  areas?: ('norte' | 'sul' | 'leste' | 'oeste' | 'centro')[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastAccess?: string;
}

const teams = ['Equipe Alpha', 'Equipe Beta', 'Equipe Gamma', 'Equipe Delta'];
const positions = ['Faxineiro(a)', 'Serviços Gerais', 'Porteiro', 'Recepcionista', 'Zelador', 'Segurança Armada', 'Vigia'];

interface AdminUserManagementScreenProps {
  onBack?: () => void;
}

export default function AdminUserManagementScreen({ onBack }: AdminUserManagementScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'colaborador' as 'gestor' | 'colaborador',
    position: '',
    team: '',
    areas: [] as ('norte' | 'sul' | 'leste' | 'oeste' | 'centro')[],
    status: 'active' as 'active' | 'inactive'
  });
  
  const [originalFormData, setOriginalFormData] = useState(formData);

  // ==========================================
  // FUNÇÕES DA API
  // ==========================================

  // Buscar usuários do backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleSaveUser = async () => {
    // Validações
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (formData.role === 'colaborador' && !formData.position) {
      toast.error('Selecione um cargo para o colaborador!');
      return;
    }

    if (formData.role === 'gestor' && formData.areas.length === 0) {
      toast.error('Selecione pelo menos uma área de responsabilidade para o gestor!');
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      position: formData.position || undefined,
      team: formData.team || undefined,
      areas: formData.role === 'gestor' ? formData.areas : undefined,
      status: formData.status
    };
    
    try {
      if (editingUser) {
        // EDITAR USUÁRIO
        const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          return;
        }
        
        if (data.success) {
          await fetchUsers();
          toast.success('Usuário atualizado com sucesso!', {
            description: `As informações de "${formData.name}" foram atualizadas.`
          });
        } else {
          toast.error(data.message || 'Erro ao atualizar usuário');
        }
      } else {
        // CRIAR NOVO USUÁRIO
        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          return;
        }
        
        if (data.success) {
          await fetchUsers();
          toast.success('Usuário criado com sucesso!', {
            description: `O usuário "${formData.name}" foi adicionado. Senha padrão: ${data.data.defaultPassword}`
          });
        } else {
          toast.error(data.message || 'Erro ao criar usuário');
        }
      }
      
      handleCloseDialog();
      
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      
      if (data.success) {
        await fetchUsers();
        
        const user = users.find(u => u.id === userId);
        const newStatus = data.data.status === 'active' ? 'ativado' : 'desativado';
        
        toast.success(`Usuário ${newStatus} com sucesso!`, {
          description: `O usuário "${user?.name}" foi ${newStatus}.`
        });
      } else {
        toast.error(data.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmUser) {
      try {
        const response = await fetch(`${API_URL}/users/${deleteConfirmUser.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.');
          setDeleteConfirmUser(null);
          return;
        }
        
        if (data.success) {
          await fetchUsers();
          toast.success('Usuário excluído com sucesso!', {
            description: `O usuário "${deleteConfirmUser.name}" foi removido do sistema.`
          });
        } else {
          toast.error(data.message || 'Erro ao excluir usuário');
        }
        
        setDeleteConfirmUser(null);
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        toast.error('Erro ao conectar com o servidor');
      }
    }
  };

  const activeCount = users.filter(u => u.status === 'active').length;
  const inactiveCount = users.filter(u => u.status === 'inactive').length;
  const gestorCount = users.filter(u => u.role === 'gestor').length;
  const colaboradorCount = users.filter(u => u.role === 'colaborador').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = filterRole === 'todos' || user.role === filterRole;
    const matchesStatus = filterStatus === 'todos' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      const initialFormData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        position: user.position || '',
        team: user.team || '',
        areas: user.areas || [],
        status: user.status
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'colaborador',
        position: '',
        team: '',
        areas: [],
        status: 'active'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const hasUserChanges = () => {
    if (!editingUser) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // TELA DE LOADING
  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 animate-pulse" style={{ color: '#6400A4' }} />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Gerenciamento de Usuários"
                description="Gerencie gestores e colaboradores da sua equipe"
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{users.length}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativos</p>
                  <p className="text-2xl text-green-600">{activeCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gestores</p>
                  <p className="text-2xl text-gray-800">{gestorCount}</p>
                </div>
                <Users className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Colaboradores</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{colaboradorCount}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={filterRole} onValueChange={setFilterRole} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="gestor">Gestores</TabsTrigger>
                <TabsTrigger value="colaborador">Colaboradores</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos Status</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: user.status === 'active' ? '#6400A4' : '#9CA3AF' }}>
                      <AvatarFallback style={{ backgroundColor: user.status === 'active' ? '#6400A4' : '#9CA3AF', color: 'white' }}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 style={{ color: '#6400A4' }}>
                          <HighlightText text={user.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: user.role === 'gestor' ? '#8B20EE' : '#35BAE6',
                            color: user.role === 'gestor' ? '#8B20EE' : '#35BAE6'
                          }}
                        >
                          {user.role === 'gestor' ? 'Gestor' : 'Colaborador'}
                        </Badge>
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          style={user.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                        >
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                          <span className="truncate"><HighlightText text={user.email} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                        </div>
                        <div className="flex items-center space-x-2 min-w-0">
                          <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                          <span className="truncate"><HighlightText text={user.phone} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                        </div>
                        {user.position && (
                          <div className="flex items-center space-x-2 min-w-0">
                            <UserCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate" style={{ color: '#35BAE6' }}><HighlightText text={user.position} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                          </div>
                        )}
                        {user.team && (
                          <div className="flex items-center space-x-2 min-w-0">
                            <Users className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate"><HighlightText text={user.team} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" style={{ color: '#8B20EE' }} />
                          <span>Criado em {user.createdAt}</span>
                        </div>
                        {user.lastAccess && (
                          <div className="flex items-center space-x-1">
                            <span>Último acesso: {user.lastAccess}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(user)}
                      style={{ borderColor: '#6400A4', color: '#6400A4' }}
                      className="hover:bg-purple-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id)}
                      style={{
                        borderColor: user.status === 'active' ? '#EF4444' : '#10B981',
                        color: user.status === 'active' ? '#EF4444' : '#10B981'
                      }}
                      className={user.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                    >
                      <Power className="h-4 w-4 mr-2" />
                      {user.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      style={{ borderColor: '#EF4444', color: '#EF4444' }}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#6400A4' }}>{filteredUsers.length}</span> de{' '}
              <span style={{ color: '#6400A4' }}>{users.length}</span> usuários
            </p>
          </div>
        )}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" style={{ color: '#6400A4' }}>Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome completo"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" style={{ color: '#6400A4' }}>Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" style={{ color: '#6400A4' }}>Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role" style={{ color: '#6400A4' }}>Tipo de Usuário *</Label>
                <Select value={formData.role} onValueChange={(value: 'gestor' | 'colaborador') => setFormData({ ...formData, role: value, position: value === 'gestor' ? '' : formData.position })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team" style={{ color: '#6400A4' }}>Equipe (Opcional)</Label>
                <Select value={formData.team || 'none'} onValueChange={(value) => setFormData({ ...formData, team: value === 'none' ? '' : value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Definir depois</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === 'gestor' && (
              <div>
                <Label style={{ color: '#6400A4' }}>Áreas de Responsabilidade *</Label>
                <div className="mt-2 space-y-2 p-3 border rounded-lg max-h-48 overflow-y-auto" style={{ borderColor: 'rgba(100, 0, 164, 0.2)' }}>
                  {(['norte', 'sul', 'leste', 'oeste', 'centro'] as const).map((area) => {
                    const isChecked = formData.areas.includes(area);
                    return (
                      <div key={area} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`area-${area}`}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, areas: [...formData.areas, area] });
                            } else {
                              setFormData({ ...formData, areas: formData.areas.filter(a => a !== area) });
                            }
                          }}
                          className="h-4 w-4 rounded"
                          style={{ accentColor: '#6400A4' }}
                        />
                        <Label htmlFor={`area-${area}`} className="text-sm cursor-pointer">
                          {area.charAt(0).toUpperCase() + area.slice(1)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O gestor receberá apenas solicitações das áreas selecionadas
                </p>
              </div>
            )}

            {formData.role === 'colaborador' && (
              <div>
                <Label htmlFor="position" style={{ color: '#35BAE6' }}>Cargo *</Label>
                <Select value={formData.position || 'none'} onValueChange={(value) => setFormData({ ...formData, position: value === 'none' ? '' : value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o cargo do colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione um cargo</SelectItem>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Este campo é obrigatório para colaboradores
                </p>
              </div>
            )}

            {editingUser && (
              <div>
                <Label htmlFor="status" style={{ color: '#6400A4' }}>Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUser}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
              disabled={
                !formData.name || 
                !formData.email || 
                !formData.phone || 
                !formData.role || 
                (formData.role === 'colaborador' && !formData.position) ||
                (formData.role === 'gestor' && formData.areas.length === 0) ||
                !hasUserChanges()
              }
            >
              <Check className="h-4 w-4 mr-2" />
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteConfirmUser} onOpenChange={() => setDeleteConfirmUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#6400A4' }}>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#000000' }}>
              Tem certeza que deseja excluir o usuário <strong>{deleteConfirmUser?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
              className="hover:opacity-90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}