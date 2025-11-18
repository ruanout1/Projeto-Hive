import { CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { DashboardStats } from './types';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Card Concluídos */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Concluídos</p>
            <p className="text-3xl text-green-600">{stats?.concluido || 0}</p>
          </div>
          <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
        </div>
      </div>

      {/* Card Em Andamento */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2" style={{ borderColor: '#35BAE6' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
            <p className="text-3xl" style={{ color: '#35BAE6' }}>{stats?.['em-andamento'] || 0}</p>
          </div>
          <Clock className="h-10 w-10" style={{ color: '#35BAE6', opacity: 0.5 }} />
        </div>
      </div>

      {/* Card Agendados */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2" style={{ borderColor: '#FFFF20' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Agendados</p>
            <p className="text-3xl text-gray-800">{stats?.agendado || 0}</p>
          </div>
          <Calendar className="h-10 w-10 text-gray-600 opacity-50" />
        </div>
      </div>

      {/* Card Pendentes */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Pendentes</p>
            <p className="text-3xl text-orange-600">{stats?.pendente || 0}</p>
          </div>
          <AlertCircle className="h-10 w-10 text-orange-500 opacity-50" />
        </div>
      </div>
    </div>
  );
};