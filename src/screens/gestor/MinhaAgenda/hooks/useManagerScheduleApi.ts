import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ScheduleItem } from '../types';

// ===================================
// API Helper (Função auxiliar com AUTH)
// ===================================
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken'); 
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const apiGet = async (url: string) => {
  const res = await fetch(url, { headers: getAuthHeaders() });
  
  if (res.status === 401) {
    // Token inválido ou expirado
    toast.error('Sessão expirada', { description: 'Por favor, faça login novamente.' });
    // TODO: Redirecionar para o login
    localStorage.removeItem('authToken');
    window.location.href = '/login'; // Força o redirecionamento
    throw new Error('Não autorizado');
  }

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ===================================
// Hook da Agenda (ATUALIZADO)
// ===================================
export const useManagerScheduleApi = () => {
  console.log('🎯 HOOK INICIADO');
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A API agora é a rota raiz, e as rotas de schedule estão em /api/schedule
  const API_BASE = '/api/schedule';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('🔥 FETCH DATA INICIADO!');
    
    try {
      // 1. Pega o token. Se não existir, não pode continuar.
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Usuário não autenticado.');
      }
      
      console.log('🌐 FAZENDO FETCH EM PARALELO...');
      
      // 2. Chama as duas novas rotas em paralelo
      const [scheduleData, statsData] = await Promise.all([
        apiGet(`${API_BASE}`),          // Chama GET /api/schedule
        apiGet(`${API_BASE}/stats`)     // Chama GET /api/schedule/stats
      ]);
      
      console.log('✅ DADOS DE AGENDA RECEBIDOS:', scheduleData.length);
      console.log('✅ DADOS DE STATS RECEBIDOS:', statsData);
      
      setSchedule(scheduleData || []);
      setStats(statsData || null);
      
    } catch (err) {
      console.error('❌ ERRO NO FETCH:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
      console.log('🏁 FETCH DATA FINALIZADO!');
    }
  }, []); // O array de dependências vazio faz isso rodar 1 vez

  // Roda o fetchData na primeira vez que o hook é usado
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // A função refetch agora chama o fetchData
  const refetch = () => {
    console.log('🔄 REFETCH SOLICITADO!');
    fetchData();
  };

  return { schedule, stats, loading, error, refetch };
};