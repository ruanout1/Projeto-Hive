import { 
  Clock, 
  CheckCircle, 
  Users, 
  XCircle, 
  UserCog, 
  AlertTriangle,
  LucideIcon 
} from 'lucide-react';
import { RequestStatus, StatusConfig } from '../types';

export const getStatusConfig = (status: RequestStatus): StatusConfig => {
  const configs: Record<RequestStatus, StatusConfig> = {
    pending: { 
      label: 'Pendente', 
      color: 'bg-yellow-100 text-yellow-800', 
      icon: Clock 
    },
    urgent: {
      label: 'Urgente',
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle
    },
    delegated: {
      label: 'Aguardando Resposta',
      color: '',
      style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
      icon: UserCog
    },
    'refused-by-manager': {
      label: 'Recusada',
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    },
    approved: { 
      label: 'Aprovado', 
      color: '', 
      style: { backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' },
      icon: CheckCircle 
    },
    'awaiting-client-confirmation': {
      label: 'Aguardando Confirmação do Cliente',
      color: '',
      style: { backgroundColor: 'rgba(255, 255, 32, 0.1)', color: '#DAA520' },
      icon: Clock
    },
    'in-progress': { 
      label: 'Em Andamento', 
      color: '', 
      style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
      icon: Users 
    },
    completed: { 
      label: 'Concluído', 
      color: 'bg-green-100 text-green-800', 
      icon: CheckCircle 
    },
    rejected: { 
      label: 'Rejeitado', 
      color: 'bg-red-100 text-red-800', 
      icon: XCircle 
    },
    scheduled: {
      label: 'Agendado',
      color: '',
      style: { backgroundColor: 'rgba(100, 0, 164, 0.1)', color: '#6400A4' },
      icon: CheckCircle
    }
  };
  
  return configs[status];
};

export const getAreaColor = (area: string): string => {
  const colors: Record<string, string> = {
    norte: '#8B20EE',
    sul: '#35BAE6',
    leste: '#FFFF20',
    oeste: '#6400A4',
    centro: '#000000'
  };
  return colors[area.toLowerCase()] || '#6400A4';
};