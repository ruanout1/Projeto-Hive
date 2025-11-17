import { Badge } from '../../../components/ui/badge';
import { ViewModeProps } from './types';
import { formatDate, getItemsForDate, getWeekDays, getDayName, getTypeColor } from './utils';

export default function WeeklyView({ selectedDate, schedule, onItemClick }: ViewModeProps) {
  const weekDays = getWeekDays(selectedDate);
  const today = new Date();
  const todayStr = formatDate(today);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
        <h3 className="text-lg" style={{ color: '#6400A4' }}>
          Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </h3>
      </div>

      {weekDays.map((date, index) => {
        const dayItems = getItemsForDate(date, schedule);
        const isToday = formatDate(date) === todayStr;
        
        return (
          <div
            key={index}
            className="border-2 rounded-lg p-4 bg-gray-50"
            style={{ borderColor: isToday ? '#6400A4' : '#e5e7eb' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-black">{getDayName(date.getDay())} - {date.getDate()}/{date.getMonth() + 1}</h4>
                {isToday && (
                  <Badge className="mt-1" style={{ backgroundColor: '#6400A4', color: 'white' }}>
                    Hoje
                  </Badge>
                )}
              </div>
              <Badge className="text-xs bg-gray-200 text-gray-700 border-none">
                {dayItems.length} {dayItems.length === 1 ? 'atividade' : 'atividades'}
              </Badge>
            </div>

            {dayItems.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">Sem atividades agendadas</p>
            ) : (
              <div className="space-y-2">
                {dayItems
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((item) => {
                    const colors = getTypeColor(item.type, item.status);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className="p-3 rounded border-l-4 cursor-pointer hover:shadow-md transition-all"
                        style={{
                          borderLeftColor: colors.border,
                          backgroundColor: colors.light
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-black">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.time}{item.endTime && ` - ${item.endTime}`}</p>
                          </div>
                          <Badge
                            className="text-xs border-none ml-2"
                            style={{ backgroundColor: colors.bg, color: 'white' }}
                          >
                            {item.type === 'service' ? (item.status === 'completed' ? 'Concluído' : 'Serviço') : 'Reunião'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}