

const db = require('../config/database'); // Ajuste o caminho se necessário
const { promisify } = require('util');

// Converte callbacks do MySQL para Promises
const query = promisify(db.query).bind(db);

// ============================================
// 1. GET INVOICES - Lista de Faturas
// ============================================
exports.getInvoices = async (req, res) => {
  try {
    const clientId = req.user.id; // Vem do middleware JWT
    
    console.log('📄 Buscando faturas para cliente:', clientId);

    const invoicesQuery = `
      SELECT 
        i.id,
        i.invoice_number as number,
        s.title as serviceType,
        s.order_number as serviceId,
        i.amount,
        DATE_FORMAT(i.created_at, '%d/%m/%Y') as issueDate,
        DATE_FORMAT(i.due_date, '%d/%m/%Y') as dueDate,
        i.status,
        DATE_FORMAT(i.paid_at, '%d/%m/%Y') as paymentDate
      FROM invoices i
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.client_id = ?
      ORDER BY i.created_at DESC
      LIMIT 50
    `;

    const invoices = await query(invoicesQuery, [clientId]);

    console.log(`✅ ${invoices.length} faturas encontradas`);

    res.json(invoices);

  } catch (error) {
    console.error('❌ Erro ao buscar faturas:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar faturas',
      error: error.message 
    });
  }
};

// ============================================
// 2. GET EXPENSES SUMMARY - Resumo Financeiro
// ============================================
exports.getExpensesSummary = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    console.log('💰 Buscando resumo financeiro para cliente:', clientId);

    const summaryQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as totalPaid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as totalPending,
        COALESCE(SUM(amount), 0) as totalAmount,
        COALESCE(AVG(amount), 0) as averageAmount
      FROM invoices
      WHERE client_id = ? AND status != 'cancelled'
    `;

    const [summary] = await query(summaryQuery, [clientId]);

    console.log('✅ Resumo financeiro calculado');

    res.json(summary);

  } catch (error) {
    console.error('❌ Erro ao buscar resumo:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar resumo',
      error: error.message 
    });
  }
};

// ============================================
// 3. GET EXPENSES TRENDS - Dados para Gráficos
// ============================================
exports.getExpensesTrends = async (req, res) => {
  try {
    const clientId = req.user.id;
    
    console.log('📊 Buscando tendências para cliente:', clientId);

    // Gráfico de barras (últimos 3 meses)
    const monthlyQuery = `
      SELECT 
        CASE MONTH(created_at)
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Fev'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Abr'
          WHEN 5 THEN 'Mai'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Ago'
          WHEN 9 THEN 'Set'
          WHEN 10 THEN 'Out'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dez'
        END as month,
        COALESCE(SUM(amount), 0) as value
      FROM invoices
      WHERE 
        client_id = ? 
        AND status != 'cancelled'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `;

    // Gráfico de linha (últimos 6 meses)
    const trendQuery = `
      SELECT 
        CASE MONTH(created_at)
          WHEN 1 THEN 'Jan'
          WHEN 2 THEN 'Fev'
          WHEN 3 THEN 'Mar'
          WHEN 4 THEN 'Abr'
          WHEN 5 THEN 'Mai'
          WHEN 6 THEN 'Jun'
          WHEN 7 THEN 'Jul'
          WHEN 8 THEN 'Ago'
          WHEN 9 THEN 'Set'
          WHEN 10 THEN 'Out'
          WHEN 11 THEN 'Nov'
          WHEN 12 THEN 'Dez'
        END as month,
        COALESCE(SUM(amount), 0) as value
      FROM invoices
      WHERE 
        client_id = ? 
        AND status != 'cancelled'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at), MONTH(created_at)
    `;

    const [monthlyData, trendData] = await Promise.all([
      query(monthlyQuery, [clientId]),
      query(trendQuery, [clientId])
    ]);

    console.log('✅ Tendências calculadas');

    res.json({
      monthlyData,
      trendData
    });

  } catch (error) {
    console.error('❌ Erro ao buscar tendências:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar tendências',
      error: error.message 
    });
  }
};

// ============================================
// 4. GET INVOICE PDF - Download de PDF
// ============================================
exports.getInvoicePDF = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { invoiceId } = req.params;
    
    console.log('📄 Gerando PDF da fatura:', invoiceId);

    // Verificar se a fatura pertence ao cliente
    const checkQuery = `
      SELECT 
        i.id,
        i.invoice_number,
        i.amount,
        s.title as service_title,
        s.order_number,
        DATE_FORMAT(i.created_at, '%d/%m/%Y') as issue_date,
        DATE_FORMAT(i.due_date, '%d/%m/%Y') as due_date,
        i.status
      FROM invoices i
      LEFT JOIN services s ON i.service_id = s.id
      WHERE i.id = ? AND i.client_id = ?
    `;

    const [invoice] = await query(checkQuery, [invoiceId, clientId]);

    if (!invoice) {
      return res.status(404).json({ message: 'Fatura não encontrada' });
    }

    // Gerar PDF simples
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fatura-${invoice.invoice_number}.pdf"`);

    doc.pipe(res);

    // =============================
    // Layout do PDF
    // =============================
    
    // Cabeçalho
    doc.fontSize(24)
       .fillColor('#6400A4')
       .text('HIVE', { align: 'center' });
    
    doc.fontSize(16)
       .fillColor('#000000')
       .text('NOTA FISCAL DE SERVIÇO', { align: 'center' });
    
    doc.moveDown(2);

    // Informações da Fatura
    doc.fontSize(12)
       .fillColor('#000000');

    doc.text(`Número da Nota Fiscal: ${invoice.invoice_number}`, { bold: true });
    doc.moveDown(0.5);
    
    doc.text(`Serviço: ${invoice.service_title || 'N/A'}`);
    doc.text(`Ordem de Serviço: ${invoice.order_number || 'N/A'}`);
    doc.moveDown(0.5);
    
    doc.fontSize(14)
       .fillColor('#6400A4')
       .text(`Valor: R$ ${Number(invoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, { bold: true });
    
    doc.moveDown(0.5);
    doc.fontSize(12)
       .fillColor('#000000');
    
    doc.text(`Data de Emissão: ${invoice.issue_date}`);
    doc.text(`Data de Vencimento: ${invoice.due_date}`);
    doc.moveDown(0.5);
    
    // Status
    const statusText = invoice.status === 'paid' ? 'PAGO' : 
                      invoice.status === 'pending' ? 'PENDENTE' : 'VENCIDO';
    const statusColor = invoice.status === 'paid' ? '#10B981' : 
                       invoice.status === 'pending' ? '#F59E0B' : '#EF4444';
    
    doc.fillColor(statusColor)
       .text(`Status: ${statusText}`, { bold: true });

    // Rodapé
    doc.moveDown(3);
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Este documento foi gerado eletronicamente pelo sistema HIVE', { align: 'center' });
    
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

    doc.end();

    console.log('✅ PDF gerado com sucesso');

  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar PDF',
      error: error.message 
    });
  }
};

// ============================================
// EXPORTAR TODAS AS FUNÇÕES
// ============================================
module.exports = {
  getInvoices,
  getExpensesSummary,
  getExpensesTrends,
  getInvoicePDF
};