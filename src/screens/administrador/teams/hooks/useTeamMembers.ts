import { useState, useEffect } from 'react';
import api from '../../../../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function useTeamMembers() {
  const [managers, setManagers] = useState<User[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar gestores disponíveis
      const managersResponse = await api.get('/teams/available/managers');
      
      // Buscar colaboradores disponíveis
      const membersResponse = await api.get('/teams/available/members');

      setManagers(managersResponse.data.data || []);
      setMembers(membersResponse.data.data || []);
    } catch (err: any) {
      console.error('Erro ao buscar usuários disponíveis:', err);
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      setManagers([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    managers,
    members,
    loading,
    error,
    refetch: fetchAvailableUsers
  };
}