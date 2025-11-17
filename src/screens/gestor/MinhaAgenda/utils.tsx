import { CheckCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { ScheduleItem, TypeColors } from './types';

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

export const getItemsForDate = (date: Date, schedule: ScheduleItem[]): ScheduleItem[] => {
  const dateStr = formatDate(date);
  return schedule.filter(item => item.date === dateStr);
};

export const getWeekDays = (selectedDate: Date): Date[] => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export const getDayName = (dayIndex: number): string => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayIndex];
};

export const getTypeColor = (type: 'service' | 'meeting', status?: string): TypeColors => {
  if (status === 'completed') {
    return { bg: '#22c55e', light: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' };
  }
  if (type === 'service') {
    return { bg: '#35BAE6', light: 'rgba(53, 186, 230, 0.1)', border: '#35BAE6' };
  }
  return { bg: '#6400A4', light: 'rgba(100, 0, 164, 0.1)', border: '#6400A4' };
};

export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Esta função retorna JSX, por isso o arquivo precisa ser .tsx
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge style={{ backgroundColor: '#35BAE6', color: 'white' }}>
          Agendado
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge style={{ backgroundColor: '#FFFF20', color: '#6400A4' }}>
          Em Andamento
        </Badge>
      );
    case 'completed':
      return (
        <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Concluído
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge style={{ backgroundColor: '#EF4444', color: 'white' }}>
          Cancelado
        </Badge>
      );
    default:
      return (
        <Badge style={{ backgroundColor: '#6B7280', color: 'white' }}>
          {status}
        </Badge>
      );
  }
};