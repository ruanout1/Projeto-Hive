// /shared/mySchedule/components/StatsCards.tsx
import { CalendarDays, Calendar, AlertCircle, Bell } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';

interface StatsProps {
  total: number;
  upcoming: number;
  today: number;
  withReminder: number;
}

export function StatsCards({ stats }: { stats: StatsProps }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl" style={{ color: '#6400A4' }}>{stats.total}</p>
          </div>
          <CalendarDays className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
        </div>
      </div>

      {/* Próximos */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Próximos</p>
            <p className="text-2xl" style={{ color: '#8B20EE' }}>{stats.upcoming}</p>
          </div>
          <Calendar className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
        </div>
      </div>

      {/* Hoje */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Hoje</p>
            <p className="text-2xl" style={{ color: '#35BAE6' }}>{stats.today}</p>
          </div>
          <AlertCircle className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
        </div>
      </div>

      {/* Com Lembrete */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-400">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Com Lembrete</p>
            <p className="text-2xl text-yellow-600">{stats.withReminder}</p>
          </div>
          <Bell className="h-8 w-8 text-yellow-500 opacity-50" />
        </div>
      </div>
    </div>
  );
}