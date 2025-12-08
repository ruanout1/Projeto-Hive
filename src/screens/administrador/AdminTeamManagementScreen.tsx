import React, { useState } from 'react';
import { Users, Plus, Edit, Power, Trash2, Check, UserPlus, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Checkbox } from '../../components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

// Importações dos componentes modulares
import { Team } from './teams/types';
import { useTeams } from './teams/hooks/useTeams';
import { useTeamMutations } from './teams/hooks/useTeamMutations';
import { useTeamMembers } from './teams/hooks/useTeamMembers';
import { FiltersBar } from './teams/FiltersBar';
import { TeamList } from './teams/TeamList';

interface TeamManagementScreenProps {
  onBack?: () => void;
}

export default function TeamManagementScreen({ onBack }: TeamManagementScreenProps) {
  const { teams, loading, error, refetch } = useTeams();
  const { managers: availableManagers, members: availableMembers, loading: membersLoading } = useTeamMembers();
  const { createTeam, updateTeam, deleteTeam, updateTeamStatus, loading: mutationLoading } = useTeamMutations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'active' | 'inactive'>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTeamDetailOpen, setIsTeamDetailOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<Team | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    memberIds: [] as string[]
  });

  // Estatísticas
  const activeCount = teams.filter(t => t.status === 'active').length;
  const inactiveCount = teams.filter(t => t.status === 'inactive').length;
  const totalMembers = teams.reduce((sum, team) => sum + (team.members?.length || 0), 0);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.manager?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || team.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
      // Modo de edição
      setDialogMode('edit');
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        managerId: team.manager?.id || '',
        memberIds: team.members?.map(m => m.id) || []
      });
    } else {
      // Modo de criação
      setDialogMode('create');
      setSelectedTeam(null);
      setFormData({
        name: '',
        managerId: '',
        memberIds: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogMode('create');
    setSelectedTeam(null);
  };

  const handleSaveTeam = async () => {
    if (!formData.name || !formData.managerId) {
      toast.error('Campos obrigatórios', {
        description: 'Nome da equipe e gestor são obrigatórios'
      });
      return;
    }

    try {
      if (dialogMode === 'edit' && selectedTeam) {
        await updateTeam(selectedTeam.id, {
          name: formData.name,
          managerId: formData.managerId,
          memberIds: formData.memberIds
        });
        toast.success('Equipe atualizada com sucesso!', {
          description: `A equipe "${formData.name}" foi atualizada.`
        });
      } else {
        await createTeam({
          name: formData.name,
          managerId: formData.managerId,
          memberIds: formData.memberIds
        });
        toast.success('Equipe criada com sucesso!', {
          description: `A equipe "${formData.name}" foi criada.`
        });
      }
      
      await refetch();
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar equipe:', err);
      toast.error('Erro ao salvar equipe', {
        description: 'Não foi possível salvar a equipe. Tente novamente.'
      });
    }
  };

  const handleToggleStatus = async (team: Team) => {
    const newStatus = team.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateTeamStatus(team.id, newStatus);
      toast.success(
        `Equipe ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`,
        { description: `A equipe "${team.name}" foi ${newStatus === 'active' ? 'ativada' : 'desativada'}.` }
      );
      await refetch();
      handleCloseTeamDetail();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      toast.error('Erro ao alterar status', {
        description: 'Não foi possível alterar o status da equipe.'
      });
    }
  };

  const handleDeleteTeam = (teamId: string) => { 
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setDeleteConfirmTeam(team);
    }
  };

  const confirmDeleteTeam = async () => {
    if (!deleteConfirmTeam) return;

    try {
      await deleteTeam(deleteConfirmTeam.id);
      toast.success('Equipe excluída com sucesso!', {
        description: `A equipe "${deleteConfirmTeam.name}" foi removida do sistema.`
      });
      await refetch();
      setDeleteConfirmTeam(null);
      handleCloseTeamDetail();
    } catch (err) {
      console.error('Erro ao excluir equipe:', err);
      toast.error('Erro ao excluir equipe', {
        description: 'Não foi possível excluir a equipe.'
      });
      setDeleteConfirmTeam(null);
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

  if (loading) {
    return (
      <div className="h-full bg-gray-50 p-6 flex justify-center items-center">
        <p className="text-xl text-gray-700">Carregando equipes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 p-6 flex justify-center items-center bg-red-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} className="ml-4">Tentar Novamente</Button>
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
              {onBack && (
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center">
                  &larr; Voltar
                </button>
              )}
              <h1 className="text-2xl font-bold text-black">Gerenciamento de Equipes</h1>
              <p className="text-gray-500">Crie e gerencie equipes com gestores e colaboradores</p>
            </div>
            
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
              disabled={mutationLoading}
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
      <FiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        actionLoading={mutationLoading}
      />

       {/* Teams List */}
      <TeamList
        teams={filteredTeams}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteTeam}
        onViewMembers={handleOpenTeamDetail}
      />

      {/* Summary */}
      {filteredTeams.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredTeams.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{teams.length}</span> equipes
            </p>
          </div>
        </div>
      )}

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
                        {getInitials(selectedTeam.manager?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p style={{ color: '#6400A4' }}>{selectedTeam.manager?.name || 'Não definido'}</p>
                      <p className="text-sm text-gray-500">{selectedTeam.manager?.email || ''}</p>
                    </div>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">
                    Colaboradores ({selectedTeam.members?.length || 0}):
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(selectedTeam.members?.length === 0 || !selectedTeam.members) ? (
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
                  onClick={() => handleDeleteTeam(selectedTeam.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {dialogMode === 'edit' ? 'Editar Equipe' : 'Nova Equipe'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'edit' ? 'Atualize as informações da equipe' : 'Preencha as informações da nova equipe'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
              <Select value={formData.managerId} onValueChange={(value) => setFormData({ ...formData, managerId: value })}>
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
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
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
                        onClick={(e) => e.stopPropagation()}
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

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTeam}
              disabled={!formData.name || !formData.managerId}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Check className="h-4 w-4 mr-2" />
              {dialogMode === 'edit' ? 'Salvar Alterações' : 'Criar Equipe'}
            </Button>
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