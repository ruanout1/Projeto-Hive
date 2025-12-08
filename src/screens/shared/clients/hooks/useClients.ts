// src\screens\shared\clients\hooks\useClients.ts - VERSÃO COMPLETA

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Client, ClientLocation } from '../types/client';
import api from '../../../../lib/api';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ========================================================================
  // FUNÇÕES AUXILIARES PARA ATUALIZAÇÃO LOCAL
  // ========================================================================

  // Atualiza um cliente localmente
  const updateClientLocally = (clientId: number, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, ...updates } : client
    ));
  };

  // Atualiza uma localização localmente
  const updateClientLocationLocally = (clientId: number, locationId: string, updates: Partial<ClientLocation>) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      
      const updatedLocations = client.locations?.map(location => {
        if (location.id === locationId) {
          return { ...location, ...updates };
        }
        // Se está marcando como principal, desmarca as outras
        if (updates.isPrimary && location.id !== locationId) {
          return { ...location, isPrimary: false };
        }
        return location;
      }) || [];
      
      return { ...client, locations: updatedLocations };
    }));
  };

  // Adiciona uma localização localmente
  const addClientLocationLocally = (clientId: number, newLocation: ClientLocation) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      
      const currentLocations = client.locations || [];
      const updatedLocations = [...currentLocations];
      
      // Se está marcando como principal, desmarca as outras
      if (newLocation.isPrimary) {
        updatedLocations.forEach(loc => { loc.isPrimary = false; });
      }
      
      updatedLocations.push(newLocation);
      return { ...client, locations: updatedLocations };
    }));
  };

  // Remove uma localização localmente
  const removeClientLocationLocally = (clientId: number, locationId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id !== clientId) return client;
      
      const updatedLocations = client.locations?.filter(loc => loc.id !== locationId) || [];
      return { ...client, locations: updatedLocations };
    }));
  };

  // ========================================================================
  // BUSCA DE CLIENTES (GET /api/clients)
  // ========================================================================

  const fetchClients = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    try {
      const response = await api.get('/clients');
      const data = response.data;
      
      // Mapeamento dos dados do backend para o formato do frontend
      const formattedClients: Client[] = (data.clients || []).map((client: any) => ({
        id: client.id || client.company_id,
        name: client.name,
        cnpj: client.cnpj || '',
        email: client.email || client.main_email || '',
        phone: client.phone || client.main_phone || '',
        status: client.status || (client.is_active ? 'active' : 'inactive'),
        notes: client.notes || '',
        address: {
          street: client.address?.street || '',
          number: client.address?.number || '',
          complement: client.address?.complement || '',
          zipCode: client.address?.zipCode || client.address?.zip_code || '',
          neighborhood: client.address?.neighborhood || '',
          city: client.address?.city || '',
          state: client.address?.state || ''
        },
        area: client.area || client.main_area || 'centro',
        locations: (client.locations || []).map((loc: any) => ({
          id: loc.id?.toString() || loc.branch_id?.toString() || `loc-${Date.now()}`,
          name: loc.name,
          email: loc.email || '',
          phone: loc.phone || '',
          cnpj: loc.cnpj || '',
          area: loc.area || 'centro',
          isPrimary: loc.isPrimary || loc.is_main_branch || false,
          address: {
            street: loc.address?.street || loc.street || '',
            number: loc.address?.number || loc.number || '',
            complement: loc.address?.complement || loc.complement || '',
            zipCode: loc.address?.zipCode || loc.zip_code || '',
            neighborhood: loc.address?.neighborhood || loc.neighborhood || '',
            city: loc.address?.city || loc.city || '',
            state: loc.address?.state || loc.state || ''
          }
        })),
        servicesActive: client.servicesActive || client.services_active || 0,
        servicesCompleted: client.servicesCompleted || client.services_completed || 0,
        lastService: client.lastService || client.last_service || '-',
        rating: client.rating || 0,
        totalValue: client.totalValue || client.total_value || 'R$ 0,00',
        createdAt: client.createdAt || client.created_at
      }));
      
      setClients(formattedClients);
      
    } catch (error: any) {
      console.error("Erro ao buscar clientes:", error);
      
      // Verifica se é erro de conexão
      if (error.code === 'ERR_NETWORK') {
        toast.error("Erro de conexão com o servidor");
      } else {
        toast.error("Erro ao carregar clientes");
      }
      
      // Retorna array vazio para não quebrar a aplicação
      setClients([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  // ========================================================================
  // SALVAR CLIENTE (POST/PUT /api/clients)
  // ========================================================================

  const saveClient = async (clientData: any, isEditing: boolean, id?: number) => {
    try {
      const url = isEditing ? `/clients/${id}` : '/clients';
      const method = isEditing ? 'put' : 'post';

      // Preparar payload para o backend
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
          zip_code: clientData.address.zipCode,
          neighborhood: clientData.address.neighborhood,
          city: clientData.address.city,
          state: clientData.address.state
        },
        area: clientData.area,
        notes: clientData.notes || '',
        status: clientData.status,
        // Envia localizações apenas na criação
        ...(!isEditing && clientData.locations ? {
          locations: clientData.locations.map((loc: any) => ({
            name: loc.name,
            email: loc.email || '',
            phone: loc.phone || '',
            cnpj: loc.cnpj || '',
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
        } : {})
      };

      // @ts-ignore - api[method] é válido
      const response = await api[method](url, payload);

      if (response.status === 200 || response.status === 201) {
        const successMessage = isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!';
        toast.success(successMessage);
        
        // Atualiza a lista de clientes
        fetchClients(false);
        
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Falha ao salvar cliente';
      
      // Tratamento específico para CNPJ duplicado
      if (errorMessage.includes('CNPJ') || errorMessage.includes('duplicado')) {
        toast.error('CNPJ já cadastrado no sistema');
      } else {
        toast.error(`Erro: ${errorMessage}`);
      }
      
      return false;
    }
    return false;
  };

  // ========================================================================
  // ATUALIZAR CLIENTE (APENAS DADOS BÁSICOS - PUT /api/clients/:id)
  // ========================================================================

  const updateClient = async (clientId: number, clientData: any) => {
    try {
      const payload = {
        name: clientData.name,
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
        notes: clientData.notes || '',
        status: clientData.status
      };

      const response = await api.put(`/clients/${clientId}`, payload);

      if (response.status === 200) {
        // Atualiza localmente
        updateClientLocally(clientId, {
          name: clientData.name,
          cnpj: clientData.cnpj,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          area: clientData.area,
          notes: clientData.notes,
          status: clientData.status
        });
        
        toast.success('Cliente atualizado com sucesso!');
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error(`Erro ao atualizar cliente: ${error.response?.data?.message || 'Erro desconhecido'}`);
      return false;
    }
    return false;
  };

  // ========================================================================
  // ALTERAR STATUS DO CLIENTE (PATCH /api/clients/:id/toggle-status)
  // ========================================================================

  const toggleClientStatus = async (id: number, currentStatus: string) => {
    try {
      const response = await api.patch(`/clients/${id}/toggle-status`);
      
      if (response.status === 200) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        // Atualiza localmente para resposta instantânea
        updateClientLocally(id, { status: newStatus });
        
        toast.success(`Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      toast.error(`Erro ao alterar status: ${error.response?.data?.message || 'Erro desconhecido'}`);
      return false;
    }
    return false;
  };

  // ========================================================================
  // EXCLUIR CLIENTE (DELETE /api/clients/:id)
  // ========================================================================

  const deleteClient = async (id: number) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      
      if (response.status === 200) {
        // Remove localmente para resposta instantânea
        setClients(prev => prev.filter(c => c.id !== id));
        
        toast.success("Cliente excluído com sucesso!");
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao excluir cliente:", error);
      
      // Tratamento específico para cliente não encontrado
      if (error.response?.status === 404) {
        toast.error('Cliente não encontrado');
      } else {
        toast.error(`Erro ao excluir cliente: ${error.response?.data?.message || 'Erro desconhecido'}`);
      }
      
      return false;
    }
    return false;
  };

  // ========================================================================
  // GESTÃO DE UNIDADES/FILIAIS
  // ========================================================================

  // ADICIONAR UNIDADE (POST /api/clients/:id/locations)
  const addClientLocation = async (clientId: number, locationData: any): Promise<boolean> => {
    try {
      const payload = {
        name: locationData.name,
        email: locationData.email || '',
        phone: locationData.phone || '',
        cnpj: locationData.cnpj || '',
        address: {
          street: locationData.address.street,
          number: locationData.address.number,
          complement: locationData.address.complement || '',
          zip_code: locationData.address.zipCode,
          neighborhood: locationData.address.neighborhood,
          city: locationData.address.city,
          state: locationData.address.state
        },
        area: locationData.area,
        isPrimary: Boolean(locationData.isPrimary || false)
      };

      const response = await api.post(`/clients/${clientId}/locations`, payload);
      
      if (response.status === 201 || response.status === 200) {
        const newLocation: ClientLocation = {
          id: response.data.branch_id?.toString() || 
               response.data.location?.id?.toString() || 
               `loc-${Date.now()}`,
          name: locationData.name,
          email: locationData.email || '',
          phone: locationData.phone || '',
          cnpj: locationData.cnpj || '',
          area: locationData.area,
          isPrimary: Boolean(locationData.isPrimary || false),
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
        
        // Adiciona localmente para resposta instantânea
        addClientLocationLocally(clientId, newLocation);
        
        toast.success("Unidade adicionada com sucesso!");
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao adicionar unidade:", error);
      
      // Tratamento específico para validação
      if (error.response?.status === 400) {
        toast.error(`Erro de validação: ${error.response?.data?.message || 'Dados inválidos'}`);
      } else {
        toast.error(`Erro ao adicionar unidade: ${error.response?.data?.message || 'Erro desconhecido'}`);
      }
      
      return false;
    }
    return false;
  };

  // ATUALIZAR UNIDADE (PUT /api/clients/:id/locations/:locationId)
  const updateClientLocation = async (clientId: number, locationId: string, locationData: any): Promise<boolean> => {
    try {
      const payload = {
        name: locationData.name,
        email: locationData.email || '',
        phone: locationData.phone || '',
        cnpj: locationData.cnpj || '',
        area: locationData.area,
        isPrimary: Boolean(locationData.isPrimary || false),
        address: {
          street: locationData.address.street,
          number: locationData.address.number,
          complement: locationData.address.complement || '',
          zip_code: locationData.address.zipCode,
          neighborhood: locationData.address.neighborhood,
          city: locationData.address.city,
          state: locationData.address.state
        }
      };

      const response = await api.put(`/clients/${clientId}/locations/${locationId}`, payload);
      
      if (response.status === 200) {
        // Atualiza localmente para resposta instantânea
        updateClientLocationLocally(clientId, locationId, {
          name: locationData.name,
          email: locationData.email,
          phone: locationData.phone,
          cnpj: locationData.cnpj,
          area: locationData.area,
          isPrimary: Boolean(locationData.isPrimary || false),
          address: locationData.address
        });
        
        toast.success("Unidade atualizada com sucesso!");
        return true;
      }
    } catch (error: any) {
      console.error("Erro ao atualizar unidade:", error);
      
      // Tratamento específico para unidade não encontrada
      if (error.response?.status === 404) {
        toast.error('Unidade não encontrada');
      } else {
        toast.error(`Erro ao atualizar unidade: ${error.response?.data?.message || 'Erro desconhecido'}`);
      }
      
      return false;
    }
    return false;
  };

  // REMOVER UNIDADE (DELETE /api/clients/:id/locations/:locationId)
  const removeClientLocation = async (clientId: number, locationId: string): Promise<void> => {
    try {
      // Verifica se é uma unidade temporária (não persistida)
      if (locationId.toString().startsWith('temp-')) {
        // Remove apenas localmente
        removeClientLocationLocally(clientId, locationId);
        toast.success("Unidade removida!");
        return;
      }

      const response = await api.delete(`/clients/${clientId}/locations/${locationId}`);
      
      if (response.status === 200) {
        // Remove localmente para resposta instantânea
        removeClientLocationLocally(clientId, locationId);
        
        toast.success("Unidade removida com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao remover unidade:", error);
      
      // Tratamento específico para unidade não encontrada
      if (error.response?.status === 404) {
        toast.error('Unidade não encontrada');
      } else if (error.response?.status === 400) {
        toast.error('Não é possível remover a unidade matriz');
      } else {
        toast.error(`Erro ao remover unidade: ${error.response?.data?.message || 'Erro desconhecido'}`);
      }
      
      // Mesmo se a API falhar, remove localmente para consistência
      removeClientLocationLocally(clientId, locationId);
    }
  };

  // ========================================================================
  // FUNÇÕES DE ATUALIZAÇÃO EM MASSA (LEGADO - MANTIDAS PARA COMPATIBILIDADE)
  // ========================================================================

  const updateClientLocations = async (clientId: number, locations: ClientLocation[]): Promise<void> => {
    try {
      // Atualização local apenas
      setClients(prev => prev.map(client => 
        client.id === clientId ? { ...client, locations } : client
      ));
      
      toast.success("Unidades atualizadas localmente");
    } catch (error) {
      console.error("Erro ao atualizar localizações:", error);
      toast.error("Erro ao atualizar unidades");
    }
  };

  // ========================================================================
  // FUNÇÕES DE BUSCA E FILTRO
  // ========================================================================

  // Buscar cliente por ID
  const getClientById = useCallback((id: number): Client | undefined => {
    return clients.find(client => client.id === id);
  }, [clients]);

  // Buscar unidades de um cliente
  const getClientLocations = useCallback((clientId: number): ClientLocation[] => {
    const client = clients.find(c => c.id === clientId);
    return client?.locations || [];
  }, [clients]);

  // Buscar unidade específica
  const getLocationById = useCallback((clientId: number, locationId: string): ClientLocation | undefined => {
    const client = clients.find(c => c.id === clientId);
    return client?.locations?.find(loc => loc.id === locationId);
  }, [clients]);

  // ========================================================================
  // ATUALIZAÇÃO PERIÓDICA (OPCIONAL)
  // ========================================================================

  useEffect(() => {
    fetchClients();
    
    // Atualiza a cada 2 minutos (opcional)
    const interval = setInterval(() => {
      fetchClients(false);
    }, 120000); // 2 minutos
    
    return () => clearInterval(interval);
  }, [fetchClients]);

  // ========================================================================
  // RETORNO DO HOOK
  // ========================================================================

  return { 
    // Estado
    clients, 
    loading,
    refreshing,
    
    // Funções principais
    fetchClients,
    saveClient,
    updateClient,
    deleteClient, 
    toggleClientStatus,
    
    // Gestão de unidades
    addClientLocation,
    updateClientLocation,
    removeClientLocation,
    updateClientLocations, // Legado
    
    // Funções de busca
    getClientById,
    getClientLocations,
    getLocationById
  };
}