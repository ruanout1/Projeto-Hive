export interface DashboardStats {
  pendente: number;
  agendado: number;
  'em-andamento': number;
  concluido: number;
  cancelado: number;
}

export interface Service {
  id: string;
  cliente: string;
  servico: string;
  equipe: string;
  status: string;
  prazo: string;
}

export interface Team {
    name: string;
    zone: string;
    active: boolean;
    members: number;
    position: {
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
    };
}