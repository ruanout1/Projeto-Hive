import { useState } from 'react';
import { Team, TeamFormData } from '../types';

export const useTeamMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = async (teamData: TeamFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/manager/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) throw new Error('Erro ao criar equipe');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, teamData: TeamFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/manager/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar equipe');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVA FUNÇÃO: updateTeamStatus
  const updateTeamStatus = async (teamId: string, status: 'active' | 'inactive'): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/manager/teams/${teamId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar status da equipe');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/manager/teams/${teamId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erro ao excluir equipe');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createTeam,
    updateTeam,
    updateTeamStatus, // ✅ ADICIONADA AQUI
    deleteTeam,
    loading,
    error,
    clearError: () => setError(null)
  };
};