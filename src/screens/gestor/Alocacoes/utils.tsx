import { Badge } from '../../../components/ui/badge';
import { workDaysOptions } from './types';

export const getStatusBadge = (status: string) => {
  const configs = {
    active: { label: 'Em Andamento', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    upcoming: { label: 'Agendado', color: '#35BAE6', bgColor: 'rgba(53, 186, 230, 0.1)' },
    completed: { label: 'Concluído', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    cancelled: { label: 'Cancelado', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
  };
  const config = configs[status as keyof typeof configs] || configs.active;
  
  return (
    <Badge style={{ backgroundColor: config.bgColor, color: config.color }}>
      {config.label}
    </Badge>
  );
};

export const getInitials = (name: string) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
};

export const formatWorkDays = (days: string[]) => {
  const dayLabels = days.map(day => {
    const option = workDaysOptions.find(opt => opt.id === day);
    return option?.label || day;
  });
  return dayLabels.join(', ');
};
