import { useState, useEffect } from 'react';
import { Team } from '../types';
import api from '../../../../lib/api';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/teams');
      // ✅ CORRIGIDO: Backend retorna { success: true, data: [...] }
      setTeams(response.data.data || response.data || []); // Tenta pegar .data.data ou .data como fallback
    
    } catch (err: any) {
      console.error('Erro no useTeams:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao carregar equipes.');
      setTeams([]); // Define array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
};