export const SERVICE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const;
  
  export const SERVICE_STATUS_LABELS = {
    [SERVICE_STATUS.PENDING]: 'Pendente',
    [SERVICE_STATUS.APPROVED]: 'Aprovado',
    [SERVICE_STATUS.IN_PROGRESS]: 'Em Andamento',
    [SERVICE_STATUS.COMPLETED]: 'Concluído',
    [SERVICE_STATUS.CANCELLED]: 'Cancelado',
  };
  
  export const SERVICE_STATUS_COLORS = {
    [SERVICE_STATUS.PENDING]: 'yellow',
    [SERVICE_STATUS.APPROVED]: 'blue',
    [SERVICE_STATUS.IN_PROGRESS]: 'purple',
    [SERVICE_STATUS.COMPLETED]: 'green',
    [SERVICE_STATUS.CANCELLED]: 'red',
  };
  
  export const DOCUMENT_CATEGORIES = [
    'Contratos',
    'Notas Fiscais',
    'Relatórios',
    'Comprovantes',
    'Outros',
  ] as const;
  
  export const API_ENDPOINTS = {
    CURRENT_SERVICE: '/api/clientes/current-service',
    HISTORY: '/api/clientes/history',
    TIMELINE: '/api/clientes/timeline',
    REQUESTS: '/api/clientes/requests',
    DOCUMENTS: '/api/clientes/documents',
    RATINGS: '/api/clientes/ratings',
  } as const;