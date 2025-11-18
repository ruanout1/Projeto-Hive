import axios from "axios";
import { toast } from 'sonner';

// =========================================
// 1. BASE URL DO BACKEND
// =========================================
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
});

// =========================================
// 2. INTERCEPTOR DE REQUISIÇÃO (TOKEN)
// =========================================
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

// =========================================
// 3. INTERCEPTOR DE RESPOSTA (ERROS)
// =========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {

    const requestUrl = error.config?.url || "";

    // =======================================================
    // 🚫  IGNORAR 401 PARA O LOGIN — NÃO REDIRECIONAR AQUI
    // =======================================================
    if (requestUrl.includes('/auth/login')) {
      return Promise.reject(error);
    }

    // =======================================================
    // 🔒  TRATAR 401 APENAS PARA ROTAS QUE PRECISAM DE TOKEN
    // =======================================================
    if (error.response?.status === 401) {
      toast.error('Sessão expirada', {
        description: 'Faça login novamente.'
      });

      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// =========================================
// 4. FUNÇÕES DA API DE PONTO
// =========================================

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

// =========================================
// 5. FUNÇÕES DA API DE AGENDA DO COLABORADOR
// =========================================

export const getMySchedule = async () => {
  const response = await api.get('/collaborator-schedule/my-schedule');
  return response.data;
};


export default api;