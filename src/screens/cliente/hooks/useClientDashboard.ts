import { useState, useEffect } from 'react';
import { clientApi } from '../services/clientApi';
import type { CurrentService, ServiceHistoryItem } from '../types';

export const useClientDashboard = () => {
  const [currentService, setCurrentService] = useState<CurrentService | null>(null);
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [serviceData, historyData] = await Promise.all([
          clientApi.getCurrentService(),
          clientApi.getHistory(),
        ]);

        setCurrentService(serviceData);
        setHistory(historyData);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    // ... buscar novamente
  };

  return {
    currentService,
    history,
    isLoading,
    error,
    refetch,
  };
};