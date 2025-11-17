import { Button } from '../../../components/ui/button';
import { ScheduleCalendarProps } from './types';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';

export default function ScheduleCalendar({
  schedule,
  selectedDate,
  viewMode,
  onViewModeChange,
  onItemClick
}: ScheduleCalendarProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-black">
            {viewMode === 'daily' && 'Visualização Diária'}
            {viewMode === 'weekly' && 'Visualização Semanal'}
          </h2>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            size="sm"
            variant={viewMode === 'daily' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('daily')}
            className="h-8 px-3 text-xs"
            style={viewMode === 'daily' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
          >
            Dia
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'weekly' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('weekly')}
            className="h-8 px-3 text-xs"
            style={viewMode === 'weekly' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
          >
            Semana
          </Button>
        </div>
      </div>

      {viewMode === 'daily' && (
        <DailyView
          selectedDate={selectedDate}
          schedule={schedule}
          onItemClick={onItemClick}
        />
      )}

      {viewMode === 'weekly' && (
        <WeeklyView
          selectedDate={selectedDate}
          schedule={schedule}
          onItemClick={onItemClick}
        />
      )}

      <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#35BAE6' }}></div>
          <span className="text-sm text-gray-600">Serviço Agendado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6400A4' }}></div>
          <span className="text-sm text-gray-600">Reunião</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
          <span className="text-sm text-gray-600">Concluído</span>
        </div>
      </div>
    </>
  );
}