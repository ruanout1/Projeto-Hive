import api from '../../../lib/api';
import type { 
  Client, 
  CurrentService, 
  ServiceHistoryItem,
  ApiResponse 
} from '../types';

export const clientApi = {
  // Dashboard
  getCurrentService: async (): Promise<CurrentService> => {
    const { data } = await api.get<ApiResponse<CurrentService>>(
      '/api/clientes/current-service'
    );
    return data.data;
  },

  getHistory: async (): Promise<ServiceHistoryItem[]> => {
    const { data } = await api.get<ApiResponse<ServiceHistoryItem[]>>(
      '/api/clientes/history'
    );
    return data.data;
  },

  getTimeline: async () => {
    const { data } = await api.get('/api/clientes/timeline');
    return data.data;
  },

  // Documentos
  getDocuments: async () => {
    const { data } = await api.get('/api/clientes/documents');
    return data.data;
  },

  uploadDocument: async (file: File, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    const { data } = await api.post(
      '/api/clientes/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return data;
  },
};