// =====================
// 🔹 DADOS ESTÁTICOS MOCK (Simulando um banco de dados)
// =====================

const currentService = {
  id: "OS-2024-089",
  title: "Limpeza Geral - Escritório Corporate",
  status: "em-andamento",
  progress: 70,
  startDate: "23/09/2024",
  expectedEnd: "23/09/2024 - 17:00",
  team: "Equipe Alpha ",
  leader: "Carlos Silva",
  phone: "(11) 99999-8888",
  location: "Av. Paulista, 1000 - 15º andar"
};

let serviceHistory = [ // Mudei para 'let' para podermos adicionar itens
  { id: "OS-2024-078", service: "Limpeza Geral ", date: "20/09/2024", team: "Equipe Beta", status: "completed", rating: 5, duration: "6h" },
  { id: "OS-2024-065", service: "Limpeza de Vidros ", date: "15/09/2024", team: "Equipe Alpha", status: "completed", rating: 4, duration: "4h" },
  { id: "OS-2024-052", service: "Limpeza + Enceramento ", date: "10/09/2024", team: "Equipe Gamma", status: "completed", rating: 5, duration: "8h" },
];

const timeline = [
  {
     id: 'tl-1',
     serviceId: 'REQ-2024-003', // ID do serviço
     time: '07:00',
     date: '18/10/2024',
     title: 'Serviço Iniciado',
     description: 'Colaborador João Santos marcou o início no app.',
     icon: 'play'
  },
  // ... (outros itens da timeline)
  {
     id: 'tl-4',
    serviceId: 'REQ-2024-003',
     time: '09:45',
     date: '18/10/2024',
     title: 'Retorno da Pausa',
     description: 'Equipe retomou as atividades na área dos fundos.',
     icon: 'play'
  }
];

let serviceNotesData = [ // Mudei para 'let'
  {
    id: 'sn-1',
    serviceId: 'REQ-2024-003', // ID do serviço
    author: 'Gestor (Admin)',
    // ... (outros itens)
  },
  {
    id: 'sn-3',
    serviceId: 'REQ-2024-001', // Nota para outro serviço
    author: 'Cliente (Prédio)',
    date: '19/10/2024 - 10:00',
    note: 'Favor iniciar a limpeza profunda pelo 3º andar.'
  }
];

// Exemplo de Timeline para um Serviço Concluído (REQ-2024-005)
const timelineCompleted = [
  {
    id: 'tl-c1',
    serviceId: 'REQ-2024-005', // ID do serviço concluído
    // ... (outros itens)
  },
  {
    id: 'tl-c3',
    serviceId: 'REQ-2024-005',
    time: '09:45',
    date: '15/10/2024',
    title: 'Serviço Concluído',
    description: 'Limpeza hospitalar finalizada. Fotos enviadas.',
    icon: 'check'
  }
];

// Exemplo de Nota para um Serviço Concluído (REQ-2024-005)
const serviceNotesCompleted = [
  {
     id: 'sn-c1',
     serviceId: 'REQ-2024-005', // ID do serviço concluído
     author: 'Maria Silva (Colaborador)',
     date: '15/10/2024 - 07:15',
     note: 'Utilizado produto desinfetante XYZ conforme protocolo na Ala A.'
  }
];

// Lógica que estava no server.js
timeline.push(...timelineCompleted);
serviceNotesData.push(...serviceNotesCompleted);

// --- Dados que estavam em outras partes do server.js ---

let pastRatingsData = [
  { serviceId: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", rating: 5, feedback: "Excelente trabalho!" },
  { serviceId: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", rating: 4, feedback: "Bom trabalho, mas houve um pequeno atraso." },
];

let serviceRequestsData = [
  {
    id: 'REQ-2024-045',
    // ... (outros itens)
    area: 'centro'
  },
  {
    id: 'REQ-2024-043',
    // ... (outros itens)
     area: 'centro'
  }
];


// =====================
// 🔹 EXPORTAÇÃO
// =====================
// Exporta todas as variáveis para que as rotas possam usá-las
module.exports = {
  currentService,
  serviceHistory,
  timeline,
  serviceNotesData,
  pastRatingsData,
  serviceRequestsData
};