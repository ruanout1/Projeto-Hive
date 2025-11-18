import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { DashboardStats, Service } from '../types';

const API_URL = 'http://localhost:5000/api/manager';

export const useDashboardApi = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
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
      const [statsRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/stats`),
        axios.get(`${API_URL}/requests/active`)
      ]);

      if (!statsRes.data || typeof statsRes.data !== 'object') {
        throw new Error('Formato de dados inválido para estatísticas');
      }
      if (!Array.isArray(servicesRes.data)) {
        throw new Error('Formato de dados inválido para serviços');
      }

      setStats(statsRes.data);
      setServices(servicesRes.data);
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

  return { stats, services, loading, error, actionLoading, handleRefresh };
};