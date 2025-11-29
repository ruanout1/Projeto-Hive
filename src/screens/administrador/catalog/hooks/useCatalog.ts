import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api'; // Ajuste o caminho se necessário
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
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get('/service-catalog'),
        api.get('/service-catalog/categories')
      ]);
      
      // AJUSTE DE FLEXIBILIDADE: Aceita tanto array direto quanto objeto { data: [] }
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data?.data || []);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : (categoriesRes.data?.data || []);
      
      setServices(servicesData);
      setCategories(categoriesData);

    } catch (err: any) {
      console.error("Erro ao buscar dados:", err);
      const errorMsg = err.response?.data?.message || "Não foi possível carregar o catálogo.";
      setError(errorMsg);
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    services,
    setServices,
    categories,
    setCategories,
    loading,
    error,
    refetch: fetchData,
  };
};