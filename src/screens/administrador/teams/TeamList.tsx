import React from 'react';
import { Team } from './types';
import { TeamCard } from './TeamCard';

interface TeamListProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onViewMembers?: (team: Team) => void;
}

export const TeamList: React.FC<TeamListProps> = ({ 
  teams, 
  onEdit, 
  onDelete, 
  onViewMembers 
}) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma equipe encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-6">
      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewMembers={onViewMembers}
        />
      ))}
    </div>
  );
};