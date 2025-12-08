import axios from "axios";
import { toast } from 'sonner';

// =========================================
// 1. BASE URL DO BACKEND
// =========================================
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false
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

export default api;
