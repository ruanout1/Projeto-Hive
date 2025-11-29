import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api'; // CORREÇÃO: Importa a instância configurada do Axios
import { DashboardStats, Service, Team } from '../types';

// A constante API_URL não é mais necessária, pois a baseURL está no 'api'

export const useDashboardApi = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setActionLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // CORREÇÃO: Usa a instância 'api' em vez de 'axios.get'
      const [statsRes, servicesRes, teamsRes] = await Promise.all([
        api.get('/manager/dashboard/stats'),
        api.get('/manager/requests/active'),
        api.get('/manager/teams')
      ]);

      if (!statsRes.data || typeof statsRes.data !== 'object') {
        throw new Error('Formato de dados inválido para estatísticas');
      }
      if (!Array.isArray(servicesRes.data)) {
        throw new Error('Formato de dados inválido para serviços');
      }
      if (!Array.isArray(teamsRes.data)) {
        throw new Error('Formato de dados inválido para equipes');
      }

      setStats(statsRes.data);
      setServices(servicesRes.data);
      setTeams(teamsRes.data);

      if (isRefresh) {
        toast.success('Dados atualizados com sucesso!');
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados do dashboard:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Não foi possível carregar os dados. Verifique o backend.";
      setError(errorMessage);
      if (isRefresh) {
        toast.error("Erro ao atualizar", { description: errorMessage });
      }
    } finally {
      if (isRefresh) {
        setActionLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  return { stats, services, teams, loading, error, actionLoading, handleRefresh };
};
