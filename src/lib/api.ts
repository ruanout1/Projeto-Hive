import axios from "axios";
import { toast } from 'sonner';

// ... (código existente: interceptors, etc.) ...
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    if (requestUrl.includes('/auth/login')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      toast.error('Sessão expirada', { description: 'Faça login novamente.' });
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ... (funções de ponto existentes) ...
export const clockIn = async (location: { latitude: number; longitude: number; address: string }) => {
  const response = await api.post('/collaborator-time-clock/clock-in', location);
  return response.data;
};

export const clockOut = async (location: { latitude: number; longitude: number; address: string }) => {
  const response = await api.post('/collaborator-time-clock/clock-out', location);
  return response.data;
};

export const startBreak = async () => {
  const response = await api.post('/collaborator-time-clock/start-break');
  return response.data;
};

export const endBreak = async () => {
  const response = await api.post('/collaborator-time-clock/end-break');
  return response.data;
};

export const getTimeClockHistory = async () => {
  const response = await api.get('/collaborator-time-clock/history');
  return response.data;
};


// ========================================================
// 5. FUNÇÕES DA API DE EXECUÇÃO DE SERVIÇOS
// ========================================================

export const getMySchedule = async () => {
  const response = await api.get('/service-execution/my-services'); 
  return response.data;
};

interface UpdateStatusPayload {
  newStatus: 'in_progress' | 'completed';
  completion_notes?: string;
}

export const updateServiceStatus = async (serviceId: string | number, payload: UpdateStatusPayload) => {
  const response = await api.put(`/service-execution/${serviceId}/status`, payload);
  return response.data;
};

export const uploadServicePhotos = async (serviceId: string | number, photoType: 'before' | 'after', photos: File[]) => {
  const formData = new FormData();
  
  formData.append('photo_type', photoType);
  
  photos.forEach(photo => {
    formData.append('photos', photo);
  });

  const response = await api.post(`/service-execution/${serviceId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// ========================================================
// 6. FUNÇÕES DA API DO DASHBOARD
// ========================================================

/**
 * NOVO: Busca os dados consolidados para o dashboard do colaborador.
 */
export const getCollaboratorDashboard = async () => {
  const response = await api.get('/dashboard/collaborator');
  return response.data;
};


export default api;
