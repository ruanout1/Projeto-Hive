import { Card, CardContent } from '../../../components/ui/card';
import { Briefcase, Users, CheckCircle } from 'lucide-react';
import { ScheduleStatsProps } from './types';

export default function ScheduleStats({ stats, schedule }: ScheduleStatsProps) {
  // Se temos stats da API, usamos eles. Senão, calculamos do schedule
  const upcomingServices = stats?.upcoming_services || schedule.filter(item => 
    item.type === 'service' && item.status === 'scheduled'
  ).length;

  const upcomingMeetings = stats?.upcoming_meetings || schedule.filter(item => 
    item.type === 'meeting' && item.status === 'scheduled'
  ).length;

  const completedToday = stats?.completed_today || schedule.filter(item => {
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    return item.date === todayStr && item.status === 'completed';
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card>
        <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', borderLeft: '4px solid #35BAE6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#0369a1' }}>Serviços Agendados</p>
              <p className="text-2xl" style={{ color: '#35BAE6' }}>{upcomingServices}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.2)' }}>
              <Briefcase className="h-6 w-6" style={{ color: '#35BAE6' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)', borderLeft: '4px solid #8B20EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#6b21a8' }}>Reuniões Agendadas</p>
              <p className="text-2xl" style={{ color: '#8B20EE' }}>{upcomingMeetings}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.2)' }}>
              <Users className="h-6 w-6" style={{ color: '#8B20EE' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#15803d' }}>Concluídos Hoje</p>
              <p className="text-2xl" style={{ color: '#22c55e' }}>{completedToday}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle className="h-6 w-6" style={{ color: '#22c55e' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}