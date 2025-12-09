import { LucideIcon } from 'lucide-react';

export type RequestStatus = 
  | 'pending' 
  | 'urgent' 
  | 'delegated' 
  | 'refused-by-manager' 
  | 'approved' 
  | 'awaiting-client-confirmation' 
  | 'in-progress' 
  | 'completed' 
  | 'rejected'
  | 'scheduled';

export interface PhotoDocumentation {
  id: string;
  beforePhotos: string[];
  afterPhotos: string[];
  uploadDate: string;
  uploadedBy: string;
  uploadedById: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  areas: string[];
}

export interface ServiceTeam {
  id: string;
  team_id: number;
  name: string;
  description?: string;
  members: TeamMember[];
  area: string;
  area_id?: number;
  isActive: boolean;
}

export interface ServiceRequest {
  // Campos do backend
  service_request_id: number;
  request_number: string;
  company_id: number;
  branch_id?: number;
  service_catalog_id: number;
  title: string;
  description: string;
  desired_date: string;
  desired_time?: string;
  priority_key: 'low' | 'medium' | 'high' | 'urgent';
  status_key: RequestStatus;
  assigned_manager_user_id?: number;
  assigned_team_id?: number;
  assigned_collaborator_user_id?: number;
  observations?: string;
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos do backend
  company?: {
    company_id: number;
    name: string;
    cnpj: string;
    area?: string;
  };
  branch?: {
    branch_id: number;
    name: string;
    address_reference: string;
    area?: {
      area_id: number;
      name: string;
    };
  };
  service_catalog?: {
    service_catalog_id: number;
    name: string;
    price: number;
    category_id?: number;
    category?: {
      category_id: number;
      name: string;
      icon: string;
      color: string;
    };
  };
  requester?: {
    user_id: number;
    full_name: string;
  };
  scheduled_services?: Array<{
    scheduled_service_id: number;
    scheduled_date: string;
    notes: string;
    status_key: string;
  }>;
  status_key_service_status?: {
    status_key: string;
    name: string;
  };
  priority_key_priority_level?: {
    priority_key: string;
    name: string;
  };

  // Campos mapeados para o frontend
  id: string; // Usa request_number
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  clientLocation?: string;
  serviceType: string;
  requestDate: string;
  requestTime?: string;
  preferredDate: string;
  status: RequestStatus;
  urgentReason?: string;
  assignedManager?: string;
  assignedManagerId?: number;
  assignedManagerArea?: string;
  assignedTeam?: string;
  assignedTeamId?: number;
  assignedTeamMembers?: string[];
  assignedCollaborator?: string;
  assignedCollaboratorId?: number;
  availableDates?: string[];
  managerRefusalReason?: string;
  scheduledDate?: string;
  scheduledDescription?: string;
  photoDocumentation?: PhotoDocumentation;
}

export interface Manager {
  id: string;
  user_id: number;
  name: string;
  email: string;
  areas: string[];
  area_ids?: number[];
  isActive: boolean;
}

export interface ServiceRequestsFilters {
  status: string;
  search: string;
  area?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface StatusConfig {
  label: string;
  color: string;
  style?: React.CSSProperties;
  icon: LucideIcon;
}