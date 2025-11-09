import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { Team } from './types';

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (teamId: string) => void;
  onViewMembers?: (team: Team) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  onEdit, 
  onDelete, 
  onViewMembers 
}) => {
  // DEBUG: Verificar o formato da data
  console.log('Team data for debugging:', {
    id: team.id,
    name: team.name,
    createdAt: team.createdAt,
    typeofCreatedAt: typeof team.createdAt
  });

  // Função para formatar a data corretamente
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Valor:', dateString);
      return 'Erro na data';
    }
  };

  return (
    <div 
      onClick={() => onViewMembers?.(team)}
      className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200 cursor-pointer w-full"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
            <Users className="h-6 w-6" style={{ color: '#8B20EE' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 style={{ color: '#8B20EE' }} className="font-semibold">
                {team.name}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  team.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {team.status === 'active' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Gestor: {team.manager?.name || 'Não definido'}</span>
              <span>•</span>
              <span>{team.members?.length || 0} colaborador{team.members?.length !== 1 ? 'es' : ''}</span>
              <span>•</span>
              <span className="text-xs">
                Criada em {formatDate(team.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};