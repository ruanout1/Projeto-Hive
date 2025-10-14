const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 
app.use("/src", express.static(path.join(__dirname, "src")));

// Dados simulados (futuramente podem vir de um banco de dados)
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

// Rotas
app.get("/api/clientes/current-service", (req, res) => res.json(currentService));
app.get("/api/clientes/history", (req, res) => res.json(serviceHistory));
app.get("/api/clientes/timeline", (req, res) => res.json(timeline));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.listen(5000, () => console.log("Servidor backend rodando na porta 5000"));
