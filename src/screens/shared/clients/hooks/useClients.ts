import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Client, ClientLocation } from '../types/client';
import api from '../../../../lib/api';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca Clientes
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients');
      const data = response.data;
      
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
        servicesActive: client.services_active || 0,
        servicesCompleted: client.services_completed || 0,
        lastService: client.last_service || '-',
        rating: client.rating || 0,
        totalValue: client.total_value || 'R$ 0,00',
        notes: client.notes || '',
        createdAt: client.createdAt || client.created_at
      }));
      
      setClients(formattedClients);
    } catch (error: any) {
      console.error("Erro de conexão:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar Cliente (Empresa)
  const saveClient = async (clientData: any, isEditing: boolean, id?: number) => {
    try {
      const url = isEditing ? `/clients/${id}` : '/clients';
      const method = isEditing ? 'put' : 'post';

      const payload = {
        name: clientData.name,
        legal_name: clientData.name,
        cnpj: clientData.cnpj,
        email: clientData.email,
        phone: clientData.phone,
        address: {
          street: clientData.address.street,
          number: clientData.address.number,
          complement: clientData.address.complement || '',
          zipCode: clientData.address.zipCode,
          neighborhood: clientData.address.neighborhood,
          city: clientData.address.city,
          state: clientData.address.state
        },
        area: clientData.area,
        notes: clientData.notes || '',
        status: clientData.status,
        // Envia locations apenas na criação para facilitar
        locations: !isEditing && clientData.locations ? clientData.locations.map((loc: any) => ({
            name: loc.name,
            address: loc.address,
            area: loc.area,
            is_primary: loc.isPrimary
        })) : undefined
      };

      // @ts-ignore
      const response = await api[method](url, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? 'Cliente atualizado!' : 'Cliente criado!');
        fetchClients(); 
        return true;
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.response?.data?.message || 'Falha ao salvar'}`);
      return false;
    }
    return false;
  };

  const toggleClientStatus = async (id: number, currentStatus: string) => {
    try {
      const response = await api.patch(`/clients/${id}/toggle-status`);
      if (response.status === 200) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast.success(`Status alterado com sucesso!`);
        setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      if (response.status === 200) {
        toast.success("Cliente excluído!");
        fetchClients();
        return true;
      }
    } catch (error: any) {
      toast.error(`Erro ao excluir: ${error.response?.data?.message || 'Erro desconhecido'}`);
      return false;
    }
    return false;
  };

  // --- FUNÇÃO: ADICIONAR FILIAL (POST) ---
const addClientLocation = async (clientId: number, locationData: any): Promise<boolean> => {
  try {
    // Formata os dados para o backend
    const payload = {
      name: locationData.name,
      email: locationData.email || '',     // NOVO: incluir email
      phone: locationData.phone || '',     // NOVO: incluir telefone
      cnpj: locationData.cnpj || '',       // NOVO: incluir CNPJ
      address: {
        street: locationData.address.street,
        number: locationData.address.number,
        complement: locationData.address.complement || '',
        zipCode: locationData.address.zipCode,
        neighborhood: locationData.address.neighborhood,
        city: locationData.address.city,
        state: locationData.address.state
      },
      area: locationData.area,
      isPrimary: Boolean(locationData.isPrimary || false)
    };

    const response = await api.post(`/clients/${clientId}/locations`, payload);
    
    if (response.status === 201 || response.status === 200) {
      toast.success("Unidade adicionada com sucesso!");
      fetchClients(); // Atualiza a lista de clientes
      return true;
    }
  } catch (error: any) {
    console.error("Erro ao adicionar unidade:", error);
    toast.error(`Erro ao adicionar unidade: ${error.response?.data?.message || 'Erro desconhecido'}`);
    return false;
  }
  return false;
};

  /// --- FUNÇÃO: ATUALIZAR FILIAL (PUT) - VERIFIQUE ---
const updateClientLocation = async (clientId: number, locationId: string, locationData: any): Promise<boolean> => {
  try {
    const payload = {
      name: locationData.name,
      email: locationData.email || '',     // VERIFIQUE se está vindo email
      phone: locationData.phone || '',     // VERIFIQUE se está vindo telefone
      cnpj: locationData.cnpj || '',       // VERIFIQUE se está vindo CNPJ
      area: locationData.area,
      isPrimary: Boolean(locationData.isPrimary || false), // VERIFIQUE se está marcando como principal
      address: {
        street: locationData.address.street,
        number: locationData.address.number,
        complement: locationData.address.complement || '',
        zipCode: locationData.address.zipCode,
        neighborhood: locationData.address.neighborhood,
        city: locationData.address.city,
        state: locationData.address.state
      }
    };

    console.log("📤 Enviando para o backend:", payload); // ADICIONE ESTE LOG

    const response = await api.put(`/clients/${clientId}/locations/${locationId}`, payload);
    
    console.log("📥 Resposta do backend:", response.data); // ADICIONE ESTE LOG
    
    toast.success("Unidade atualizada!");
    fetchClients(); // IMPORTANTE: Isso atualiza a lista no frontend
    return true;
  } catch (error: any) {
    console.error("Erro no update:", error);
    const msg = error.response?.data?.message || 'Erro desconhecido ao atualizar';
    toast.error(`Erro: ${msg}`);
    return false;
  }
};

  // --- FUNÇÃO: REMOVER FILIAL (DELETE) ---
  const removeClientLocation = async (clientId: number, locationId: string): Promise<void> => {
    try {
      // Verifica se é uma unidade temporária (local)
      if (locationId.toString().startsWith('loc-')) {
        // Atualiza localmente sem chamar API
        setClients(prev => prev.map(client => {
          if (client.id === clientId) {
            const updatedLocations = client.locations?.filter(loc => loc.id !== locationId) || [];
            return { ...client, locations: updatedLocations };
          }
          return client;
        }));
        toast.success("Unidade removida!");
        return;
      }

      // Remove do backend
      const response = await api.delete(`/clients/${clientId}/locations/${locationId}`);
      
      if (response.status === 200) {
        toast.success("Unidade removida com sucesso!");
        fetchClients(); // Atualiza a lista completa
      }
    } catch (error: any) {
      toast.error(`Erro ao remover unidade: ${error.response?.data?.message || 'Erro desconhecido'}`);
    }
  };

  // --- FUNÇÃO LEGADA: Atualizações em lote (mantida para compatibilidade) ---
  const updateClientLocations = async (clientId: number, locations: ClientLocation[]): Promise<void> => {
    try {
      // Esta função não deve ser usada para adicionar/atualizar unidades individuais
      // Mantida apenas para compatibilidade com código existente
      const client = clients.find(c => c.id === clientId);
      if (!client) return;
      
      // Atualiza localmente
      setClients(prev => prev.map(c => 
        c.id === clientId ? { ...c, locations } : c
      ));
      
      // Se tiver unidades temporárias, mostra aviso
      const hasTempLocations = locations.some(loc => loc.id.toString().startsWith('loc-'));
      if (hasTempLocations) {
        toast.warning("Alterações salvas localmente. Use as funções específicas para sincronizar com o servidor.");
      }
    } catch (error) {
      console.error("Erro ao atualizar localizações:", error);
      toast.error("Erro ao atualizar unidades");
    }
  };

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
    addClientLocation,    // Exporta - POST /clients/{id}/locations
    updateClientLocation, // Exporta - PUT /clients/{id}/locations/{locationId}
    removeClientLocation, // Exporta - DELETE /clients/{id}/locations/{locationId}
    updateClientLocations // Exporta (legado) - Atualização local
  };
}