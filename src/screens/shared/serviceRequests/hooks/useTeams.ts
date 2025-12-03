import { useState, useEffect } from 'react';
import { ServiceTeam } from '../types';
import { teamsAPI } from '../utils/api';

export const useTeams = (managerAreas: string[]) => {
  const [teams, setTeams] = useState<Record<string, ServiceTeam>>({});
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamsAPI.getByAreas(managerAreas);
      
      // Converter para formato esperado pelo componente
      const teamsMap: Record<string, ServiceTeam> = {};
      teamsData.forEach(team => {
        teamsMap[team.name] = team;
      });
      
      setTeams(teamsMap);
    } catch (err) {
      console.error('Erro ao carregar equipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [managerAreas]);

  return {
    teams,
    loading,
    refreshTeams: loadTeams
  };
};