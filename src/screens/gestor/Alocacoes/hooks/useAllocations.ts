import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { Allocation, Collaborator, Client } from '../types';

export const useAllocations = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // --- HELPER: Mapeia status do Banco para o Frontend ---
  const mapBackendStatusToFrontend = (statusKey: string): any => {
    // Ajuste conforme o que está no seu arquivo types.ts
    if (statusKey === 'in_progress' || statusKey === 'active') return 'active';
    if (statusKey === 'completed') return 'completed';
    if (statusKey === 'cancelled') return 'cancelled';
    // 'scheduled' ou qualquer outro vira 'upcoming' (ou o status padrão de "agendado" do seu tipo)
    return 'upcoming'; 
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, collabRes, clientRes] = await Promise.all([
        api.get('/allocations'), 
        api.get('/users'), 
        api.get('/clients') 
      ]);

      const mappedAllocations = allocRes.data.map((item: any) => ({
        id: item.allocation_id,
        collaboratorId: item.collaborator_user_id,
        collaboratorName: item.collaborator_user?.full_name || 'Desconhecido',
        collaboratorPosition: 'Colaborador', 
        clientId: item.company_id,
        clientName: item.company?.name || 'Desconhecido',
        clientArea: item.area?.name || 'Geral',
        startDate: item.start_date,
        endDate: item.end_date,
        // Mapeia os dias vindos da tabela filha
        workDays: item.allocation_work_days ? item.allocation_work_days.map((d: any) => d.day_of_week) : [],
        startTime: item.shift_start_time,
        endTime: item.shift_end_time,
        // AQUI ESTÁ A CORREÇÃO DO ERRO DE TIPO:
        status: mapBackendStatusToFrontend(item.status_key),
        createdAt: item.created_at
      }));

      setAllocations(mappedAllocations);
      
      const allUsers = collabRes.data.data || collabRes.data;
      const collabUsers = allUsers.filter((u: any) => u.role_key === 'collaborator' || u.role === 'colaborador');
      
      setCollaborators(collabUsers.map((u: any) => ({
          id: u.user_id,
          name: u.full_name,
          position: 'Colaborador',
          team: 'Geral',
          available: u.is_active
      })));

      const clientList = clientRes.data.clients || clientRes.data;
      setClients(clientList.map((c: any) => ({
          id: c.id,
          name: c.name,
          area: c.address?.neighborhood || 'Geral',
          active: c.status === 'active'
      })));

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---

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

  const handleSaveAllocation = async () => {
    if (!selectedCollaborator || !selectedClient || !startDate || !endDate || selectedWorkDays.length === 0 || !startTime || !endTime) {
      toast.error('Campos obrigatórios');
      return;
    }

    const payload = {
        collaborator_user_id: parseInt(selectedCollaborator),
        company_id: parseInt(selectedClient),
        start_date: startDate,
        end_date: endDate,
        shift_start: startTime,
        shift_end: endTime,
        work_days: selectedWorkDays 
    };

    try {
        if (editingAllocation) {
            await api.put(`/allocations/${editingAllocation.id}`, payload);
            toast.success('Alocação atualizada');
        } else {
            await api.post('/allocations', payload);
            toast.success('Alocação criada');
        }
        fetchData();
        handleCloseDialog();
    } catch (error: any) {
        toast.error("Erro ao salvar", { description: error.response?.data?.message });
    }
  };

  const handleDeleteAllocation = async (id: number) => {
    if (window.confirm(`Deseja remover esta alocação?`)) {
      try {
          await api.delete(`/allocations/${id}`);
          toast.success('Alocação removida');
          fetchData();
      } catch (error) {
          toast.error("Erro ao remover");
      }
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
    // Agora comparamos com os valores mapeados (frontend), removendo o erro do TS
    active: allocations.filter(a => a.status === 'active').length,
    // Usamos 'as string' ou verificamos apenas 'upcoming' se for o nome correto no seu type
    upcoming: allocations.filter(a => (a.status as string) === 'upcoming').length,
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
    mockData: { collaborators, clients },
    loading
  };
};