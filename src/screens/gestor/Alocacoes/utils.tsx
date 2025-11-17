import { Badge } from '../../../components/ui/badge';
import { WorkDayOption } from './types';

// Constante dos dias da semana
export const workDaysOptions: WorkDayOption[] = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

// Retorna o JSX da Badge de Status
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

// Pega as iniciais de um nome
export const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Formata um intervalo de datas
export const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
};

// Formata a lista de dias de trabalho
export const formatWorkDays = (days: string[]) => {
  const dayLabels = days.map(day => {
    const option = workDaysOptions.find(opt => opt.id === day);
    return option?.label.substring(0, 3) || day; // Retorna "Seg, Ter, Qua..."
  });
  return dayLabels.join(', ');
};