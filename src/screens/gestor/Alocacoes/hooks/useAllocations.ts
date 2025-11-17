import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Allocation, Client, Collaborator, AllocationStats } from '../types';

// ===================================
// API Helper (Função auxiliar)
// ===================================
// Criamos um 'wrapper' para o fetch que já inclui o token
const getAuthHeaders = () => {
  // *** AJUSTE AQUI se o seu token estiver em outro lugar ***
  const token = localStorage.getItem('authToken'); 
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const api = {
  get: async (url: string) => {
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao buscar dados');
    }
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao criar');
    }
    return res.json();
  },
  put: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha ao atualizar');
    }
    return res.json();
  },
};


// ===================================
// Hook principal
// ===================================
export const useAllocations = () => {
  // Estados de dados
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<AllocationStats>({ total: 0, active: 0, upcoming: 0, completed: 0 });

  // Estados de UI
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Função para carregar todos os dados da tela
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Carrega todos os dados em paralelo
      const [allocData, statsData, collData, clientData] = await Promise.all([
        api.get(`/api/allocations?status=${filterStatus}`),
        api.get('/api/allocations/stats'),
        api.get('/api/users/list/my-staff'),
        api.get('/api/clients/list/my-area')
      ]);

      setAllocations(allocData);
      setStats(statsData);
      setCollaborators(collData);
      setClients(clientData);

    } catch (err) {
      toast.error('Erro ao carregar dados', { description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]); // Recarrega se o filtro mudar

  // Carrega os dados na primeira vez
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Dependência do 'fetchData' (que depende do 'filterStatus')

  // Filtra as alocações (isto permanece igual, é lógica de UI)
  const filteredAllocations = useMemo(() => {
    // A API já filtra, mas podemos re-filtrar no cliente se quisermos
    // ou simplesmente confiar nos dados da 'allocations'
    return allocations; 
  }, [allocations]);


  // Funções de manipulação do Dialog
  const handleOpenDialog = (allocation?: Allocation) => {
    setEditingAllocation(allocation || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAllocation(null);
  };

  // Salva (Cria ou Edita) uma alocação
  const handleSaveAllocation = useCallback(async (formData: Omit<Allocation, 'id' | 'createdAt' | 'status' | 'collaboratorName' | 'collaboratorPosition' | 'clientName' | 'clientArea'>) => {
    setIsSaving(true);
    try {
      let url = '/api/allocations';
      let promise;

      if (editingAllocation) {
        url = `/api/allocations/${editingAllocation.id}`;
        promise = api.put(url, formData);
      } else {
        promise = api.post(url, formData);
      }
      
      await promise;
      
      toast.success(editingAllocation ? 'Alocação atualizada' : 'Alocação criada');
      handleCloseDialog();
      await fetchData(); // Recarrega os dados!

    } catch (err) {
      toast.error('Erro ao salvar', { description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  }, [editingAllocation, fetchData]); // Depende de editingAllocation e fetchData

  // Cancela (exclusão lógica) uma alocação
  const handleDeleteAllocation = useCallback(async (id: number) => {
    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    // TODO: Substituir window.confirm por um Dialog de confirmação
    if (window.confirm(`Deseja realmente cancelar a alocação de ${allocation.collaboratorName}?`)) {
      try {
        await api.put(`/api/allocations/${id}/cancel`, {}); // PUT para /cancel
        toast.success('Alocação cancelada');
        await fetchData(); // Recarrega os dados!
      } catch (err) {
        toast.error('Erro ao cancelar', { description: (err as Error).message });
      }
    }
  }, [allocations, fetchData]);

  return {
    // Estado
    filteredAllocations, // O componente de lista usa isso
    collaborators,
    clients,
    filterStatus,
    stats,
    dialogOpen,
    editingAllocation,
    isLoading, // Informe o componente de tela que está carregando
    isSaving, // Informe o dialog que está salvando

    // Funções
    setFilterStatus,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveAllocation,
    handleDeleteAllocation
  };
};