const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// Importa os dados mock (temporário - depois será substituído por banco de dados real)
const {
  currentService,
  serviceHistory,
  timeline,
  serviceNotesData,
  pastRatingsData,
  serviceRequestsData
} = require('../database/mockData');

// =====================================================
// PORTAL DO CLIENTE - VISUALIZAÇÃO DE DADOS PRÓPRIOS
// =====================================================
// Prefixo: /api/clientes
// Acesso: Cliente autenticado vê apenas seus próprios dados
// =====================================================

// ✅ IMPORTANTE: Protege TODAS as rotas - cliente precisa estar logado
router.use(protect, checkRole(['client']));

// =====================
// DASHBOARD DO CLIENTE
// =====================

// Serviço atual ativo
router.get('/current-service', (req, res) => {
  // TODO: Filtrar por req.user.id quando conectar ao banco
  res.json(currentService);
});

// Histórico de serviços
router.get('/history', (req, res) => {
  // TODO: Filtrar serviços do cliente logado (req.user.id)
  res.json(serviceHistory);
});

// Timeline de atividades
router.get('/timeline', (req, res) => {
  // TODO: Filtrar timeline do cliente logado
  res.json(timeline);
});

// Notas de serviço
router.get('/service-notes', (req, res) => {
  // TODO: Filtrar notas do cliente logado
  res.json(serviceNotesData);
});

// Alias para serviços (mantém compatibilidade)
router.get('/services', (req, res) => {
  res.json(serviceHistory);
});

// =====================
// AVALIAÇÕES
// =====================

// Listar avaliações passadas
router.get('/ratings', (req, res) => {
  // TODO: Filtrar avaliações do cliente logado
  res.json(pastRatingsData);
});

// Criar nova avaliação
router.post('/ratings', (req, res) => {
  const newRating = req.body;
  
  // Validação básica
  if (!newRating.rating || !newRating.serviceId) {
    return res.status(400).json({ 
      message: 'Rating e serviceId são obrigatórios' 
    });
  }

  // TODO: Adicionar clientId do req.user.id
  // newRating.clientId = req.user.id;
  
  newRating.date = new Date().toLocaleDateString('pt-BR');
  pastRatingsData.unshift(newRating);
  
  console.log('⭐ Nova avaliação recebida:', newRating);
  res.status(201).json({ 
    message: 'Avaliação enviada com sucesso!', 
    data: newRating 
  });
});

// =====================
// SOLICITAÇÕES DE SERVIÇO
// =====================

// Listar solicitações do cliente
router.get('/requests', (req, res) => {
  // TODO: Filtrar solicitações do cliente logado
  console.log('📋 Enviando lista de solicitações');
  res.json(serviceRequestsData);
});

// Criar nova solicitação
router.post('/requests', (req, res) => {
  const newRequest = req.body;
  
  // Validação básica
  if (!newRequest.serviceType) {
    return res.status(400).json({ 
      message: 'Tipo de serviço é obrigatório' 
    });
  }

  // TODO: Adicionar clientId do req.user.id
  // newRequest.clientId = req.user.id;
  
  newRequest.id = `REQ-2025-${Math.floor(Math.random() * 900) + 100}`;
  newRequest.status = 'em-analise';
  newRequest.requestedAt = new Date().toLocaleString('pt-BR');
  
  serviceRequestsData.unshift(newRequest);
  console.log('📝 Nova solicitação criada:', newRequest);
  
  res.status(201).json({
    message: 'Solicitação enviada com sucesso!',
    data: newRequest
  });
});

// =====================
// DOCUMENTOS
// =====================

// Mock de documentos em memória (temporário)
let clientDocuments = [
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

// Listar documentos do cliente
router.get('/documents', (req, res) => {
  // TODO: Filtrar documentos do cliente logado
  console.log('📄 Enviando documentos do cliente');
  res.json(clientDocuments);
});

// Upload de novo documento
router.post('/documents', (req, res) => {
  const newDoc = req.body;
  
  // Validação básica
  if (!newDoc.name || !newDoc.type) {
    return res.status(400).json({ 
      message: 'Nome e tipo do documento são obrigatórios' 
    });
  }

  // TODO: Adicionar clientId do req.user.id
  // newDoc.clientId = req.user.id;
  
  newDoc.id = `DOC-${Math.floor(Math.random() * 900) + 100}`;
  newDoc.uploadDate = new Date().toLocaleDateString('pt-BR');
  newDoc.fileSize = newDoc.fileSize || '--- KB';
  
  clientDocuments.unshift(newDoc);
  console.log('📎 Novo documento adicionado:', newDoc);
  
  res.status(201).json({
    message: 'Documento enviado com sucesso!',
    data: newDoc
  });
});

// Remover documento
router.delete('/documents/:id', (req, res) => {
  const { id } = req.params;
  
  // TODO: Verificar se o documento pertence ao cliente logado
  const index = clientDocuments.findIndex(doc => doc.id === id);

  if (index === -1) {
    return res.status(404).json({ 
      message: 'Documento não encontrado' 
    });
  }

  const deletedDoc = clientDocuments.splice(index, 1);
  console.log('🗑️ Documento removido:', deletedDoc[0].name);
  
  res.json({ 
    message: 'Documento removido com sucesso!' 
  });
});

// =====================
// NOTAS FISCAIS (PDF)
// =====================

// Mock de notas fiscais
const invoices = [
  { 
    id: '1', 
    number: 'NF-2024-089', 
    serviceType: 'Limpeza Hospitalar', 
    amount: 8500, 
    issueDate: '15/10/2024', 
    dueDate: '30/10/2024', 
    status: 'paid',
    paymentDate: '28/10/2024'
  },
  { 
    id: '2', 
    number: 'NF-2024-076', 
    serviceType: 'Limpeza Geral', 
    amount: 5200, 
    issueDate: '20/09/2024', 
    dueDate: '05/10/2024', 
    status: 'paid',
    paymentDate: '04/10/2024'
  },
  { 
    id: '3', 
    number: 'NF-2024-063', 
    serviceType: 'Limpeza de Vidros', 
    serviceId: 'OS-2024-052', 
    amount: 3800, 
    issueDate: '15/09/2024', 
    dueDate: '30/09/2024', 
    status: 'paid', 
    paymentDate: '29/09/2024' 
  },
  { 
    id: '4', 
    number: 'NF-2024-091', 
    serviceType: 'Jardinagem', 
    serviceId: 'OS-2024-082', 
    amount: 4500, 
    issueDate: '01/10/2024', 
    dueDate: '16/10/2024', 
    status: 'pending' 
  },
  { 
    id: '5', 
    number: 'NF-2024-050', 
    serviceType: 'Limpeza Pós-Obra', 
    serviceId: 'OS-2024-038', 
    amount: 12000, 
    issueDate: '05/09/2024', 
    dueDate: '20/09/2024', 
    status: 'paid', 
    paymentDate: '18/09/2024' 
  },
  { 
    id: '6', 
    number: 'NF-2024-042', 
    serviceType: 'Manutenção Elétrica', 
    serviceId: 'OS-2024-030', 
    amount: 6700, 
    issueDate: '28/08/2024', 
    dueDate: '12/09/2024', 
    status: 'paid', 
    paymentDate: '10/09/2024' 
  },
  { 
    id: '7', 
    number: 'NF-2024-035', 
    serviceType: 'Limpeza Geral', 
    serviceId: 'OS-2024-022', 
    amount: 5400, 
    issueDate: '15/08/2024', 
    dueDate: '30/08/2024', 
    status: 'paid', 
    paymentDate: '29/08/2024' 
  }
];

// Gerar PDF da nota fiscal
router.get('/invoice/:id/pdf', (req, res) => {
  const { id } = req.params;
  
  // TODO: Verificar se a nota fiscal pertence ao cliente logado
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) {
    return res.status(404).json({ 
      message: 'Nota fiscal não encontrada' 
    });
  }

  // Cria o PDF
  const doc = new PDFDocument({ margin: 50 });
  
  // Headers para download do PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition', 
    `inline; filename="${invoice.number}.pdf"`
  );

  // Pipe do PDF para a resposta
  doc.pipe(res);

  // ===== CABEÇALHO =====
  doc
    .fontSize(24)
    .fillColor('#6400A4')
    .text('Nota Fiscal de Serviço', { align: 'center' });
  
  doc.moveDown(0.5);
  
  doc
    .fontSize(10)
    .fillColor('#666666')
    .text('Hive Facilities Management', { align: 'center' })
    .text('CNPJ: 12.345.678/0001-90', { align: 'center' })
    .text('contato@hive.com.br', { align: 'center' });

  doc.moveDown(2);

  // ===== LINHA SEPARADORA =====
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('#6400A4')
    .stroke();

  doc.moveDown();

  // ===== DADOS DA NOTA FISCAL =====
  doc.fontSize(12).fillColor('#000000');

  const leftColumn = 50;
  const rightColumn = 300;
  let currentY = doc.y;

  // Coluna esquerda
  doc
    .text('Número:', leftColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .text(` ${invoice.number}`);
  
  doc.font('Helvetica');
  currentY += 20;

  doc
    .text('Serviço:', leftColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .text(` ${invoice.serviceType}`);
  
  doc.font('Helvetica');
  currentY += 20;

  doc
    .text('Valor:', leftColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .fillColor('#6400A4')
    .fontSize(14)
    .text(` R$ ${invoice.amount.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2 
    })}`);

  // Coluna direita
  currentY = doc.y - 60; // Volta para o início
  doc.fontSize(12).fillColor('#000000').font('Helvetica');

  doc.text('Data de Emissão:', rightColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .text(` ${invoice.issueDate}`);
  
  doc.font('Helvetica');
  currentY += 20;

  doc.text('Vencimento:', rightColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .text(` ${invoice.dueDate}`);
  
  doc.font('Helvetica');
  currentY += 20;

  const statusText = invoice.status === 'paid' ? 'PAGO' : 'PENDENTE';
  const statusColor = invoice.status === 'paid' ? '#22C55E' : '#EF4444';

  doc.text('Status:', rightColumn, currentY, { continued: true })
    .font('Helvetica-Bold')
    .fillColor(statusColor)
    .text(` ${statusText}`);

  if (invoice.paymentDate) {
    doc.font('Helvetica').fillColor('#000000');
    currentY += 20;
    doc.text('Data de Pagamento:', rightColumn, currentY, { continued: true })
      .font('Helvetica-Bold')
      .text(` ${invoice.paymentDate}`);
  }

  doc.moveDown(3);

  // ===== LINHA SEPARADORA =====
  doc
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .strokeColor('#CCCCCC')
    .stroke();

  doc.moveDown(2);

  // ===== OBSERVAÇÕES =====
  doc
    .fontSize(10)
    .fillColor('#666666')
    .font('Helvetica')
    .text('Observações:', { continued: false })
    .text(
      'Este documento é uma via simplificada da nota fiscal. ' +
      'Para mais informações, entre em contato com nosso suporte.',
      { align: 'justify' }
    );

  doc.moveDown(3);

  // ===== RODAPÉ =====
  doc
    .fontSize(8)
    .fillColor('#999999')
    .text(
      `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      { align: 'center' }
    )
    .moveDown(0.5)
    .text('Hive Facilities Management © 2024', { align: 'center' });

  // Finaliza o PDF
  doc.end();
  
  console.log(`📄 PDF gerado: ${invoice.number}`);
});

// SERVIÇOS AGENDADOS DO CLIENTE (REAL DO BANCO)
// =====================================================
const db = require('../database/connection');

router.get('/scheduled-services', async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    const [services] = await db.query(`
      SELECT 
        ss.scheduled_service_id AS id,
        ss.scheduled_date,
        ss.start_time,
        ss.end_time,
        ss.status,
        ss.notes,
        sc.name AS service_name,
        c.address
      FROM scheduled_services ss
      LEFT JOIN service_catalog sc 
        ON ss.service_catalog_id = sc.service_catalog_id
      LEFT JOIN clients c 
        ON ss.client_id = c.client_id
      WHERE ss.client_id = ?
      ORDER BY ss.scheduled_date ASC;
    `, [clientId]);

    res.json(services);

  } catch (error) {
    console.error("Erro ao buscar serviços agendados:", error);
    res.status(500).json({
      message: 'Erro interno ao carregar serviços agendados.'
    });
  }
});

module.exports = router;
