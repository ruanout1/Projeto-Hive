import { useState } from 'react';
import { Calendar, Users, Building2, Clock, Plus, Edit, Trash2, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import ScreenHeader from './ScreenHeader';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Allocation {
  id: number;
  collaboratorId: number;
  collaboratorName: string;
  collaboratorPosition: string;
  clientId: number;
  clientName: string;
  clientArea: string;
  startDate: string;
  endDate: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

interface CollaboratorAllocationsScreenProps {
  onBack?: () => void;
}

const workDaysOptions = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

export default function CollaboratorAllocationsScreen({ onBack }: CollaboratorAllocationsScreenProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([
    {
      id: 1,
      collaboratorId: 1,
      collaboratorName: 'Carlos Mendes',
      collaboratorPosition: 'Faxineiro(a)',
      clientId: 1,
      clientName: 'Empresa ABC Ltda',
      clientArea: 'Norte',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '08:00',
      endTime: '17:00',
      status: 'active',
      createdAt: '2025-09-25'
    },
    {
      id: 2,
      collaboratorId: 2,
      collaboratorName: 'Marina Oliveira',
      collaboratorPosition: 'Serviços Gerais',
      clientId: 2,
      clientName: 'Condomínio Residencial Sol',
      clientArea: 'Sul',
      startDate: '2025-10-15',
      endDate: '2026-01-15',
      workDays: ['monday', 'wednesday', 'friday'],
      startTime: '09:00',
      endTime: '15:00',
      status: 'active',
      createdAt: '2025-10-01'
    },
    {
      id: 3,
      collaboratorId: 3,
      collaboratorName: 'Roberto Silva',
      collaboratorPosition: 'Porteiro',
      clientId: 3,
      clientName: 'Shopping Center Plaza',
      clientArea: 'Leste',
      startDate: '2025-11-01',
      endDate: '2026-04-30',
      workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      startTime: '14:00',
      endTime: '22:00',
      status: 'upcoming',
      createdAt: '2025-10-18'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [expandedAllocations, setExpandedAllocations] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Mock data
  const collaborators = [
    { id: 1, name: 'Carlos Mendes', position: 'Faxineiro(a)', team: 'Equipe Alpha', available: true },
    { id: 2, name: 'Marina Oliveira', position: 'Serviços Gerais', team: 'Equipe Alpha', available: true },
    { id: 3, name: 'Roberto Silva', position: 'Porteiro', team: 'Equipe Beta', available: true },
    { id: 4, name: 'Juliana Costa', position: 'Copeira', team: 'Equipe Alpha', available: true },
    { id: 5, name: 'Paulo Ferreira', position: 'Zelador', team: 'Equipe Beta', available: false },
  ];

  const clients = [
    { id: 1, name: 'Empresa ABC Ltda', area: 'Norte', active: true },
    { id: 2, name: 'Condomínio Residencial Sol', area: 'Sul', active: true },
    { id: 3, name: 'Shopping Center Plaza', area: 'Leste', active: true },
    { id: 4, name: 'Hotel Premium', area: 'Oeste', active: true },
    { id: 5, name: 'Escritório Central', area: 'Norte', active: true },
  ];

  const handleOpenDialog = (allocation?: Allocation) => {
    if (allocation) {
      setEditingAllocation(allocation);
      setSelectedCollaborator(allocation.collaboratorId.toString());
      setSelectedClient(allocation.clientId.toString());
      setStartDate(allocation.startDate);
      setEndDate(allocation.endDate);
      setSelectedWorkDays(allocation.workDays);
      setStartTime(allocation.startTime);
      setEndTime(allocation.endTime);
    } else {
      setEditingAllocation(null);
      setSelectedCollaborator('');
      setSelectedClient('');
      setStartDate('');
      setEndDate('');
      setSelectedWorkDays([]);
      setStartTime('');
      setEndTime('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAllocation(null);
  };

  const handleSaveAllocation = () => {
    if (!selectedCollaborator || !selectedClient || !startDate || !endDate || selectedWorkDays.length === 0 || !startTime || !endTime) {
      toast.error('Campos obrigatórios', {
        description: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Datas inválidas', {
        description: 'A data de término deve ser posterior à data de início.'
      });
      return;
    }

    const collaborator = collaborators.find(c => c.id === parseInt(selectedCollaborator));
    const client = clients.find(c => c.id === parseInt(selectedClient));

    if (!collaborator || !client) return;

    // Determinar status baseado nas datas
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status: 'active' | 'upcoming' | 'completed' = 'upcoming';
    
    if (today >= start && today <= end) {
      status = 'active';
    } else if (today > end) {
      status = 'completed';
    }

    if (editingAllocation) {
      // Editar alocação existente
      setAllocations(allocations.map(a =>
        a.id === editingAllocation.id
          ? {
              ...a,
              collaboratorId: parseInt(selectedCollaborator),
              collaboratorName: collaborator.name,
              collaboratorPosition: collaborator.position,
              clientId: parseInt(selectedClient),
              clientName: client.name,
              clientArea: client.area,
              startDate,
              endDate,
              workDays: selectedWorkDays,
              startTime,
              endTime,
              status
            }
          : a
      ));
      toast.success('Alocação atualizada', {
        description: 'A alocação foi atualizada com sucesso.'
      });
    } else {
      // Criar nova alocação
      const newAllocation: Allocation = {
        id: Math.max(...allocations.map(a => a.id), 0) + 1,
        collaboratorId: parseInt(selectedCollaborator),
        collaboratorName: collaborator.name,
        collaboratorPosition: collaborator.position,
        clientId: parseInt(selectedClient),
        clientName: client.name,
        clientArea: client.area,
        startDate,
        endDate,
        workDays: selectedWorkDays,
        startTime,
        endTime,
        status,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setAllocations([...allocations, newAllocation]);
      toast.success('Alocação criada', {
        description: `${collaborator.name} foi alocado(a) para ${client.name}.`
      });
    }

    handleCloseDialog();
  };

  const handleDeleteAllocation = (id: number) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    if (window.confirm(`Deseja realmente cancelar a alocação de ${allocation.collaboratorName} para ${allocation.clientName}?`)) {
      setAllocations(allocations.map(a =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      ));
      toast.success('Alocação cancelada', {
        description: 'A alocação foi cancelada com sucesso.'
      });
    }
  };

  const toggleExpanded = (id: number) => {
    setExpandedAllocations(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleWorkDay = (dayId: string) => {
    setSelectedWorkDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Em Andamento', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
      upcoming: { label: 'Agendado', color: '#35BAE6', bgColor: 'rgba(53, 186, 230, 0.1)' },
      completed: { label: 'Concluído', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
      cancelled: { label: 'Cancelado', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
    };
    const config = configs[status as keyof typeof configs] || configs.active;
    
    return (
      <Badge style={{ backgroundColor: config.bgColor, color: config.color }}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
  };

  const formatWorkDays = (days: string[]) => {
    const dayLabels = days.map(day => {
      const option = workDaysOptions.find(opt => opt.id === day);
      return option?.label || day;
    });
    return dayLabels.join(', ');
  };

  const filteredAllocations = allocations.filter(allocation => {
    if (filterStatus === 'all') return true;
    return allocation.status === filterStatus;
  });

  const stats = {
    total: allocations.length,
    active: allocations.filter(a => a.status === 'active').length,
    upcoming: allocations.filter(a => a.status === 'upcoming').length,
    completed: allocations.filter(a => a.status === 'completed').length
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <ScreenHeader 
                title="Alocações de Colaboradores"
                description="Gerencie contratos fixos e alocações de longo prazo de colaboradores em clientes."
                onBack={onBack}
              />
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Alocação
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-3xl" style={{ color: '#6400A4' }}>{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                    <Users className="h-6 w-6" style={{ color: '#6400A4' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('active')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
                    <p className="text-3xl" style={{ color: '#10B981' }}>{stats.active}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircle className="h-6 w-6" style={{ color: '#10B981' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('upcoming')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Agendadas</p>
                    <p className="text-3xl" style={{ color: '#35BAE6' }}>{stats.upcoming}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                    <Calendar className="h-6 w-6" style={{ color: '#35BAE6' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('completed')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                    <p className="text-3xl text-gray-600">{stats.completed}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtro */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                style={filterStatus === 'all' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
                style={filterStatus === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
              >
                Em Andamento
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('upcoming')}
                style={filterStatus === 'upcoming' ? { backgroundColor: '#35BAE6', color: 'white' } : {}}
              >
                Agendadas
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
              >
                Concluídas
              </Button>
            </div>
          </div>

          {/* Lista de Alocações */}
          {filteredAllocations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-4 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                  <Users className="h-12 w-12" style={{ color: '#6400A4' }} />
                </div>
                <h3 className="text-xl mb-2" style={{ color: '#6400A4' }}>Nenhuma alocação encontrada</h3>
                <p className="text-gray-600 mb-6">
                  {filterStatus === 'all' 
                    ? 'Comece criando uma nova alocação de colaborador para um cliente.'
                    : 'Não há alocações com este status no momento.'
                  }
                </p>
                {filterStatus === 'all' && (
                  <Button
                    onClick={() => handleOpenDialog()}
                    style={{ backgroundColor: '#6400A4', color: 'white' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Alocação
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAllocations.map((allocation) => (
                <Card key={allocation.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header da Alocação */}
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpanded(allocation.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {expandedAllocations.includes(allocation.id) ? (
                              <ChevronDown className="h-5 w-5" style={{ color: '#6400A4' }} />
                            ) : (
                              <ChevronRight className="h-5 w-5" style={{ color: '#6400A4' }} />
                            )}
                          </div>

                          <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                            <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                              {getInitials(allocation.collaboratorName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 style={{ color: '#6400A4' }}>{allocation.collaboratorName}</h3>
                              <span className="text-gray-400">→</span>
                              <p className="text-gray-700">{allocation.clientName}</p>
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-600">
                              <span>{allocation.collaboratorPosition}</span>
                              <span>•</span>
                              <span>Área {allocation.clientArea}</span>
                              <span>•</span>
                              <span>{formatDateRange(allocation.startDate, allocation.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          {getStatusBadge(allocation.status)}
                          
                          {allocation.status !== 'cancelled' && allocation.status !== 'completed' && (
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDialog(allocation)}
                                style={{ borderColor: '#6400A4', color: '#6400A4' }}
                                className="hover:bg-purple-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAllocation(allocation.id)}
                                style={{ borderColor: '#EF4444', color: '#EF4444' }}
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes Expandidos */}
                    {expandedAllocations.includes(allocation.id) && (
                      <>
                        <Separator />
                        <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Período</p>
                            <div className="space-y-1">
                              <p className="text-sm" style={{ color: '#6400A4' }}>
                                <strong>Início:</strong> {new Date(allocation.startDate).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-sm" style={{ color: '#6400A4' }}>
                                <strong>Término:</strong> {new Date(allocation.endDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-2">Dias de Trabalho</p>
                            <p className="text-sm" style={{ color: '#6400A4' }}>
                              {formatWorkDays(allocation.workDays)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-2">Horário</p>
                            <p className="text-sm" style={{ color: '#6400A4' }}>
                              {allocation.startTime} - {allocation.endTime}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Nova/Editar Alocação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {editingAllocation ? 'Editar Alocação' : 'Nova Alocação'}
            </DialogTitle>
            <DialogDescription>
              Aloque um colaborador para trabalhar em um cliente por um período determinado. A agenda do colaborador será preenchida automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seleção de Colaborador */}
            <div>
              <Label htmlFor="collaborator">Colaborador *</Label>
              <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
                <SelectTrigger id="collaborator">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map((collaborator) => (
                    <SelectItem 
                      key={collaborator.id} 
                      value={collaborator.id.toString()}
                      disabled={!collaborator.available}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{collaborator.name}</span>
                          <span className="text-xs text-gray-500 ml-2">• {collaborator.position}</span>
                          <span className="text-xs text-gray-500 ml-2">• {collaborator.team}</span>
                        </div>
                        {!collaborator.available && (
                          <Badge variant="secondary" className="ml-2">Indisponível</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Cliente */}
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                        <span>{client.name}</span>
                        <span className="text-xs text-gray-500 ml-2">• Área {client.area}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Data de Início *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Data de Término *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Dias da Semana */}
            <div>
              <Label className="mb-3 block">Dias de Trabalho *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {workDaysOptions.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={selectedWorkDays.includes(day.id)}
                      onCheckedChange={() => handleToggleWorkDay(day.id)}
                    />
                    <Label
                      htmlFor={day.id}
                      className="text-sm cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedWorkDays.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">Selecione pelo menos um dia da semana</p>
              )}
            </div>

            {/* Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Horário de Início *</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Horário de Término *</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Aviso */}
            <div className="p-4 rounded-lg border-2" style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)', borderColor: '#35BAE6' }}>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#35BAE6' }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: '#35BAE6' }}>
                    <strong>Atenção:</strong> A agenda do colaborador será preenchida automaticamente nos dias e horários selecionados durante todo o período da alocação. Verifique se não há conflitos com outras atividades.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAllocation}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              {editingAllocation ? 'Salvar Alterações' : 'Criar Alocação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
