import { useState, useEffect } from 'react';
import { TeamMember } from '../types';

export const useTeamMembers = (teamId?: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async (id?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = id ? `/api/teams/${id}/members` : '/api/team-members';
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Erro ao carregar membros');
      
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (userId: string, role: TeamMember['role'] = 'member'): Promise<boolean> => {
    if (!teamId) return false;

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) throw new Error('Erro ao adicionar membro');

      await fetchTeamMembers(teamId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao remover membro');

      setMembers(prev => prev.filter(member => member.id !== memberId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover membro');
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: TeamMember['role']): Promise<boolean> => {
    try {
      const response = await fetch(`/api/team-members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar função');

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role } : member
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar função');
      return false;
    }
  };

  const getMembersByTeam = (teamId: string): TeamMember[] => {
    return members.filter(member => member.teamId === teamId && member.isActive);
  };

  const getMemberCount = (teamId: string): number => {
    return members.filter(member => member.teamId === teamId && member.isActive).length;
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamMembers(teamId);
    } else {
      fetchTeamMembers();
    }
  }, [teamId]);

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
    updateMemberRole,
    getMembersByTeam,
    getMemberCount,
    refetch: () => fetchTeamMembers(teamId),
  };
};