const express = require('express');
const router = express.Router();
const PDFDocument = require("pdfkit");

// Importa os dados do nosso "banco de dados" mock
// Assumindo que mockData.js está em database/mockData.js
const {
  currentService,
  serviceHistory,
  timeline,
  serviceNotesData,
  pastRatingsData,
  serviceRequestsData
} = require('../database/mockData');

// =====================
// ROTAS GET (Clientes)
// =====================
// As rotas aqui são relativas a /api/clientes


router.get("/current-service", (req, res) => res.json(currentService));
router.get("/history", (req, res) => res.json(serviceHistory));
router.get("/timeline", (req, res) => res.json(timeline));
router.get("/service-notes", (req, res) => res.json(serviceNotesData));
router.get("/servicos", (req, res) => res.json(serviceHistory));
router.get("/ratings", (req, res) => res.json(pastRatingsData));
router.get("/requests", (req, res) => {
  console.log("Enviando lista de solicitações para o frontend");
  res.json(serviceRequestsData);
});


// ROTAS POST (Clientes)

// Base mock em memória (permite POST/DELETE dinâmico)
let documentosCliente = [
  {
    id: 'OS-2024-001',
    name: 'Ordem de Serviço - Outubro (1ª Quinzena)',
    type: 'ordem-servico',
    uploadDate: '16/10/2024',
    fileSize: '245 KB',
    value: 10250.00,
    paymentStatus: 'paid',
    period: '01/10/2024 a 15/10/2024'
  },
  {
    id: 'DOC-001',
    name: 'Contrato de Prestação de Serviços',
    type: 'contrato',
    uploadDate: '01/10/2024',
    fileSize: '2.5 MB'
  },
  {
    id: 'DOC-002',
    name: 'NF-2024-089',
    type: 'nota-fiscal',
    uploadDate: '15/10/2024',
    fileSize: '156 KB',
    serviceId: 'REQ-2024-005'
  },
  {
    id: 'DOC-004',
    name: 'Certificado de Conformidade',
    type: 'outros',
    uploadDate: '12/10/2024',
    fileSize: '890 KB'
  }
];
// ✅ GET /api/clientes/documentos
router.get("/documentos", (req, res) => {
  console.log("📄 Enviando lista de documentos do cliente");
  res.json(documentosCliente);
});

// ✅ POST /api/clientes/documentos
router.post("/documentos", (req, res) => {
  const newDoc = req.body;
  newDoc.id = `DOC-${Math.floor(Math.random() * 900) + 100}`;
  newDoc.uploadDate = new Date().toLocaleDateString('pt-BR');
  newDoc.fileSize = newDoc.fileSize || '--- KB';
  documentosCliente.unshift(newDoc);

  console.log("📎 Novo documento recebido do frontend:", newDoc);
  res.status(201).json({
    message: "Documento adicionado com sucesso!",
    data: newDoc
  });
});

// ✅ DELETE /api/clientes/documentos/:id
router.delete("/documentos/:id", (req, res) => {
  const { id } = req.params;
  const index = documentosCliente.findIndex(doc => doc.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Documento não encontrado" });
  }

  const deletedDoc = documentosCliente.splice(index, 1);
  console.log("🗑️ Documento removido:", deletedDoc[0]);
  res.json({ message: "Documento removido com sucesso!" });
});


// POST /api/clientes/ratings
router.post("/ratings", (req, res) => {
  const newRating = req.body;
  pastRatingsData.unshift(newRating);
  console.log(" Nova avaliação recebida do frontend:", newRating);
  res.status(201).json({ message: "Avaliação recebida com sucesso!", data: newRating });
});

// POST /api/clientes/history
router.post("/history", (req, res) => {
  const newService = req.body;
  newService.id = `OS-2025-${Math.floor(Math.random() * 900) + 100}`; 
  newService.service = `${newService.service} (Criado via POST)`; 
  console.log(" Novo serviço recebido do frontend:", newService);
  serviceHistory.unshift(newService); 
  res.status(201).json(newService);
});

// POST /api/clientes/requests
router.post("/requests", (req, res) => {
  const newRequest = req.body;
  newRequest.id = `REQ-2025-${Math.floor(Math.random() * 900) + 100}`;
  newRequest.status = 'em-analise'; // O backend define o status inicial
  newRequest.requestedAt = new Date().toLocaleString('pt-BR');
  console.log(" Nova solicitação recebida do frontend:", newRequest);
  serviceRequestsData.unshift(newRequest); // Adiciona no início da lista
  res.status(201).json(newRequest);
});



// =====================================
// 🔹 GERA PDF DE NOTA FISCAL
// =====================================
router.get("/invoice/:id/pdf", (req, res) => {
  const { id } = req.params;

  // Busca o documento correspondente (mock)
  const invoice = [
    { id: "1", number: "NF-2024-089", serviceType: "Limpeza Hospitalar", amount: 8500, issueDate: "15/10/2024", dueDate: "30/10/2024", status: "paid" },
    { id: "2", number: "NF-2024-076", serviceType: "Limpeza Geral", amount: 5200, issueDate: "20/09/2024", dueDate: "05/10/2024", status: "paid" },
    { id: '3', number: 'NF-2024-063', serviceType: 'Limpeza de Vidros', serviceId: 'OS-2024-052', amount: 3800, issueDate: '15/09/2024', dueDate: '30/09/2024', status: 'paid', paymentDate: '29/09/2024' },
    { id: '4', number: 'NF-2024-091', serviceType: 'Jardinagem', serviceId: 'OS-2024-082', amount: 4500, issueDate: '01/10/2024', dueDate: '16/10/2024', status: 'pending' },
    { id: '5', number: 'NF-2024-050', serviceType: 'Limpeza Pós-Obra', serviceId: 'OS-2024-038', amount: 12000, issueDate: '05/09/2024', dueDate: '20/09/2024', status: 'paid', paymentDate: '18/09/2024' },
    { id: '6', number: 'NF-2024-042', serviceType: 'Manutenção Elétrica', serviceId: 'OS-2024-030', amount: 6700, issueDate: '28/08/2024', dueDate: '12/09/2024', status: 'paid', paymentDate: '10/09/2024' },
    { id: '7', number: 'NF-2024-035', serviceType: 'Limpeza Geral', serviceId: 'OS-2024-022', amount: 5400, issueDate: '15/08/2024', dueDate: '30/08/2024', status: 'paid', paymentDate: '29/08/2024' },
  ].find((inv) => inv.id === id);

  if (!invoice) {
    return res.status(404).json({ message: "Nota fiscal não encontrada" });
  }

  // Cria o PDF
  const doc = new PDFDocument();
  res.setHeader("Content-Disposition", `inline; filename=${invoice.number}.pdf`);
  res.setHeader("Content-Type", "application/pdf");

  // Cabeçalho
  doc.fontSize(20).fillColor("#6400A4").text("Nota Fiscal de Serviço", { align: "center" });
  doc.moveDown();

  // Dados principais
  doc.fontSize(12).fillColor("black");
  doc.text(`Número: ${invoice.number}`);
  doc.text(`Serviço: ${invoice.serviceType}`);
  doc.text(`Valor: R$ ${invoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
  doc.text(`Emissão: ${invoice.issueDate}`);
  doc.text(`Vencimento: ${invoice.dueDate}`);
  doc.text(`Status: ${invoice.status === "paid" ? "Pago" : "Pendente"}`);
  doc.moveDown();

  // Rodapé
  doc.fontSize(10).fillColor("gray").text("Emitido por Hive Facilities Management", { align: "center" });

  doc.pipe(res);
  doc.end();
});

// Exporta o router para o server.js usar
module.exports = router;
