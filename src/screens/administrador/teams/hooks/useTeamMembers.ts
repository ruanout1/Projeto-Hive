import { useState, useEffect, useCallback } from 'react';
import { TeamMember } from '../types';
import api from '../../../../lib/api'; // <-- 1. Caminho relativo corrigido

export const useTeamMembers = (teamId?: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // 2. Usa api.get
      const url = id ? `/teams/${id}/members` : '/team-members';
      const response = await api.get(url);
      setMembers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []); // useCallback

  const addMember = async (userId: string, role: TeamMember['role'] = 'member'): Promise<boolean> => {
    if (!teamId) return false;
    try {
      // 3. Usa api.post
      await api.post(`/teams/${teamId}/members`, { userId, role });
      await fetchTeamMembers(teamId); // Recarrega
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao adicionar membro');
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    try {
      // 4. Usa api.delete
      await api.delete(`/team-members/${memberId}`);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao remover membro');
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, role: TeamMember['role']): Promise<boolean> => {
    try {
      // 5. Usa api.put
      await api.put(`/team-members/${memberId}/role`, { role });
      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role } : member
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar função');
      return false;
    }
  };

  // ... (funções getMembersByTeam, getMemberCount permanecem iguais)
  const getMembersByTeam = (teamId: string): TeamMember[] => {
    return members.filter(member => member.teamId === teamId && member.isActive);
  };
  const getMemberCount = (teamId: string): number => {
    return members.filter(member => member.teamId === teamId && member.isActive).length;
  };

  useEffect(() => {
    fetchTeamMembers(teamId);
  }, [teamId, fetchTeamMembers]);

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