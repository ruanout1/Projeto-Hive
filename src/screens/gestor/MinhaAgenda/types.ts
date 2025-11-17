export interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  endTime?: string;
  title: string;
  type: 'service' | 'meeting';
  client?: string;
  clientPhone?: string;
  service?: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  organizer?: string;
}

export interface MyScheduleScreenProps {
  onBack?: () => void;
}

export interface ScheduleStatsProps {
  stats?: {
    total: number;
    upcoming_services: number;
    upcoming_meetings: number;
    completed_today: number;
  } | null;
  schedule: ScheduleItem[];
}

export interface ScheduleCalendarProps {
  schedule: ScheduleItem[];
  selectedDate: Date;
  viewMode: 'daily' | 'weekly';
  onViewModeChange: (mode: 'daily' | 'weekly') => void;
  onDateChange: (date: Date) => void;
  onItemClick: (item: ScheduleItem) => void;
}

export interface ViewModeProps {
  selectedDate: Date;
  schedule: ScheduleItem[];
  onItemClick: (item: ScheduleItem) => void;
}

export interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: ScheduleItem | null;
  onStatusUpdate?: (itemId: string, newStatus: string) => void;
}

// Adicione isso no final do arquivo types.ts, antes do último }
export interface UseScheduleApiReturn {
  schedule: ScheduleItem[];
  stats: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface TypeColors {
  bg: string;
  light: string;
  border: string;
}