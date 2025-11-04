const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

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
  location: "Av. Paulista, 1000 - 15º andar",
};

let serviceHistory = [
  { id: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", team: "Equipe Beta", status: "completed", rating: 5, duration: "6h" },
  { id: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", team: "Equipe Alpha", status: "completed", rating: 4, duration: "4h" },
  { id: "OS-2024-052", service: "Limpeza + Enceramento", date: "10/09/2024", team: "Equipe Gamma", status: "completed", rating: 5, duration: "8h" },
];

const timeline = [
  { id: "tl-1", serviceId: "REQ-2024-003", time: "07:00", date: "18/10/2024", title: "Serviço Iniciado", description: "Colaborador João Santos marcou o início no app.", icon: "play" },
  { id: "tl-2", serviceId: "REQ-2024-003", time: "07:15", date: "18/10/2024", title: "Manutenção do Jardim Frontal", description: "Iniciada a poda e limpeza dos canteiros frontais.", icon: "scissors" },
  { id: "tl-3", serviceId: "REQ-2024-003", time: "09:30", date: "18/10/2024", title: "Pausa para Água", description: "Pausa breve da equipe.", icon: "coffee" },
  { id: "tl-4", serviceId: "REQ-2024-003", time: "09:45", date: "18/10/2024", title: "Retorno da Pausa", description: "Equipe retomou as atividades na área dos fundos.", icon: "play" },
];

const serviceNotesData = [
  { id: "sn-1", serviceId: "REQ-2024-003", author: "Gestor (Admin)", date: "17/10/2024", note: "Cliente pediu atenção especial às roseiras próximas ao portão." },
  { id: "sn-2", serviceId: "REQ-2024-003", author: "João Santos (Colaborador)", date: "18/10/2024 - 08:30", note: "Identificamos um ninho de pássaros em uma das árvores que seriam podadas." },
  { id: "sn-3", serviceId: "REQ-2024-001", author: "Cliente (Prédio)", date: "19/10/2024 - 10:00", note: "Favor iniciar a limpeza profunda pelo 3º andar." },
];

// 🔹 CLIENTE - DASHBOARD DE GASTOS
const clientInvoices = [
  { id: "1", number: "NF-2024-089", serviceType: "Limpeza Hospitalar", serviceId: "OS-2024-078", amount: 8500, issueDate: "15/10/2024", dueDate: "30/10/2024", status: "paid", paymentDate: "28/10/2024" },
  { id: "2", number: "NF-2024-076", serviceType: "Limpeza Geral", serviceId: "OS-2024-065", amount: 5200, issueDate: "20/09/2024", dueDate: "05/10/2024", status: "paid", paymentDate: "03/10/2024" },
  { id: "3", number: "NF-2024-063", serviceType: "Limpeza de Vidros", serviceId: "OS-2024-052", amount: 3800, issueDate: "15/09/2024", dueDate: "30/09/2024", status: "paid", paymentDate: "29/09/2024" },
  { id: "4", number: "NF-2024-091", serviceType: "Jardinagem", serviceId: "OS-2024-082", amount: 4500, issueDate: "01/10/2024", dueDate: "16/10/2024", status: "pending" },
  { id: "5", number: "NF-2024-050", serviceType: "Limpeza Pós-Obra", serviceId: "OS-2024-038", amount: 12000, issueDate: "05/09/2024", dueDate: "20/09/2024", status: "paid", paymentDate: "18/09/2024" },
  { id: "6", number: "NF-2024-042", serviceType: "Manutenção Elétrica", serviceId: "OS-2024-030", amount: 6700, issueDate: "28/08/2024", dueDate: "12/09/2024", status: "paid", paymentDate: "10/09/2024" },
  { id: "7", number: "NF-2024-035", serviceType: "Limpeza Geral", serviceId: "OS-2024-022", amount: 5400, issueDate: "15/08/2024", dueDate: "30/08/2024", status: "paid", paymentDate: "29/08/2024" },
];

// =====================
// 🔹 ROTAS GET
// =====================
app.get("/api/clientes/current-service", (req, res) => res.json(currentService));
app.get("/api/clientes/history", (req, res) => res.json(serviceHistory));
app.get("/api/clientes/timeline", (req, res) => res.json(timeline));
app.get("/api/clientes/service-notes", (req, res) => res.json(serviceNotesData));
app.get("/api/servicos", (req, res) => res.json(serviceHistory));


// =====================
// 🔹 NOVAS ROTAS DE BACKEND FINANCEIRO (HÍBRIDO)
// =====================

// 1️⃣ Resumo Financeiro
app.get("/api/clientes/summary", (req, res) => {
  const totalPaid = clientInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = clientInvoices.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = clientInvoices.reduce((sum, i) => sum + i.amount, 0);
  const averageAmount = totalAmount / clientInvoices.length;

  res.json({
    totalPaid,
    totalPending,
    totalAmount,
    averageAmount,
    invoicesCount: clientInvoices.length
  });
});
// 3️⃣ Dados de tendências (para gráficos)
app.get("/api/clientes/trends", (req, res) => {
  const monthlyData = [
    { month: "Ago", value: 11800 },
    { month: "Set", value: 21000 },
    { month: "Out", value: 17000 },
  ];
  const trendData = [
    { month: "Jun", value: 9500 },
    { month: "Jul", value: 10200 },
    { month: "Ago", value: 11800 },
    { month: "Set", value: 21000 },
    { month: "Out", value: 17000 },
  ];
  res.json({ monthlyData, trendData });
});

// 2️⃣ Detalhe de uma nota específica
app.get("/api/clientes/invoices/:id", (req, res) => {
  const invoiceId = req.params.id;
  const invoice = clientInvoices.find(i => i.id === invoiceId);
  if (!invoice) return res.status(404).json({ message: "Nota fiscal não encontrada" });
  res.json(invoice);
});



// =====================
// 🔹 ROTA PDF (Nota Fiscal)
// =====================
app.get("/api/clientes/invoice/:id/pdf", (req, res) => {
  const invoiceId = req.params.id;
  const invoice = clientInvoices.find(i => i.id === invoiceId);
  if (!invoice) return res.status(404).json({ error: "Nota fiscal não encontrada" });

  const doc = new PDFDocument({ margin: 50 });
  const filePath = path.join(__dirname, `nota-${invoiceId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Cabeçalho
  doc.fontSize(20).fillColor("#6400A4").text("HIVE - Nota Fiscal de Serviço", { align: "center" });
  doc.fontSize(12).fillColor("gray").text("Emitido automaticamente pelo sistema Hive", { align: "center" });
  doc.moveDown();

  // Dados principais
  doc.fontSize(12).fillColor("#000");
  doc.text(`Número: ${invoice.number}`);
  doc.text(`Serviço: ${invoice.serviceType}`);
  doc.text(`Ordem de Serviço: ${invoice.serviceId}`);
  doc.text(`Valor: R$ ${invoice.amount.toLocaleString("pt-BR")}`);
  doc.text(`Emissão: ${invoice.issueDate}`);
  doc.text(`Vencimento: ${invoice.dueDate}`);
  if (invoice.paymentDate) doc.text(`Pagamento: ${invoice.paymentDate}`);
  doc.text(`Status: ${invoice.status}`);
  doc.moveDown();

  doc.fontSize(10).fillColor("gray").text("© 2025 Hive Systems • Todos os direitos reservados.", { align: "center" });

  doc.end();

  stream.on("finish", () => {
    res.download(filePath, `nota-${invoiceId}.pdf`, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });
  });
});

// =====================
// 🔹 ROTA DE AVALIAÇÕES
// =====================
let pastRatingsData = [
  { serviceId: "OS-2024-078", service: "Limpeza Geral", date: "20/09/2024", rating: 5, feedback: "Excelente trabalho!" },
  { serviceId: "OS-2024-065", service: "Limpeza de Vidros", date: "15/09/2024", rating: 4, feedback: "Bom trabalho, mas houve um pequeno atraso." },
];
app.get("/api/clientes/ratings", (req, res) => res.json(pastRatingsData));
app.post("/api/clientes/ratings", (req, res) => {
  const newRating = req.body;
  pastRatingsData.unshift(newRating);
  res.status(201).json(newRating);
});

// =====================
// 🔹 ROTA DE SOLICITAÇÕES
// =====================
let serviceRequestsData = [
  { id: "REQ-2024-045", service: "Limpeza Geral", date: "25/09/2024", priority: "rotina", status: "aprovado", requestedAt: "23/09/2024 14:30", description: "Limpeza completa do escritório.", location: "Matriz - Paulista", area: "centro" },
  { id: "REQ-2024-044", service: "Limpeza de Piscina", date: "24/09/2024", priority: "urgente", status: "em-analise", requestedAt: "23/09/2024 10:15", description: "Limpeza urgente da piscina devido ao acúmulo de algas.", location: "Filial - Zona Sul", area: "sul" },
  { id: "REQ-2024-043", service: "Jardinagem", date: "26/09/2024", priority: "rotina", status: "agendado", requestedAt: "22/09/2024 16:20", description: "Poda das árvores e manutenção dos canteiros.", location: "Matriz - Paulista", area: "centro" },
];

app.get("/api/clientes/requests", (req, res) => res.json(serviceRequestsData));
app.post("/api/clientes/requests", (req, res) => {
  const newRequest = req.body;
  newRequest.id = `REQ-2025-${Math.floor(Math.random() * 900) + 100}`;
  newRequest.status = "em-analise";
  newRequest.requestedAt = new Date().toLocaleString("pt-BR");
  serviceRequestsData.unshift(newRequest);
  res.status(201).json(newRequest);
});

// =====================
// 🔹 INICIAR SERVIDOR
// =====================
app.listen(5000, () => console.log(" Servidor backend rodando na porta 5000"));
