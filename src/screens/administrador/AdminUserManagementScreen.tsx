import { useState } from 'react';
import { Users, Plus, Edit, Power, Search, Filter, Mail, Phone, Calendar, Check, X, Trash2, UserCheck } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'gestor' | 'colaborador';
  position?: string; // Cargo obrigatório para colaboradores
  team?: string;
  areas?: ('norte' | 'sul' | 'leste' | 'oeste' | 'centro')[]; // Áreas de responsabilidade (apenas para gestores)
  status: 'active' | 'inactive';
  createdAt: string;
  lastAccess?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Paula Rodrigues',
    email: 'ana.rodrigues@hive.com',
    phone: '(11) 98765-4321',
    role: 'gestor',
    team: 'Equipe Alpha',
    areas: ['norte', 'centro'],
    status: 'active',
    createdAt: '15/01/2025',
    lastAccess: 'Hoje às 14:30'
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@hive.com',
    phone: '(11) 97654-3210',
    role: 'colaborador',
    position: 'Faxineiro(a)',
    team: 'Equipe Alpha',
    status: 'active',
    createdAt: '20/01/2025',
    lastAccess: 'Hoje às 15:45'
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@hive.com',
    phone: '(11) 96543-2109',
    role: 'gestor',
    team: 'Equipe Beta',
    areas: ['sul', 'oeste'],
    status: 'active',
    createdAt: '10/01/2025',
    lastAccess: 'Ontem às 18:20'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    email: 'roberto.silva@hive.com',
    phone: '(11) 95432-1098',
    role: 'colaborador',
    position: 'Porteiro',
    team: 'Equipe Beta',
    status: 'active',
    createdAt: '25/01/2025',
    lastAccess: 'Hoje às 09:15'
  },
  {
    id: '5',
    name: 'Juliana Santos',
    email: 'juliana.santos@hive.com',
    phone: '(11) 94321-0987',
    role: 'colaborador',
    position: 'Recepcionista',
    team: 'Equipe Gamma',
    status: 'inactive',
    createdAt: '05/01/2025',
    lastAccess: '15/09/2025'
  },
  {
    id: '6',
    name: 'Pedro Costa',
    email: 'pedro.costa@hive.com',
    phone: '(11) 93210-9876',
    role: 'gestor',
    team: 'Equipe Gamma',
    areas: ['leste'],
    status: 'active',
    createdAt: '08/01/2025',
    lastAccess: 'Hoje às 11:00'
  },
  {
    id: '7',
    name: 'Marina Oliveira',
    email: 'marina.oliveira@hive.com',
    phone: '(11) 92109-8765',
    role: 'colaborador',
    position: 'Serviços Gerais',
    team: 'Equipe Alpha',
    status: 'active',
    createdAt: '18/01/2025',
    lastAccess: 'Hoje às 16:30'
  },
  {
    id: '8',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@hive.com',
    phone: '(11) 91098-7654',
    role: 'colaborador',
    position: 'Zelador',
    team: 'Equipe Beta',
    status: 'inactive',
    createdAt: '12/01/2025',
    lastAccess: '20/09/2025'
  }
];

const teams = ['Equipe Alpha', 'Equipe Beta', 'Equipe Gamma', 'Equipe Delta'];
const positions = ['Faxineiro(a)', 'Serviços Gerais', 'Porteiro', 'Recepcionista', 'Zelador', 'Segurança Armada', 'Vigia'];

interface UserManagementScreenProps {
  onBack?: () => void;
}

export default function UserManagementScreen({ onBack }: UserManagementScreenProps) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  
  // Form states
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
    if (!editingUser) return true; // Se está criando, sempre habilita
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleSaveUser = () => {
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
      ...formData,
      position: formData.position || undefined,
      team: formData.team || undefined,
      areas: formData.role === 'gestor' ? formData.areas : undefined
    };
    
    if (editingUser) {
      // Editar usuário existente
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...userData }
          : u
      ));
      toast.success('Usuário atualizado com sucesso!', {
        description: `As informações de "${formData.name}" foram atualizadas.`
      });
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: (users.length + 1).toString(),
        ...userData,
        createdAt: new Date().toLocaleDateString('pt-BR'),
        lastAccess: 'Nunca acessou'
      };
      setUsers([...users, newUser]);
      toast.success('Usuário criado com sucesso!', {
        description: `O usuário "${formData.name}" foi adicionado ao sistema.`
      });
    }
    handleCloseDialog();
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: newStatus }
        : u
    ));
    toast.success(
      `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`,
      { description: `O usuário "${user.name}" foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.` }
    );
  };

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = () => {
    if (deleteConfirmUser) {
      setUsers(users.filter(u => u.id !== deleteConfirmUser.id));
      toast.success('Usuário excluído com sucesso!', {
        description: `O usuário "${deleteConfirmUser.name}" foi removido do sistema.`
      });
      setDeleteConfirmUser(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Tabs value={filterRole} onValueChange={setFilterRole} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="gestor">Gestores</TabsTrigger>
                <TabsTrigger value="colaborador">Colaboradores</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Status Filter */}
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
                  {/* User Info */}
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

                  {/* Actions */}
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

        {/* Summary */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#6400A4' }}>{filteredUsers.length}</span> de{' '}
              <span style={{ color: '#6400A4' }}>{users.length}</span> usuários
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit User Dialog */}
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
            {/* Name */}
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

            {/* Email */}
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

            {/* Phone */}
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

            {/* Role and Team */}
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

            {/* Áreas de responsabilidade (apenas para gestores) */}
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

            {/* Position (obrigatório apenas para colaboradores) */}
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

            {/* Status (only for editing) */}
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
                !hasUserChanges()
              }
            >
              <Check className="h-4 w-4 mr-2" />
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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