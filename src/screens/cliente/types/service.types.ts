export type ServiceStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled';

export interface ServiceRequest {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  priority: 'low' | 'medium' | 'high';
  requestedDate: string;
  status?: ServiceStatus;
}

export interface ScheduledService {
  id: string;
  serviceId: string;
  clientId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: ServiceStatus;
  teamId?: string;
  notes?: string;
}