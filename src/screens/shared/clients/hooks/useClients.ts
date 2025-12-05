// /shared/clients/hooks/useClients.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Client, ClientLocation } from '../types/client';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para buscar clientes (Listar)
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error("Sem token de autenticação");
        return;
      }

      const response = await fetch('http://localhost:5000/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Adaptar dados do backend para o formato do frontend
        const formattedClients: Client[] = (data.clients || []).map((client: any) => ({
          id: client.id,
          name: client.legal_name || client.name,
          cnpj: client.cnpj,
          email: client.email,
          phone: client.phone,
          address: {
            street: client.address?.street || '',
            number: client.address?.number || '',
            complement: client.address?.complement || '',
            zipCode: client.address?.zip_code || client.address?.zipCode || '',
            neighborhood: client.address?.neighborhood || '',
            city: client.address?.city || '',
            state: client.address?.state || ''
          },
          area: client.area || 'centro',
          locations: client.locations || [],
          status: client.status || 'active',
          servicesActive: client.services_active || client.servicesActive || 0,
          servicesCompleted: client.services_completed || client.servicesCompleted || 0,
          lastService: client.last_service || client.lastService || '-',
          rating: client.rating || 0,
          totalValue: client.total_value || client.totalValue || 'R$ 0,00',
          notes: client.notes || '',
          createdAt: client.created_at || client.createdAt
        }));
        
        setClients(formattedClients);
      } else {
        toast.error(`Erro ao carregar: ${data.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      toast.error("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para Salvar (Criar ou Editar)
  const saveClient = async (clientData: any, isEditing: boolean, id?: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const url = isEditing 
        ? `http://localhost:5000/api/clients/${id}`
        : 'http://localhost:5000/api/clients';
      
      const method = isEditing ? 'PUT' : 'POST';

      // Preparar payload para o backend
      const payload = {
        name: clientData.name,        // ✅ Nome da empresa (obrigatório)
        legal_name: clientData.name,  // ✅ Razão social (pode ser igual ao name)
        cnpj: clientData.cnpj,
        email: clientData.email,
        phone: clientData.phone,
        address: {
          street: clientData.address.street,
          number: clientData.address.number,
          complement: clientData.address.complement || '',
          zip_code: clientData.address.zipCode,
          neighborhood: clientData.address.neighborhood,
          city: clientData.address.city,
          state: clientData.address.state
        },
        area: clientData.area,
        locations: clientData.locations?.map((loc: ClientLocation) => ({
          id: loc.id,  // ✅ Incluir ID para update/create correto
          name: loc.name,
          address: {
            street: loc.address.street,
            number: loc.address.number,
            complement: loc.address.complement || '',
            zip_code: loc.address.zipCode,
            neighborhood: loc.address.neighborhood,
            city: loc.address.city,
            state: loc.address.state
          },
          area: loc.area,
          isPrimary: loc.isPrimary  // ✅ Usar isPrimary (frontend) e is_primary (backend)
        })) || [],
        notes: clientData.notes || '',
        status: clientData.status
      };

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!');
        fetchClients(); // Recarrega a lista automaticamente
        return true;
      } else {
        toast.error(`Erro: ${data.message || 'Falha ao salvar'}`);
        return false;
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error('Erro de conexão ao salvar.');
      return false;
    }
  };

  const toggleClientStatus = async (id: number, currentStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/clients/${id}/toggle-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast.success(`Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
        // Atualiza a lista localmente para ser rápido
        setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      } else {
        const data = await response.json();
        toast.error(`Erro ao alterar status: ${data.message}`);
      }
    } catch (error) {
      toast.error("Erro de conexão");
    }
  };

  // Função para Deletar
  const deleteClient = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/clients/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Cliente excluído com sucesso!");
        fetchClients(); // Recarrega a lista
        return true;
      } else {
        const data = await response.json();
        toast.error(`Erro ao excluir: ${data.message}`);
        return false;
      }
    } catch (error) {
      toast.error("Erro de conexão ao excluir.");
      return false;
    }
  };

  // /shared/clients/hooks/useClients.ts - CORRIJA ESTA FUNÇÃO:
const updateClientLocations = async (clientId: number, locations: ClientLocation[]): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:5000/api/clients/${clientId}/locations`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        locations: locations.map(loc => ({
          name: loc.name,
          address: {
            street: loc.address.street,
            number: loc.address.number,
            complement: loc.address.complement || '',
            zip_code: loc.address.zipCode,
            neighborhood: loc.address.neighborhood,
            city: loc.address.city,
            state: loc.address.state
          },
          area: loc.area,
          is_primary: loc.isPrimary
        }))
      })
    });

    if (response.ok) {
      toast.success("Unidades atualizadas com sucesso!");
      fetchClients(); // Atualiza a lista geral
    } else {
      const data = await response.json();
      toast.error(`Erro ao salvar unidades: ${data.message}`);
    }
  } catch (error) {
    toast.error("Erro de rede ao atualizar unidades");
  }
};

  // Carrega lista inicial
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { 
    clients, 
    loading, 
    fetchClients, 
    saveClient, 
    deleteClient,
    toggleClientStatus,
    updateClientLocations  
  };
}