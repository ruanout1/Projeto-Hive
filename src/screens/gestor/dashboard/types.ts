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

// A nova interface Team, correspondendo à resposta da API
export interface Team {
  id: number;
  name: string;
  zone: string;
  members: number;
  position?: { // Adicionando a propriedade position como opcional
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
  };
}

// A interface antiga, renomeada para evitar conflitos.
export interface MockTeam {
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