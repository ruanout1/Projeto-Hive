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
  // ... seus dados de timeline ...
];

const serviceNotesData = [
  // ... seus dados de notas ...
];

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
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// 🔹 INICIAR SERVIDOR (SEMPRE POR ÚLTIMO)
// =====================
app.listen(5000, () => {
  console.log("🚀 Servidor backend (simulação) rodando na porta 5000");
});

