import React from 'react';
import { TeamMember } from './types';

interface TeamMembersProps {
  members: TeamMember[];
  onAddMember?: (userId: string) => void;
  onRemoveMember?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, role: TeamMember['role']) => void;
}

export const TeamMembers: React.FC<TeamMembersProps> = ({
  members,
  onAddMember,
  onRemoveMember,
  onUpdateRole
}) => {
  const getRoleBadgeColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Membros da Equipe</h3>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">{member.userId}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}
              >
                {member.role}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <select
                value={member.role}
                onChange={(e) => onUpdateRole?.(member.id, e.target.value as TeamMember['role'])}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="member">Membro</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Gerente</option>
              </select>
              
              <button
                onClick={() => onRemoveMember?.(member.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Nenhum membro na equipe
        </p>
      )}
    </div>
  );
};