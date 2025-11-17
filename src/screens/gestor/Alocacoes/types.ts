// Define todas as estruturas de dados usadas na funcionalidade de Alocações

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

export interface WorkDayOption {
  id: string;
  label: string;
}

export interface AllocationStats {
  total: number;
  active: number;
  upcoming: number;
  completed: number;
}