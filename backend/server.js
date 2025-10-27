const express = require("express");
const cors = require("cors");
const path = require("path");
// const sequelize = require("./database/connection");
// const Servico = require("./models/Servico");

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
  title: "Limpeza Geral - Escritório Corporate",
  status: "em-andamento",
  progress: 70,
  startDate: "23/09/2024",
  expectedEnd: "23/09/2024 - 17:00",
  team: "Equipe Alpha",
  leader: "Carlos Silva",
  phone: "(11) 99999-8888",
  location: "Av. Paulista, 1000 - 15º andar"
};

const serviceHistory = [
  { id: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", team: "Equipe Beta", status: "completed", rating: 5, duration: "6h" },
  { id: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", team: "Equipe Alpha", status: "completed", rating: 4, duration: "4h" },
  { id: "OS-2024-052", service: "Limpeza Geral + Enceramento", date: "10/09/2024", team: "Equipe Gamma", status: "completed", rating: 5, duration: "8h" },
  { id: "OS-2024-038", service: "Limpeza Pós-Obra", date: "05/09/2024", team: "Equipe Delta", status: "completed", rating: 4, duration: "12h" }
];

const timeline = [
  { time: "08:00", event: "Equipe chegou ao local", status: "completed" },
  { time: "08:15", event: "Início dos trabalhos de limpeza", status: "completed" },
  { time: "10:30", event: "Limpeza das áreas comuns finalizada", status: "completed" },
  { time: "12:00", event: "Pausa para almoço da equipe", status: "completed" },
  { time: "13:00", event: "Limpeza das salas em andamento", status: "current" },
  { time: "15:30", event: "Limpeza dos banheiros", status: "pending" },
  { time: "16:30", event: "Finalização e vistoria", status: "pending" },
  { time: "17:00", event: "Conclusão do serviço", status: "pending" }
];

const serviceNotesData = [
  {
    id: 1,
    serviceId: "OS-2024-089",
    serviceName: "Limpeza Geral - Escritório Corporate",
    date: "23/09/2024",
    status: "em-andamento",
    team: "Equipe Alpha",
    notes: [
      { id: 1, type: "inicio", time: "08:00", author: "Carlos Silva", content: "Iniciando serviço. (Dados do Backend)" },
      { id: 2, type: "progresso", time: "10:30", author: "Ana Santos", content: "Finalizada limpeza das áreas comuns." },
    ],
  },
  {
    id: 2,
    serviceId: "OS-2024-078",
    serviceName: "Limpeza Geral",
    date: "20/09/2024",
    status: "completed",
    team: "Equipe Beta",
    notes: [
      { id: 1, type: "inicio", time: "09:00", author: "Roberto Lima", content: "Serviço iniciado." },
      { id: 2, type: "conclusao", time: "15:00", author: "Roberto Lima", content: "Serviço concluído com sucesso." }
    ],
    rating: 5,
    clientFeedback: "Excelente trabalho!",
  },
];

let pastRatingsData = [
  { serviceId: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", rating: 5, feedback: "Excelente trabalho! (Vindo do Backend)" },
  { serviceId: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", rating: 4, feedback: "Bom trabalho, mas houve um pequeno atraso." },
];

// =====================
// 🔹 ROTAS EXISTENTES
// =====================
app.get("/api/clientes/current-service", (req, res) => res.json(currentService));
app.get("/api/clientes/history", (req, res) => res.json(serviceHistory));
app.get("/api/clientes/timeline", (req, res) => res.json(timeline));
app.get("/api/clientes/service-notes", (req, res) => res.json(serviceNotesData));
app.get("/api/clientes/ratings", (req, res) => res.json(pastRatingsData));

app.post("/api/clientes/ratings", (req, res) => {
  const newRating = req.body;
  console.log("✅ Nova avaliação recebida do frontend:", newRating);
  pastRatingsData.unshift(newRating);
  res.status(201).json({ message: "Avaliação recebida com sucesso!", data: newRating });
});

// =====================
// 🔹 NOVAS ROTAS (MYSQL)
// =====================
// app.get("/api/servicos", async (req, res) => {
//   try {
//     const servicosDB = await Servico.findAll();
//     res.json([...serviceHistory, ...servicosDB]); // junta os estáticos + banco
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erro ao buscar serviços" });
//   }
// });

// app.post("/api/servicos", async (req, res) => {
//   try {
//     const novoServico = await Servico.create(req.body);
//     res.status(201).json(novoServico);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erro ao criar serviço" });
//   }
// });

// Página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// 🔹 INICIAR SERVIDOR
// =====================
// sequelize.sync().then(() => {
//   app.listen(5000, () => console.log("🚀 Servidor backend rodando na porta 5000"));
// });
app.listen(5000, () => console.log("🚀 Servidor backend rodando na porta 5000 (sem MySQL)"));
