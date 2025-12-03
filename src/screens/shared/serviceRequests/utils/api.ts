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
        // Identificadores
        id: String(request.request_id),
        
        // Dados do Cliente
        clientName: request.company?.name || 'Cliente não identificado',
        clientArea: request.company?.main_area || 'centro', // Campo novo que criamos
        clientLocation: 'Endereço Principal', // Pode melhorar buscando da branch principal
        
        // Dados do Serviço
        serviceType: request.service_catalog?.name || 'Serviço Geral',
        description: request.description,
        priority: request.priority || 'medium',
        
        // Datas
        requestDate: request.created_at ? new Date(request.created_at).toLocaleDateString('pt-BR') : '',
        requestTime: '08:00', // O banco não tem hora separada na criação, usamos padrão ou extraímos do created_at
        preferredDate: request.preferred_date,
        
        // Status (Backend manda 'status', Front usa esse mesmo enum)
        status: request.status as RequestStatus, 
        
        // Campos opcionais de agendamento (se já tiver virado ordem de serviço)
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