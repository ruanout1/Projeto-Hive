import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';
import { Service, Category } from '../types';

export const useCatalog = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Busca os dados em paralelo
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get('/service-catalog'),
        api.get('/service-catalog/categories')
      ]);
      
      if (!servicesRes.data || !categoriesRes.data) {
        throw new Error('Resposta da API inválida');
      }
      
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      const errorMsg = err.response?.data?.message || err.message || "Não foi possível carregar os dados.";
      setError(errorMsg);
      toast.error("Erro ao carregar dados", { description: errorMsg });
    } finally {
      setLoading(false);
    }
  }, []); // useCallback para estabilizar a função

  useEffect(() => {
    fetchData(); // Busca na primeira renderização
  }, [fetchData]);

  return {
    services,
    setServices, // Para atualizações locais (ex: toggle status)
    categories,
    setCategories, // Para atualizações locais
    loading,
    error,
    refetch: fetchData, // Para recarregar tudo após uma mutação
  };
};