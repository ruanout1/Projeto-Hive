import { useState } from 'react';
import { toast } from 'sonner';
import { Allocation, Collaborator, Client } from '../types';

const initialAllocations: Allocation[] = [
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
];

const collaborators: Collaborator[] = [
    { id: 1, name: 'Carlos Mendes', position: 'Faxineiro(a)', team: 'Equipe Alpha', available: true },
    { id: 2, name: 'Marina Oliveira', position: 'Serviços Gerais', team: 'Equipe Alpha', available: true },
    { id: 3, name: 'Roberto Silva', position: 'Porteiro', team: 'Equipe Beta', available: true },
    { id: 4, name: 'Juliana Costa', position: 'Copeira', team: 'Equipe Alpha', available: true },
    { id: 5, name: 'Paulo Ferreira', position: 'Zelador', team: 'Equipe Beta', available: false },
];

const clients: Client[] = [
    { id: 1, name: 'Empresa ABC Ltda', area: 'Norte', active: true },
    { id: 2, name: 'Condomínio Residencial Sol', area: 'Sul', active: true },
    { id: 3, name: 'Shopping Center Plaza', area: 'Leste', active: true },
    { id: 4, name: 'Hotel Premium', area: 'Oeste', active: true },
    { id: 5, name: 'Escritório Central', area: 'Norte', active: true },
];

export const useAllocations = () => {
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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
      toast.error('Campos obrigatórios', { description: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Datas inválidas', { description: 'A data de término deve ser posterior à data de início.' });
      return;
    }

    const collaborator = collaborators.find(c => c.id === parseInt(selectedCollaborator));
    const client = clients.find(c => c.id === parseInt(selectedClient));
    if (!collaborator || !client) return;

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status: 'active' | 'upcoming' | 'completed' = 'upcoming';
    if (today >= start && today <= end) status = 'active';
    else if (today > end) status = 'completed';

    if (editingAllocation) {
      setAllocations(allocations.map(a =>
        a.id === editingAllocation.id
          ? { ...a, collaboratorId: parseInt(selectedCollaborator), collaboratorName: collaborator.name, collaboratorPosition: collaborator.position, clientId: parseInt(selectedClient), clientName: client.name, clientArea: client.area, startDate, endDate, workDays: selectedWorkDays, startTime, endTime, status }
          : a
      ));
      toast.success('Alocação atualizada', { description: 'A alocação foi atualizada com sucesso.' });
    } else {
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
      toast.success('Alocação criada', { description: `${collaborator.name} foi alocado(a) para ${client.name}.` });
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
      toast.success('Alocação cancelada', { description: 'A alocação foi cancelada com sucesso.' });
    }
  };

  const handleToggleWorkDay = (dayId: string) => {
    setSelectedWorkDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
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

  return {
    allocations: filteredAllocations,
    stats,
    dialogOpen,
    editingAllocation,
    filterStatus,
    setFilterStatus,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveAllocation,
    handleDeleteAllocation,
    formState: {
      selectedCollaborator, setSelectedCollaborator,
      selectedClient, setSelectedClient,
      startDate, setStartDate,
      endDate, setEndDate,
      selectedWorkDays, handleToggleWorkDay,
      startTime, setStartTime,
      endTime, setEndTime
    },
    mockData: { collaborators, clients }
  };
};
