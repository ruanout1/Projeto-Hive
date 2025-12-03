// hooks/useServiceRequests.ts - VERSÃO COMPLETA E CORRIGIDA
import { useState, useEffect, useCallback } from 'react';
import { ServiceRequest, ServiceRequestsFilters, RequestStatus } from '../types';
import { serviceRequestsAPI } from '../utils/api';

export const useServiceRequests = (managerId: string, managerAreas: string[]) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceRequestsFilters>({
    status: 'all',
    search: ''
  });

  // Carregar solicitações
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceRequestsAPI.getByManager(managerId, managerAreas);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, [managerId, managerAreas]);

  // Atualizar status da solicitação
  const updateRequestStatus = useCallback(async (
    requestId: string, 
    status: RequestStatus, 
    updates?: Partial<ServiceRequest>
  ) => {
    try {
      const updatedRequest = await serviceRequestsAPI.updateStatus(requestId, status, updates);
      
      // Atualizar localmente
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, ...updatedRequest } : req
      ));
      
      return updatedRequest;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar solicitação');
    }
  }, []);

  // Aceitar solicitação
  const acceptRequest = useCallback(async (
    requestId: string, 
    scheduledDate: string, 
    teamData: {
      assignedTeam?: string;
      assignedTeamMembers?: string[];
      assignedCollaborator?: string;
    }, 
    scheduledDescription: string
  ) => {
    try {
      const updates = {
        scheduled_date: scheduledDate,
        scheduledDescription,
        ...teamData,
        status_key: 'approved' as RequestStatus
      };
      
      return await updateRequestStatus(requestId, 'approved', updates);
    } catch (err) {
      throw err;
    }
  }, [updateRequestStatus]);

  // Encaminhar para admin
  const escalateToAdmin = useCallback(async (requestId: string, reason: string) => {
    try {
      const updates = {
        managerRefusalReason: reason,
        status_key: 'refused-by-manager' as RequestStatus
      };
      
      return await updateRequestStatus(requestId, 'refused-by-manager', updates);
    } catch (err) {
      throw err;
    }
  }, [updateRequestStatus]);

  // Aplicar filtros
  const filteredRequests = requests.filter((req: ServiceRequest) => {
    const matchesStatus = filters.status === 'all' || req.status === filters.status;
    const matchesSearch = req.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         req.serviceType.toLowerCase().includes(filters.search.toLowerCase()) ||
                         req.id.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Estatísticas
  const statusCounts = {
    total: requests.length,
    pending: requests.filter((r: ServiceRequest) => r.status === 'pending').length,
    delegated: requests.filter((r: ServiceRequest) => r.status === 'delegated').length,
    urgent: requests.filter((r: ServiceRequest) => r.status === 'urgent').length,
    approved: requests.filter((r: ServiceRequest) => r.status === 'approved').length,
    awaitingClient: requests.filter((r: ServiceRequest) => r.status === 'awaiting-client-confirmation').length,
    inProgress: requests.filter((r: ServiceRequest) => r.status === 'in-progress').length,
    completed: requests.filter((r: ServiceRequest) => r.status === 'completed').length
  };

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests: filteredRequests,
    allRequests: requests,
    loading,
    error,
    filters,
    setFilters,
    statusCounts,
    updateRequestStatus,
    acceptRequest,
    escalateToAdmin,
    refreshRequests: loadRequests
  };
};