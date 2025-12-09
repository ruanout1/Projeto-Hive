import { ServiceRequest, RequestStatus } from '../types';
// Importa a instância centralizada que já tem o Token e a URL Base corretos
import api from '../../../../lib/api'; 

export const serviceRequestsAPI = {
  
  // 1. BUSCAR SOLICITAÇÕES
  async getByManager(managerId: string, areas: string[]): Promise<ServiceRequest[]> {
    try {
      // O Controller já filtra pelo usuário logado (token). 
      // Se precisar filtrar por áreas específicas, passamos na query.
      const response = await api.get(`/service-requests`); 
      
      const data = response.data;
      
      // Mapeia os dados do Banco (Snake Case) para a Interface do Front (Camel Case)
      return data.map((request: any) => ({
        // ========== CAMPOS DO BACKEND (Snake Case) ==========
        service_request_id: request.service_request_id,
        request_number: request.request_number,
        company_id: request.company_id,
        branch_id: request.branch_id,
        service_catalog_id: request.service_catalog_id,
        title: request.title,
        description: request.description,
        desired_date: request.desired_date,
        desired_time: request.desired_time,
        priority_key: request.priority_key,
        status_key: request.status_key,
        assigned_manager_user_id: request.assigned_manager_user_id,
        assigned_team_id: request.assigned_team_id,
        assigned_collaborator_user_id: request.assigned_collaborator_user_id,
        observations: request.observations,
        created_at: request.created_at,
        updated_at: request.updated_at,

        // Relacionamentos do backend (mapeados)
        company: request.company,
        branch: request.branch,
        service_catalog: request.service_catalog,
        requester: request.requester_user,
        scheduled_services: request.scheduled_services,
        // Mapeia label do backend para name no frontend
        status_key_service_status: request.status_key_service_status ? {
          status_key: request.status_key_service_status.status_key,
          name: request.status_key_service_status.label || 'Indefinido'
        } : undefined,
        priority_key_priority_level: request.priority_key_priority_level ? {
          priority_key: request.priority_key_priority_level.priority_key,
          name: request.priority_key_priority_level.label || 'Normal'
        } : undefined,

        // ========== CAMPOS MAPEADOS PARA O FRONTEND (Camel Case) ==========
        id: request.request_number || String(request.service_request_id),
        clientName: request.company?.name || 'Cliente não identificado',
        clientArea: request.branch?.area?.name || 'centro',
        clientLocation: request.branch?.name || 'Endereço Principal',
        serviceType: request.service_catalog?.name || 'Serviço Geral',
        requestDate: request.created_at ? new Date(request.created_at).toLocaleDateString('pt-BR') : '',
        requestTime: request.desired_time || '08:00',
        preferredDate: request.desired_date ? new Date(request.desired_date).toLocaleDateString('pt-BR') : '',
        status: request.status_key as RequestStatus,

        // Campos opcionais de agendamento
        scheduledDate: request.scheduled_services?.[0]?.scheduled_date,
        scheduledDescription: request.scheduled_services?.[0]?.notes
      }));

    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      throw error;
    }
  },

  // 2. ATUALIZAR STATUS (Aprovar/Rejeitar/Concluir)
  async updateStatus(requestId: string, status: RequestStatus, updates: any): Promise<any> {
    try {
      // Se for atualização simples de status (Aprovar/Rejeitar)
      if (status === 'approved' || status === 'rejected' || status === 'completed' || status === 'refused-by-manager') {
         const payload = {
            status: status,
            notes: updates?.observations || updates?.managerRefusalReason || '' // Mapeia a observação corretamente
         };
         
         const response = await api.put(`/service-requests/${requestId}/status`, payload);
         return response.data;
      }

      // Se for agendamento (criar ordem de serviço)
      // Nota: Precisamos garantir que essa rota exista no backend se formos usar
      if (updates.scheduled_date) {
        const response = await api.post(`/scheduled-services`, {
           service_request_id: parseInt(requestId),
           scheduled_date: updates.scheduled_date,
           notes: updates.scheduledDescription,
           // team_id e collaborator_id viriam aqui
           status_key: 'scheduled'
        });
        return response.data;
      }
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  // 3. ENCAMINHAR PARA ADMIN
  async escalateToAdmin(requestId: string, reason: string): Promise<any> {
    try {
      // Reutiliza a rota de status, mudando para um status específico de 'escalated' ou similar
      // Ou se você criou a rota específica '/escalate' no backend:
      const response = await api.put(`/service-requests/${requestId}/status`, {
         status: 'pending', // Ou um status 'escalated' se tiver no enum
         notes: `Encaminhado ao Admin: ${reason}`
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao encaminhar:', error);
      throw error;
    }
  }
};

// --- API DE EQUIPES (Se necessário para o select) ---
export const teamsAPI = {
  async getByAreas(areas: string[]): Promise<any[]> {
    try {
      // Usa a rota que criamos: /api/teams
      const response = await api.get(`/teams?areas=${areas.join(',')}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      throw error;
    }
  }
};

// --- API DO GESTOR ATUAL ---
export const managersAPI = {
  async getCurrent(): Promise<any> {
    try {
      const response = await api.get(`/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar dados do gestor:', error);
      throw error;
    }
  }
};