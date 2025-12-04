import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { DashboardStats, Service, Team } from '../types';

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
      // ROTA UNIFICADA: O backend sabe que é 'manager' pelo token
      const response = await api.get('/dashboard');
      const data = response.data;

      // O Controller unificado retorna: { type: 'manager', stats, services, teams }
      if (data.type !== 'manager') {
         // Caso um admin tente usar este hook, ou erro de role
         console.warn('Tipo de dashboard inesperado:', data.type);
      }

      setStats(data.stats || null);
      setServices(data.services || []);
      setTeams(data.teams || []);

      if (isRefresh) {
        toast.success('Dados atualizados com sucesso!');
      }
    } catch (err: any) {
      console.error("Erro ao buscar dados do dashboard:", err);
      const errorMessage = err.response?.data?.message || "Não foi possível carregar os dados.";
      setError(errorMessage);
      if (isRefresh) {
        toast.error("Erro ao atualizar", { description: errorMessage });
      }
    } finally {
      setLoading(false);
      setActionLoading(false);
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