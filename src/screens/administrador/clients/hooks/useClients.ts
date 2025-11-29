import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Client } from '../types/client';

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
        setClients(data.clients || []);
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

      // PREPARAÇÃO DO PAYLOAD
      // Converte o zipCode do frontend para zip_code do backend
      const payload = {
        ...clientData,
        legal_name: clientData.name, // Backend pede legal_name
        address: {
          ...clientData.address,
          zip_code: clientData.address.zipCode 
        }
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
        toast.success(isEditing ? 'Cliente atualizado!' : 'Cliente criado com sucesso!');
        fetchClients(); // Recarrega a lista automaticamente
        return true; // Retorna true para fechar o modal
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
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast.success(`Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'}!`);
        // Atualiza a lista localmente para ser rápido
        setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      } else {
        toast.error("Erro ao alterar status");
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

  // Carrega lista inicial
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const updateClientLocations = async (clientId: number, locations: any[]) => {
    try {
        const token = localStorage.getItem('authToken');
        // Vamos reutilizar o endpoint de UPDATE do cliente, mandando apenas as locations
        // O Backend já sabe lidar com isso (fizemos o loop no create, vamos garantir no update)
        const response = await fetch(`http://localhost:5000/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ locations }) // Manda só as locations para atualizar
        });

        if (response.ok) {
            toast.success("Unidades atualizadas!");
            fetchClients(); // Atualiza a lista geral
        } else {
            toast.error("Erro ao salvar unidades");
        }
    } catch (e) {
        toast.error("Erro de rede");
    }
  };

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