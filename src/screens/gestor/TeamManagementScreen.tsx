import { useState } from 'react';
import { Users, Plus, Edit, Power, Search, Trash2, Check, X, UserPlus, ChevronRight } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Checkbox } from '../../components/ui/checkbox';
import { HighlightText } from '../../components/ui/search-highlight';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  manager: User;
  members: User[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'colaborador';
}

// Mock data
const mockUsers: User[] = [
  { id: '1', name: 'Ana Paula Rodrigues', email: 'ana.rodrigues@hive.com', role: 'gestor' },
  { id: '2', name: 'Carlos Mendes', email: 'carlos.mendes@hive.com', role: 'colaborador' },
  { id: '3', name: 'Fernanda Lima', email: 'fernanda.lima@hive.com', role: 'gestor' },
  { id: '4', name: 'Roberto Silva', email: 'roberto.silva@hive.com', role: 'colaborador' },
  { id: '5', name: 'Juliana Santos', email: 'juliana.santos@hive.com', role: 'colaborador' },
  { id: '6', name: 'Pedro Costa', email: 'pedro.costa@hive.com', role: 'gestor' },
  { id: '7', name: 'Marina Oliveira', email: 'marina.oliveira@hive.com', role: 'colaborador' },
  { id: '8', name: 'Lucas Ferreira', email: 'lucas.ferreira@hive.com', role: 'colaborador' }
];

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Equipe Alpha',
    manager: mockUsers[0],
    members: [mockUsers[1], mockUsers[6]],
    status: 'active',
    createdAt: '15/01/2025'
  },
  {
    id: '2',
    name: 'Equipe Beta',
    manager: mockUsers[2],
    members: [mockUsers[3]],
    status: 'active',
    createdAt: '10/01/2025'
  },
  {
    id: '3',
    name: 'Equipe Gamma',
    manager: mockUsers[5],
    members: [mockUsers[4]],
    status: 'inactive',
    createdAt: '05/01/2025'
  }
];

type DialogStep = 'name' | 'manager' | 'members' | null;
type DialogMode = 'create' | 'edit';

interface TeamManagementScreenProps {
  onBack?: () => void;
}

export default function TeamManagementScreen({ onBack }: TeamManagementScreenProps) {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [dialogStep, setDialogStep] = useState<DialogStep>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>('create');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<Team | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    memberIds: [] as string[]
  });
  
  const [originalFormData, setOriginalFormData] = useState(formData);

  const activeCount = teams.filter(t => t.status === 'active').length;
  const inactiveCount = teams.filter(t => t.status === 'inactive').length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.members.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'todos' || team.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const availableManagers = mockUsers.filter(u => u.role === 'gestor');
  const availableMembers = mockUsers.filter(u => u.role === 'colaborador');

  const handleOpenTeamDetail = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamDetailOpen(true);
  };

  const handleCloseTeamDetail = () => {
    setIsTeamDetailOpen(false);
    setSelectedTeam(null);
  };

  const handleOpenDialog = (team?: Team) => {
    handleCloseTeamDetail();
    if (team) {
      // Modo de edição - formulário simples
      setEditingTeam(team);
      setDialogMode('edit');
      const initialFormData = {
        name: team.name,
        managerId: team.manager.id,
        memberIds: team.members.map(m => m.id)
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      setDialogStep(null); // Não usa steps no modo edição
    } else {
      // Modo de criação - wizard
      setEditingTeam(null);
      setDialogMode('create');
      setFormData({
        name: '',
        managerId: '',
        memberIds: []
      });
      setDialogStep('name'); // Inicia o wizard
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogStep(null);
    setDialogMode('create');
    setEditingTeam(null);
  };

  const handleNextStep = () => {
    if (dialogStep === 'name' && formData.name) {
      setDialogStep('manager');
    } else if (dialogStep === 'manager' && formData.managerId) {
      setDialogStep('members');
    }
  };

  const handlePreviousStep = () => {
    if (dialogStep === 'members') {
      setDialogStep('manager');
    } else if (dialogStep === 'manager') {
      setDialogStep('name');
    }
  };

  const hasTeamChanges = () => {
    if (!editingTeam) return true; // Se está criando, sempre habilita
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleSaveTeam = () => {
    const manager = mockUsers.find(u => u.id === formData.managerId);
    const members = mockUsers.filter(u => formData.memberIds.includes(u.id));

    if (!manager) return;

    if (editingTeam) {
      // Editar equipe existente
      setTeams(teams.map(t => 
        t.id === editingTeam.id 
          ? { ...t, name: formData.name, manager, members }
          : t
      ));
      toast.success('Equipe atualizada com sucesso!', {
        description: `A equipe "${formData.name}" foi atualizada.`
      });
    } else {
      // Criar nova equipe
      const newTeam: Team = {
        id: (teams.length + 1).toString(),
        name: formData.name,
        manager,
        members,
        status: 'active',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setTeams([...teams, newTeam]);
      toast.success('Equipe criada com sucesso!', {
        description: `A equipe "${formData.name}" foi criada.`
      });
    }
    handleCloseDialog();
  };

  const handleToggleStatus = (team: Team) => {
    const newStatus = team.status === 'active' ? 'inactive' : 'active';
    setTeams(teams.map(t => 
      t.id === team.id 
        ? { ...t, status: newStatus }
        : t
    ));
    toast.success(
      `Equipe ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`,
      { description: `A equipe "${team.name}" foi ${newStatus === 'active' ? 'ativada' : 'desativada'}.` }
    );
    handleCloseTeamDetail();
  };

  const handleDeleteTeam = (team: Team) => {
    setDeleteConfirmTeam(team);
  };

  const confirmDeleteTeam = () => {
    if (deleteConfirmTeam) {
      setTeams(teams.filter(t => t.id !== deleteConfirmTeam.id));
      toast.success('Equipe excluída com sucesso!', {
        description: `A equipe "${deleteConfirmTeam.name}" foi removida do sistema.`
      });
      setDeleteConfirmTeam(null);
      handleCloseTeamDetail();
    }
  };

  const toggleMember = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
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
                title="Gerenciamento de Equipes"
                description="Crie e gerencie equipes com gestores e colaboradores"
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Equipes</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{teams.length}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Equipes Ativas</p>
                  <p className="text-2xl text-green-600">{activeCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Membros</p>
                  <p className="text-2xl text-gray-800">{totalMembers}</p>
                </div>
                <UserPlus className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gestores</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{availableManagers.length}</p>
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
                placeholder="Buscar por nome da equipe, gestor ou membro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todas</TabsTrigger>
                <TabsTrigger value="active">Ativas</TabsTrigger>
                <TabsTrigger value="inactive">Inativas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredTeams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma equipe encontrada</p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => handleOpenTeamDetail(team)}
                className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                      <Users className="h-6 w-6" style={{ color: '#8B20EE' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 style={{ color: '#8B20EE' }}>
                          <HighlightText text={team.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                        <Badge
                          variant={team.status === 'active' ? 'default' : 'secondary'}
                          style={team.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                        >
                          {team.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Gestor: {team.manager.name}</span>
                        <span>•</span>
                        <span>{team.members.length} colaborador{team.members.length !== 1 ? 'es' : ''}</span>
                        <span>•</span>
                        <span className="text-xs">Criada em {team.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredTeams.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredTeams.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{teams.length}</span> equipes
            </p>
          </div>
        )}
      </div>

      {/* Team Detail Dialog */}
      <Dialog open={isTeamDetailOpen} onOpenChange={handleCloseTeamDetail}>
        <DialogContent className="max-w-3xl">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle className="modal-title-purple">{selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Visualize e gerencie as informações da equipe
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status */}
                <div className="flex items-center justify-center">
                  <Badge
                    variant={selectedTeam.status === 'active' ? 'default' : 'secondary'}
                    style={selectedTeam.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                    className="text-sm px-4 py-1"
                  >
                    {selectedTeam.status === 'active' ? 'Equipe Ativa' : 'Equipe Inativa'}
                  </Badge>
                </div>

                {/* Manager */}
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">Gestor Responsável:</h4>
                  <div className="flex items-center space-x-3 bg-purple-50 rounded-xl p-4">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                      <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                        {getInitials(selectedTeam.manager.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p style={{ color: '#6400A4' }}>{selectedTeam.manager.name}</p>
                      <p className="text-sm text-gray-500">{selectedTeam.manager.email}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">
                    Colaboradores ({selectedTeam.members.length}):
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                    {selectedTeam.members.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-400 italic">Nenhum colaborador adicionado</p>
                      </div>
                    ) : (
                      selectedTeam.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 bg-blue-50 rounded-xl p-3"
                        >
                          <Avatar className="h-10 w-10" style={{ backgroundColor: '#35BAE6' }}>
                            <AvatarFallback style={{ backgroundColor: '#35BAE6', color: 'white' }}>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Equipe criada em {selectedTeam.createdAt}
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenDialog(selectedTeam)}
                  style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                  className="hover:bg-purple-50 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Equipe
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleToggleStatus(selectedTeam)}
                  style={{
                    borderColor: selectedTeam.status === 'active' ? '#EF4444' : '#10B981',
                    color: selectedTeam.status === 'active' ? '#EF4444' : '#10B981'
                  }}
                  className={`w-full sm:w-auto ${selectedTeam.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {selectedTeam.status === 'active' ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteTeam(selectedTeam)}
                  style={{ borderColor: '#EF4444', color: '#EF4444' }}
                  className="hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Equipe
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Team Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {dialogMode === 'edit' ? 'Editar Equipe' : 'Nova Equipe'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Atualize as informações da equipe' : 'Crie uma nova equipe em 3 passos simples'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Edit Mode - Simple Form */}
            {dialogMode === 'edit' && (
              <div className="space-y-6">
                {/* Nome da Equipe */}
                <div>
                  <Label htmlFor="teamName" style={{ color: '#8B20EE' }}>Nome da Equipe *</Label>
                  <Input
                    id="teamName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Equipe Alpha"
                    className="mt-1"
                  />
                </div>

                {/* Gestor Responsável */}
                <div>
                  <Label htmlFor="manager" style={{ color: '#8B20EE' }}>Gestor Responsável *</Label>
                  <Select value={formData.managerId} onValueChange={(value: string) => setFormData({ ...formData, managerId: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Escolha um gestor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.map(manager => (
                        <SelectItem key={manager.id} value={manager.id}>
                          <div className="flex items-center space-x-2">
                            <span>{manager.name}</span>
                            <span className="text-xs text-gray-500">({manager.email})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Colaboradores */}
                <div>
                  <Label style={{ color: '#8B20EE' }}>
                    Colaboradores ({formData.memberIds.length} selecionados)
                  </Label>
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto scrollbar-hide border rounded-lg p-3">
                    {availableMembers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Nenhum colaborador disponível</p>
                    ) : (
                      availableMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleMember(member.id)}
                        >
                          <Checkbox
                            checked={formData.memberIds.includes(member.id)}
                            onCheckedChange={() => toggleMember(member.id)}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                          />
                          <Avatar className="h-8 w-8" style={{ backgroundColor: '#35BAE6' }}>
                            <AvatarFallback style={{ backgroundColor: '#35BAE6', color: 'white' }}>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create Mode - Wizard */}
            {dialogMode === 'create' && (
              <>
                {/* Step 1: Team Name */}
                {dialogStep === 'name' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                        <span className="text-2xl">1</span>
                      </div>
                      <p className="text-sm text-gray-600">Passo 1 de 3: Nome da Equipe</p>
                    </div>
                    <div>
                      <Label htmlFor="teamName" style={{ color: '#8B20EE' }}>Nome da Equipe *</Label>
                      <Input
                        id="teamName"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Equipe Alpha"
                        className="mt-1"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Manager */}
                {dialogStep === 'manager' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                        <span className="text-2xl">2</span>
                      </div>
                      <p className="text-sm text-gray-600">Passo 2 de 3: Gestor Responsável</p>
                    </div>
                    <div>
                      <Label htmlFor="manager" style={{ color: '#8B20EE' }}>Selecione o Gestor Responsável *</Label>
                      <Select value={formData.managerId} onValueChange={(value: string) => setFormData({ ...formData, managerId: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Escolha um gestor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableManagers.map(manager => (
                            <SelectItem key={manager.id} value={manager.id}>
                              <div className="flex items-center space-x-2">
                                <span>{manager.name}</span>
                                <span className="text-xs text-gray-500">({manager.email})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 3: Members */}
                {dialogStep === 'members' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                        <span className="text-2xl">3</span>
                      </div>
                      <p className="text-sm text-gray-600">Passo 3 de 3: Adicionar Colaboradores</p>
                    </div>
                    <div>
                      <Label style={{ color: '#8B20EE' }}>
                        Selecione os Colaboradores ({formData.memberIds.length} selecionados)
                      </Label>
                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto scrollbar-hide border rounded-lg p-3">
                        {availableMembers.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhum colaborador disponível</p>
                        ) : (
                          availableMembers.map(member => (
                            <div
                              key={member.id}
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleMember(member.id)}
                            >
                              <Checkbox
                                checked={formData.memberIds.includes(member.id)}
                                onCheckedChange={() => toggleMember(member.id)}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                              />
                              <Avatar className="h-8 w-8" style={{ backgroundColor: '#35BAE6' }}>
                                <AvatarFallback style={{ backgroundColor: '#35BAE6', color: 'white' }}>
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * Você pode criar a equipe sem colaboradores e adicioná-los depois
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            {/* Edit Mode Footer */}
            {dialogMode === 'edit' && (
              <>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveTeam}
                  disabled={!formData.name || !formData.managerId || !hasTeamChanges()}
                  style={{ backgroundColor: '#8B20EE', color: 'white' }}
                  className="hover:opacity-90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </>
            )}

            {/* Create Mode Footer - Wizard Navigation */}
            {dialogMode === 'create' && (
              <>
                {dialogStep === 'name' && (
                  <>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!formData.name}
                      style={{ backgroundColor: '#8B20EE', color: 'white' }}
                      className="hover:opacity-90"
                    >
                      Próximo
                    </Button>
                  </>
                )}

                {dialogStep === 'manager' && (
                  <>
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Voltar
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!formData.managerId}
                      style={{ backgroundColor: '#8B20EE', color: 'white' }}
                      className="hover:opacity-90"
                    >
                      Próximo
                    </Button>
                  </>
                )}

                {dialogStep === 'members' && (
                  <>
                    <Button variant="outline" onClick={handlePreviousStep}>
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSaveTeam}
                      style={{ backgroundColor: '#8B20EE', color: 'white' }}
                      className="hover:opacity-90"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Criar Equipe
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmTeam} onOpenChange={() => setDeleteConfirmTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#8B20EE' }}>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#000000' }}>
              Tem certeza que deseja excluir a equipe <strong>{deleteConfirmTeam?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTeam}
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