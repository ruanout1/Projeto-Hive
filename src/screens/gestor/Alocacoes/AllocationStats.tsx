import { Users, Building2, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import type { AllocationStats } from './types';

interface AllocationStatsProps {
  stats: AllocationStats;
  setFilterStatus: (status: string) => void;
}

export function AllocationStats({ stats, setFilterStatus }: AllocationStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl" style={{ color: '#6400A4' }}>{stats.total}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
              <Users className="h-6 w-6" style={{ color: '#6400A4' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('active')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Em Andamento</p>
              <p className="text-3xl" style={{ color: '#10B981' }}>{stats.active}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <CheckCircle className="h-6 w-6" style={{ color: '#10B981' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('upcoming')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Agendadas</p>
              <p className="text-3xl" style={{ color: '#35BAE6' }}>{stats.upcoming}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
              <Calendar className="h-6 w-6" style={{ color: '#35BAE6' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('completed')}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Concluídas</p>
              <p className="text-3xl text-gray-600">{stats.completed}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}