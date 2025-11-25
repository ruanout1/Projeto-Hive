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
router.post('/requests', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const userId = req.user.id;

    // Campos enviados pelo frontend 
    const { 
      service,
      description,
      priority,
      date,
      location,
      area,
      addressId,          // <-- OBRIGATÓRIO AGORA
      serviceCatalogId    // <-- opcional, depende do front
    } = req.body;

    console.log("Nova solicitação recebida:", {
      clientId, userId, service, description, priority, date, location, area, addressId
    });

    // Validações obrigatórias
    if (!service) return res.status(400).json({ message: 'Tipo de serviço é obrigatório' });
    if (!description) return res.status(400).json({ message: 'Descrição é obrigatória' });
    if (!clientId) return res.status(400).json({ message: 'Cliente inválido' });
    if (!userId) return res.status(400).json({ message: 'Usuário inválido' });
    if (!addressId) return res.status(400).json({ message: 'Endereço é obrigatório' });

    // Mapeamento de prioridade
    const priorityMap = {
      'urgente': 'urgent',
      'alta': 'high',
      'media': 'medium',
      'média': 'medium',
      'baixa': 'low',
      'rotina': 'low'
    };
    const mappedPriority = priorityMap[priority?.toLowerCase()] || 'medium';

    // Montar descrição
    let fullDescription = description;
    if (location) fullDescription += `\n\nLocal: ${location}`;
    if (area) fullDescription += `\nÁrea: ${area}`;

    // Converter data
    let desiredDate = null;
    if (date) {
      const [day, month, year] = date.split('/');
      desiredDate = `${year}-${month}-${day}`;
    }

    // Gerar número único
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3,'0');
    const requestNumber = `REQ-${new Date().getFullYear()}-${timestamp}-${randomSuffix}`;

    console.log("Número da solicitação:", requestNumber);

    // INSERT CORRIGIDO
    const [result] = await db.query(`
      INSERT INTO service_requests (
        client_id,
        requester_user_id,
        requester_type,
        request_number,
        address_id,
        service_catalog_id,
        title,
        description,
        priority,
        desired_date,
        status,
        created_at
      ) VALUES (
        :clientId,
        :userId,
        'client',
        :requestNumber,
        :addressId,
        :serviceCatalogId,
        :title,
        :description,
        :priority,
        :desiredDate,
        'pending',
        NOW()
      )
    `, {
      replacements: {
        clientId,
        userId,
        requestNumber,
        addressId,
        serviceCatalogId: serviceCatalogId || null,
        title: service,
        description: fullDescription,
        priority: mappedPriority,
        desiredDate
      },
      type: db.QueryTypes.INSERT
    });

    res.status(201).json({
      service_request_id: result,
      service: service,
      description: fullDescription,
      priority: priority,               // ← mantém 'urgente' como veio do front
      status: 'pendente',               // ← frontend usa 'pendente', não 'pending'
      date: desiredDate,                // ← data desejada YYYY-MM-DD
      requestedAt: new Date().toLocaleDateString('pt-BR'),
      location: location || null,
      area: area || null
    });

  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    res.status(500).json({
      message: "Erro ao criar solicitação",
      error: error.message
    });
  }
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

// =====================================================
// 💰 DASHBOARD DE GASTOS - NOVAS ROTAS ADICIONADAS
// =====================================================

// Mock de notas fiscais (temporário - depois vem do banco)
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

// 📊 ROTA 1: Listar todas as faturas do cliente
router.get('/invoices', (req, res) => {
  try {
    // TODO: Filtrar faturas do cliente logado (req.user.client_id)
    console.log('💰 Enviando lista de faturas');
    res.json(invoices);
  } catch (error) {
    console.error('❌ Erro ao buscar faturas:', error);
    res.status(500).json({ message: 'Erro ao buscar faturas' });
  }
});

// 📈 ROTA 2: Resumo financeiro (para cards do dashboard)
router.get('/expenses/summary', (req, res) => {
  try {
    // TODO: Calcular com dados reais do banco filtrados por req.user.client_id
    
    // Cálculos baseados nos dados mock
    const totalSpent = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Média mensal (últimos 3 meses)
    const avgMonthly = totalSpent / 3;
    
    const summary = {
      totalSpent,
      totalPaid,
      totalPending,
      avgMonthly,
      invoiceCount: invoices.length,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length
    };
    
    console.log('📊 Resumo financeiro calculado:', summary);
    res.json(summary);
  } catch (error) {
    console.error('❌ Erro ao calcular resumo:', error);
    res.status(500).json({ message: 'Erro ao calcular resumo financeiro' });
  }
});

// 📉 ROTA 3: Dados para gráficos (tendências)
router.get('/expenses/trends', (req, res) => {
  try {
    // TODO: Buscar dados reais agrupados por mês do cliente logado
    
    // Agrupa faturas por mês
    const monthlyData = {};
    
    invoices.forEach(inv => {
      // Extrai mês da data (formato: DD/MM/YYYY)
      const [day, month, year] = inv.issueDate.split('/');
      const monthKey = `${year}-${month}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total: 0,
          paid: 0,
          pending: 0,
          count: 0
        };
      }
      
      monthlyData[monthKey].total += inv.amount;
      monthlyData[monthKey].count += 1;
      
      if (inv.status === 'paid') {
        monthlyData[monthKey].paid += inv.amount;
      } else {
        monthlyData[monthKey].pending += inv.amount;
      }
    });
    
    // Converte para array e ordena por data
    const trends = Object.values(monthlyData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );
    
    console.log('📈 Tendências calculadas:', trends.length, 'meses');
    res.json(trends);
  } catch (error) {
    console.error('❌ Erro ao calcular tendências:', error);
    res.status(500).json({ message: 'Erro ao calcular tendências' });
  }
});

// 📄 ROTA 4: Download de PDF da fatura
router.get('/invoices/:id/pdf', (req, res) => {
  const { id } = req.params;
  
  try {
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
    
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    res.status(500).json({ message: 'Erro ao gerar PDF' });
  }
});

// =====================================================
// SERVIÇOS AGENDADOS DO CLIENTE (DADOS REAIS DO BANCO)
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


//  SISTEMA DE COMUNICAÇÃO (CHAT)

//  ROTA 1: Listar todas as conversas do cliente
router.get('/communications', async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Busca conversas com última mensagem e contagem de não lidas
    const [conversations] = await db.query(`
      SELECT 
        c.conversation_id AS id,
        c.subject,
        c.status,
        c.updated_at AS lastMessageTime,
        (
          SELECT content 
          FROM messages 
          WHERE conversation_id = c.conversation_id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) AS lastMessage,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE conversation_id = c.conversation_id 
            AND sender_type != 'client' 
            AND is_read = FALSE
        ) AS unreadCount,
        GROUP_CONCAT(DISTINCT sender_name ORDER BY sender_name SEPARATOR ', ') AS participants
      FROM conversations c
      LEFT JOIN messages m ON c.conversation_id = m.conversation_id
      WHERE c.client_id = ?
      GROUP BY c.conversation_id
      ORDER BY c.updated_at DESC
    `, [clientId]);

    console.log(`💬 ${conversations.length} conversas encontradas para o cliente ${clientId}`);
    res.json(conversations);

  } catch (error) {
    console.error('❌ Erro ao buscar conversas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar conversas',
      error: error.message 
    });
  }
});

// 📨 ROTA 2: Buscar mensagens de uma conversa específica
router.get('/communications/:conversationId/messages', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const { conversationId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Verifica se a conversa pertence ao cliente
    const [conversation] = await db.query(`
      SELECT conversation_id 
      FROM conversations 
      WHERE conversation_id = ? AND client_id = ?
    `, [conversationId, clientId]);

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Conversa não encontrada.' });
    }

    // Busca todas as mensagens da conversa
    const [messages] = await db.query(`
      SELECT 
        message_id AS id,
        sender_type AS sender,
        sender_name AS senderName,
        content,
        message_type AS type,
        file_url AS fileUrl,
        file_name AS fileName,
        is_read AS read,
        created_at AS timestamp
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `, [conversationId]);

    console.log(`📨 ${messages.length} mensagens encontradas na conversa ${conversationId}`);
    res.json(messages);

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar mensagens',
      error: error.message 
    });
  }
});

// ✉️ ROTA 3: Enviar nova mensagem
router.post('/communications/message', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const userId = req.user.id;
    const clientName = req.user.name || 'Cliente';
    const { conversationId, content, type = 'text', fileUrl = null, fileName = null } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Validação
    if (!conversationId || !content) {
      return res.status(400).json({ 
        message: 'conversationId e content são obrigatórios' 
      });
    }

    // Verifica se a conversa pertence ao cliente
    const [conversation] = await db.query(`
      SELECT conversation_id 
      FROM conversations 
      WHERE conversation_id = ? AND client_id = ?
    `, [conversationId, clientId]);

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Conversa não encontrada.' });
    }

    // Insere a mensagem
    const [result] = await db.query(`
      INSERT INTO messages (
        conversation_id, 
        sender_type, 
        sender_id, 
        sender_name, 
        content, 
        message_type,
        file_url,
        file_name,
        is_read
      ) VALUES (?, 'client', ?, ?, ?, ?, ?, ?, TRUE)
    `, [conversationId, userId, clientName, content, type, fileUrl, fileName]);

    // Atualiza o timestamp da conversa
    await db.query(`
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = ?
    `, [conversationId]);

    // Busca a mensagem recém-criada
    const [newMessage] = await db.query(`
      SELECT 
        message_id AS id,
        sender_type AS sender,
        sender_name AS senderName,
        content,
        message_type AS type,
        file_url AS fileUrl,
        file_name AS fileName,
        is_read AS read,
        created_at AS timestamp
      FROM messages
      WHERE message_id = ?
    `, [result.insertId]);

    console.log(`✉️ Mensagem enviada na conversa ${conversationId} pelo cliente ${clientId}`);
    res.status(201).json({
      message: 'Mensagem enviada com sucesso!',
      data: newMessage[0]
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar mensagem',
      error: error.message 
    });
  }
});

// ✅ ROTA 4: Marcar conversa como lida
router.patch('/communications/:conversationId/read', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const { conversationId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Verifica se a conversa pertence ao cliente
    const [conversation] = await db.query(`
      SELECT conversation_id 
      FROM conversations 
      WHERE conversation_id = ? AND client_id = ?
    `, [conversationId, clientId]);

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Conversa não encontrada.' });
    }

    // Marca todas as mensagens da equipe como lidas
    await db.query(`
      UPDATE messages 
      SET is_read = TRUE 
      WHERE conversation_id = ? 
        AND sender_type != 'client' 
        AND is_read = FALSE
    `, [conversationId]);

    console.log(`✅ Mensagens marcadas como lidas na conversa ${conversationId}`);
    res.json({ message: 'Mensagens marcadas como lidas' });

  } catch (error) {
    console.error('❌ Erro ao marcar como lida:', error);
    res.status(500).json({ 
      message: 'Erro ao marcar como lida',
      error: error.message 
    });
  }
});

// 🆕 ROTA 5: Criar nova conversa
router.post('/communications', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const userId = req.user.id;
    const clientName = req.user.name || 'Cliente';
    const { subject, initialMessage } = req.body;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Validação
    if (!subject || !initialMessage) {
      return res.status(400).json({ 
        message: 'subject e initialMessage são obrigatórios' 
      });
    }

    // Cria a conversa
    const [conversationResult] = await db.query(`
      INSERT INTO conversations (client_id, subject, status)
      VALUES (?, ?, 'active')
    `, [clientId, subject]);

    const conversationId = conversationResult.insertId;

    // Insere a primeira mensagem
    await db.query(`
      INSERT INTO messages (
        conversation_id, 
        sender_type, 
        sender_id, 
        sender_name, 
        content, 
        message_type,
        is_read
      ) VALUES (?, 'client', ?, ?, ?, 'text', TRUE)
    `, [conversationId, userId, clientName, initialMessage]);

    // Busca a conversa criada
    const [newConversation] = await db.query(`
      SELECT 
        conversation_id AS id,
        subject,
        status,
        created_at AS lastMessageTime,
        ? AS lastMessage,
        0 AS unreadCount
      FROM conversations
      WHERE conversation_id = ?
    `, [initialMessage, conversationId]);

    console.log(`🆕 Nova conversa criada: ${conversationId} - ${subject}`);
    res.status(201).json({
      message: 'Conversa criada com sucesso!',
      data: newConversation[0]
    });

  } catch (error) {
    console.error('❌ Erro ao criar conversa:', error);
    res.status(500).json({ 
      message: 'Erro ao criar conversa',
      error: error.message 
    });
  }
});

// ROTA ADICIONAL: SERVIÇOS PENDENTES DE AVALIAÇÃO

router.get('/ratings/pending', async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    const pendingServices = await db.query(`
      SELECT 
        ss.scheduled_service_id AS id,
        sc.name,
        DATE_FORMAT(ss.scheduled_date, '%d/%m/%Y') AS date,
        CONCAT('Equipe ', 
          CASE ss.status
            WHEN 'completed' THEN 'Alpha'
            ELSE 'Beta'
          END
        ) AS team,
        COALESCE(sc.description, 'Serviço realizado') AS description,
        CONCAT(
          TIMESTAMPDIFF(HOUR, ss.start_time, ss.end_time), 'h'
        ) AS duration,
        'pending' AS status
      FROM scheduled_services ss
      LEFT JOIN service_catalog sc 
        ON ss.service_catalog_id = sc.service_catalog_id
      LEFT JOIN ratings r 
        ON ss.scheduled_service_id = r.scheduled_service_id
      WHERE ss.client_id = :clientId
        AND ss.status = 'completed'
        AND r.rating_id IS NULL
      ORDER BY ss.scheduled_date DESC
      LIMIT 20
    `, {
      replacements: { clientId },
      type: db.QueryTypes.SELECT
    });

    console.log(`⭐ ${pendingServices.length} serviços pendentes encontrados`);
    res.json(pendingServices);

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar serviços pendentes',
      error: error.message 
    });
  }
});

// =====================================================
// ⚠️ ALTERNATIVA SIMPLIFICADA (se a query acima der erro)
// =====================================================
// Se você não tiver a tabela pastRatingsData ou der erro,
// use esta versão mais simples:

/*
router.get('/ratings/pending', async (req, res) => {
  try {
    const clientId = req.user.client_id;

    if (!clientId) {
      return res.status(400).json({ message: 'Cliente não encontrado no token.' });
    }

    // Versão simplificada: retorna todos os serviços concluídos
    // (O filtro de "já avaliados" será feito no frontend)
    const [pendingServices] = await db.query(`
      SELECT 
        ss.scheduled_service_id AS id,
        sc.name,
        DATE_FORMAT(ss.scheduled_date, '%d/%m/%Y') AS date,
        'Equipe Alpha' AS team,
        COALESCE(sc.description, 'Serviço realizado') AS description,
        CONCAT(
          TIMESTAMPDIFF(HOUR, ss.start_time, ss.end_time), 'h'
        ) AS duration,
        'pending' AS status
      FROM scheduled_services ss
      LEFT JOIN service_catalog sc 
        ON ss.service_catalog_id = sc.service_catalog_id
      WHERE ss.client_id = ?
        AND ss.status = 'completed'
      ORDER BY ss.scheduled_date DESC
      LIMIT 20
    `, [clientId]);

    console.log(`⭐ ${pendingServices.length} serviços concluídos encontrados`);
    
    res.json(pendingServices);

  } catch (error) {
    console.error('❌ Erro ao buscar serviços pendentes:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar serviços pendentes de avaliação',
      error: error.message 
    });
  }
});
*/


module.exports = router;