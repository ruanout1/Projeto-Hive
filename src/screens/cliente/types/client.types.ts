export interface Client {
    id: string;
    name: string;
    email: string;
    cnpj: string;
    isActive: boolean;
  }
  
  export interface CurrentService {
    id: string;
    title: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    progress: number;
    startDate: string;
    expectedEnd: string;
    team: string;
    leader: string;
    phone: string;
    location: string;
  }
  
  export interface ServiceHistoryItem {
    id: string;
    service: string;
    date: string;
    team: string;
    status: string;
    rating: number;
    duration: string;
  }
 