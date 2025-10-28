const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use("/src", express.static(path.join(__dirname, "src")));

// =====================
// 🔹 DADOS ESTÁTICOS
// =====================
const currentService = {
  id: "OS-2024-089",
  title: "Limpeza Geral - Escritório Corporate (DADO DO BACKEND)",
  status: "em-andamento",
  progress: 70,
  startDate: "23/09/2024",
  expectedEnd: "23/09/2024 - 17:00",
  team: "Equipe Alpha (Backend)",
  leader: "Carlos Silva",
  phone: "(11) 99999-8888",
  location: "Av. Paulista, 1000 - 15º andar"
};

let serviceHistory = [ // Mudei para 'let' para podermos adicionar itens
  { id: "OS-2024-078", service: "Limpeza Geral (Backend)", date: "20/09/2024", team: "Equipe Beta", status: "completed", rating: 5, duration: "6h" },
  { id: "OS-2024-065", service: "Limpeza de Vidros (Backend)", date: "15/09/2024", team: "Equipe Alpha", status: "completed", rating: 4, duration: "4h" },
  { id: "OS-2024-052", service: "Limpeza + Enceramento (Backend)", date: "10/09/2024", team: "Equipe Gamma", status: "completed", rating: 5, duration: "8h" },
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
  {
    id: 'tl-2',
    serviceId: 'REQ-2024-003',
    time: '07:15',
    date: '18/10/2024',
    title: 'Manutenção do Jardim Frontal',
    description: 'Iniciada a poda e limpeza dos canteiros frontais.',
    icon: 'scissors'
  },
  {
    id: 'tl-3',
    serviceId: 'REQ-2024-003',
    time: '09:30',
    date: '18/10/2024',
    title: 'Pausa para Água',
    description: 'Pausa breve da equipe.',
    icon: 'coffee'
  },
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

const serviceNotesData = [
  {
    id: 'sn-1',
    serviceId: 'REQ-2024-003', // ID do serviço
    author: 'Gestor (Admin)',
    date: '17/10/2024',
    note: 'Cliente pediu atenção especial às roseiras próximas ao portão. Por favor, garantir que não sejam podadas em excesso.'
  },
  {
    id: 'sn-2',
    serviceId: 'REQ-2024-003',
    author: 'João Santos (Colaborador)',
    date: '18/10/2024 - 08:30',
    note: 'Identificamos um ninho de pássaros em uma das árvores que seriam podadas. Desviamos da área para não perturbar.'
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
    time: '06:00',
    date: '15/10/2024',
    title: 'Serviço Iniciado',
    description: 'Equipe Delta iniciou a limpeza hospitalar.',
    icon: 'play'
  },
  {
    id: 'tl-c2',
    serviceId: 'REQ-2024-005',
    time: '08:30',
    date: '15/10/2024',
    title: 'Higienização da Ala A Concluída',
    description: 'Desinfecção completa da Ala A finalizada.',
    icon: 'check' // Usando um ícone diferente como exemplo
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
 timeline.push(...timelineCompleted);
serviceNotesData.push(...serviceNotesCompleted);

// =====================
// 🔹 ROTAS GET
// =====================
app.get("/api/clientes/current-service", (req, res) => res.json(currentService));
app.get("/api/clientes/history", (req, res) => res.json(serviceHistory));
app.get("/api/clientes/timeline", (req, res) => res.json(timeline));
app.get("/api/clientes/service-notes", (req, res) => res.json(serviceNotesData));
app.get("/api/servicos", (req, res) => res.json(serviceHistory));

// Rota de avaliações
let pastRatingsData = [
  { serviceId: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", rating: 5, feedback: "Excelente trabalho!" },
  { serviceId: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", rating: 4, feedback: "Bom trabalho, mas houve um pequeno atraso." },
];
app.get("/api/clientes/ratings", (req, res) => res.json(pastRatingsData));

// =====================
// 🔹 ROTAS POST
// =====================
app.post("/api/clientes/ratings", (req, res) => {
  const newRating = req.body;
  pastRatingsData.unshift(newRating);
  console.log("✅ Nova avaliação recebida do frontend:", newRating);
  res.status(201).json({ message: "Avaliação recebida com sucesso!", data: newRating });
});

// MOVIDO PARA CIMA 
// Rota para "criar novo serviço"
app.post("/api/clientes/history", (req, res) => {
  const newService = req.body;
  
  // Simula a criação de um ID pelo backend
  newService.id = `OS-2025-${Math.floor(Math.random() * 900) + 100}`; 
  newService.service = `${newService.service} (Criado via POST)`; 

  console.log("✅ Novo serviço recebido do frontend:", newService);
  
  serviceHistory.unshift(newService); 
  
  // ✅ MUDANÇA AQUI: Retorna SÓ o serviço criado
  // O frontend (response.data) espera o objeto de serviço,
  // e não um { message: ..., data: ... }
  res.status(201).json(newService);
});

// =====================
// 🔹 ROTA INICIAL
// =====================
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// =====================
// 🔹 INICIAR SERVIDOR (SEMPRE POR ÚLTIMO)
// =====================
app.listen(5000, () => {
  console.log("🚀 Servidor backend (simulação) rodando na porta 5000");
});

// 🔹 DADOS - SOLICITAÇÕES DE SERVIÇO
// (Pegamos os dados iniciais do seu frontend)
// =====================
let serviceRequestsData = [
  {
    id: 'REQ-2024-045',
    service: 'Limpeza Geral',
    date: '25/09/2024',
    priority: 'rotina',
    status: 'aprovado',
    requestedAt: '23/09/2024 14:30',
    description: 'Limpeza completa do escritório, incluindo todas as salas e áreas comuns.',
    location: 'Matriz - Paulista',
    area: 'centro'
  },
  {
    id: 'REQ-2024-044',
    service: 'Limpeza de Piscina',
    date: '24/09/2024',
    priority: 'urgente',
    status: 'em-analise',
    requestedAt: '23/09/2024 10:15',
    description: 'Limpeza urgente da piscina devido ao acúmulo de algas.',
    location: 'Filial - Zona Sul',
    area: 'sul'
  },
  {
    id: 'REQ-2024-043',
    service: 'Jardinagem',
    date: '26/09/2024',
    priority: 'rotina',
    status: 'agendado',
    requestedAt: '22/09/2024 16:20',
    description: 'Poda das árvores e manutenção dos canteiros do jardim.',
    location: 'Matriz - Paulista',
    area: 'centro'
  }
];

// =====================
// 🔹 NOVAS ROTAS - SOLICITAÇÕES
// =====================

// Rota GET para carregar as solicitações existentes
app.get("/api/clientes/requests", (req, res) => {
  console.log("✅ Enviando lista de solicitações para o frontend");
  res.json(serviceRequestsData);
});

// Rota POST para criar uma nova solicitação
app.post("/api/clientes/requests", (req, res) => {
  const newRequest = req.body;
  
  // Simula o backend processando e adicionando dados
  newRequest.id = `REQ-2025-${Math.floor(Math.random() * 900) + 100}`;
  newRequest.status = 'em-analise'; // O backend define o status inicial
  newRequest.requestedAt = new Date().toLocaleString('pt-BR');
  
  console.log("✅ Nova solicitação recebida do frontend:", newRequest);
  
  serviceRequestsData.unshift(newRequest); // Adiciona no início da lista
  
  // Retorna o objeto completo, como criado pelo backend
  res.status(201).json(newRequest);
});

