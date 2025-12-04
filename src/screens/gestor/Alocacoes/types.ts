export interface Allocation {
  id: number;
  collaboratorId: number;
  collaboratorName: string;
  collaboratorPosition: string;
  clientId: number;
  clientName: string;
  clientArea: string;
  startDate: string;
  endDate: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Collaborator {
  id: number;
  name: string;
  position: string;
  team: string;
  available: boolean;
}

export interface Client {
  id: number;
  name: string;
  area: string;
  active: boolean;
}

export interface AllocationsScreenProps {
  onBack?: () => void;
}

export const workDaysOptions = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];
