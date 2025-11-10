import { useState, useEffect } from 'react';
import { Team } from '../types';

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/teams');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dados brutos da API:', data); // DEBUG
      
      // ✅ CORREÇÃO DEFINITIVA: Garantir createdAt
      const formattedTeams = data.map((team: any) => ({
        ...team,
        createdAt: team.created_at || team.createdAt || team.updated_at || new Date().toISOString()
      }));
      
      console.log('Dados formatados:', formattedTeams); // DEBUG
      setTeams(formattedTeams);
    } catch (err) {
      console.error('Erro no useTeams:', err);
      setError('Erro ao carregar equipes. Verifique o backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
};