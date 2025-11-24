import api from '../../../lib/api';
import type { ServiceRequest, ApiResponse } from '../types';

export const serviceRequestApi = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<ServiceRequest[]>>(
      '/api/clientes/requests'
    );
    return data.data;
  },

  create: async (request: ServiceRequest) => {
    const { data } = await api.post<ApiResponse<ServiceRequest>>(
      '/api/clientes/requests',
      request
    );
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<ServiceRequest>>(
      `/api/clientes/requests/${id}`
    );
    return data.data;
  },
};