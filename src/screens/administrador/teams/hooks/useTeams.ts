import { useState, useEffect } from 'react';
import { Team } from '../types';
import api from '../../../../lib/api'; // <-- 1. Caminho relativo corrigido

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 2. Usa o axios (api.get) e pega o .data
      const response = await api.get('/teams'); // Rota relativa /api/teams
      setTeams(response.data); // No axios, os dados vêm em .data
    
    } catch (err: any) {
      console.error('Erro no useTeams:', err);
      // O interceptor já tratou o 401, aqui pegamos outros erros
      setError(err.response?.data?.message || err.message || 'Erro ao carregar equipes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
};