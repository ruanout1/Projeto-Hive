import { useState } from 'react';
import { TeamFormData } from '../types';
import api from '../../../../lib/api'; // <-- 1. Caminho relativo corrigido

export const useTeamMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = async (teamData: TeamFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 2. Usa o axios (api.post)
      await api.post('/teams', teamData); // Rota relativa /api/teams
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: TeamFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 3. Usa o axios (api.put)
      await api.put(`/teams/${teamId}`, teamData); // Rota /api/teams/:id
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStatus = async (teamId: string, status: 'active' | 'inactive'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 4. Usa o axios (api.put)
      await api.put(`/teams/${teamId}/status`, { status }); // Rota /api/teams/:id/status
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 5. Usa o axios (api.delete)
      await api.delete(`/teams/${teamId}`); // Rota /api/teams/:id
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTeam,
    updateTeam,
    updateTeamStatus, 
    deleteTeam,
    loading,
    error,
    clearError: () => setError(null)
  };
};