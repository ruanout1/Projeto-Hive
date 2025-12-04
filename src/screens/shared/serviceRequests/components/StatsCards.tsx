import React from 'react';
import { UserCog, Clock, CheckCircle, Users } from 'lucide-react';

interface StatsCardsProps {
  counts: {
    total: number;
    pending: number;
    delegated: number;
    urgent: number;
    approved: number;
    awaitingClient: number;
    inProgress: number;
    completed: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
        <p className="text-sm text-gray-600 mb-2">Total</p>
        <p className="text-2xl" style={{ color: '#6400A4' }}>{counts.total}</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <UserCog className="h-3 w-3" />
          Delegadas
        </p>
        <p className="text-2xl" style={{ color: '#8B20EE' }}>{counts.delegated}</p>
      </div>
      
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFAA00' }}>
        <p className="text-sm text-gray-600 mb-2">Pendentes</p>
        <p className="text-2xl" style={{ color: '#FFAA00' }}>{counts.pending}</p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
        <p className="text-sm text-gray-600 mb-2">Aprovados</p>
        <p className="text-2xl" style={{ color: '#35BAE6' }}>{counts.approved}</p>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#DAA520' }}>
        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Aguard. Cliente
        </p>
        <p className="text-2xl" style={{ color: '#DAA520' }}>{counts.awaitingClient}</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
        <p className="text-sm text-gray-600 mb-2">Em Andamento</p>
        <p className="text-2xl" style={{ color: '#8B20EE' }}>{counts.inProgress}</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2" style={{ borderColor: '#16a34a' }}>
        <p className="text-sm text-gray-600 mb-2">Concluídos</p>
        <p className="text-2xl" style={{ color: '#16a34a' }}>{counts.completed}</p>
      </div>
    </div>
  );
};