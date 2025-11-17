import { Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { ViewModeProps } from './types';
import { formatDate, getItemsForDate, getTypeColor } from './utils';

export default function DailyView({ selectedDate, schedule, onItemClick }: ViewModeProps) {
  const dayItems = getItemsForDate(selectedDate, schedule);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2" style={{ borderColor: '#6400A4' }}>
        <h3 className="text-lg" style={{ color: '#6400A4' }}>
          {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
        </h3>
        <p className="text-2xl">
          {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {dayItems.length} {dayItems.length === 1 ? 'atividade agendada' : 'atividades agendadas'}
        </p>
      </div>

      {dayItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Nenhuma atividade agendada para este dia</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayItems
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((item) => {
              const colors = getTypeColor(item.type, item.status);
              return (
                <div
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.light
                  }}
                >
                  {/* ... conteúdo do item do dia */}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}