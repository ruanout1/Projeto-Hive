const ServiceOrder = require('../models/ServiceOrder');
const ServiceOrderItem = require('../models/ServiceOrderItem');
const Company = require('../models/Company');
const User = require('../models/User');
const { handleDatabaseError } = require('../utils/errorHandling');
const { Op } = require('sequelize');
const sequelize = require('../database/connection');

// ============================================================================
// GET /api/service-orders/stats - Estatísticas
// ============================================================================
exports.getStats = async (req, res) => {
  try {
    const total = await ServiceOrder.count();
    
    const paid = await ServiceOrder.count({
      where: { payment_status: 'paid' }
    });
    
    const pending = await ServiceOrder.count({
      where: { payment_status: 'pending' }
    });

    // Total recebido (pagos)
    const paidOrders = await ServiceOrder.findAll({
      where: { payment_status: 'paid' },
      attributes: ['total_value']
    });
    const totalRevenue = paidOrders.reduce((sum, order) => 
      sum + parseFloat(order.total_value || 0), 0
    );

    // Total a receber (pendentes)
    const pendingOrders = await ServiceOrder.findAll({
      where: { payment_status: 'pending' },
      attributes: ['total_value']
    });
    const pendingRevenue = pendingOrders.reduce((sum, order) => 
      sum + parseFloat(order.total_value || 0), 0
    );

    return res.status(200).json({
      success: true,
      data: {
        total,
        paid,
        pending,
        totalRevenue,
        pendingRevenue
      }
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'buscar estatísticas');
  }
};

// ============================================================================
// GET /api/service-orders - Listar ordens (com filtros)
// ============================================================================
exports.getAll = async (req, res) => {
  try {
    const {
      search,
      status, // 'paid' ou 'pending'
      client_id
    } = req.query;

    const where = {};

    // Filtro por status de pagamento
    if (status && ['paid', 'pending'].includes(status)) {
      where.payment_status = status;
    }

    // Filtro por cliente
    if (client_id && !isNaN(parseInt(client_id))) {
      where.company_id = parseInt(client_id);
    }

    // Filtro de busca
    let searchCondition = null;
    if (search && search.trim()) {
      searchCondition = {
        [Op.or]: [
          { order_number: { [Op.like]: `%${search.trim()}%` } },
          { title: { [Op.like]: `%${search.trim()}%` } },
          { '$company.name$': { [Op.like]: `%${search.trim()}%` } }
        ]
      };
    }

    const orders = await ServiceOrder.findAll({
      where: searchCondition ? { ...where, ...searchCondition } : where,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name'],
          required: false
        },
        {
          model: ServiceOrderItem,
          as: 'items',
          attributes: ['service_order_item_id', 'description', 'quantity', 'unit_price', 'total'],
          required: false
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['user_id', 'full_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Formatar resposta para o frontend
    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      return {
        id: orderData.order_number,
        clientId: orderData.company?.company_id || null,
        clientName: orderData.company?.name || 'N/A',
        clientArea: 'centro',
        periodStart: orderData.period_start 
          ? new Date(orderData.period_start).toLocaleDateString('pt-BR')
          : null,
        periodEnd: orderData.period_end 
          ? new Date(orderData.period_end).toLocaleDateString('pt-BR')
          : null,
        services: orderData.items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.total)
        })) || [],
        totalValue: parseFloat(orderData.total_value || 0),
        paymentStatus: orderData.payment_status,
        createdDate: new Date(orderData.created_at).toLocaleDateString('pt-BR'),
        createdBy: orderData.createdBy?.full_name || 'Sistema',
        notes: orderData.description || '',
        _raw: {
          service_order_id: orderData.service_order_id,
          company_id: orderData.company_id
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedOrders
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'listar ordens de serviço');
  }
};

// ============================================================================
// GET /api/service-orders/:id - Buscar por ID
// ============================================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params; // order_number

    const order = await ServiceOrder.findOne({
      where: { order_number: id },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name']
        },
        {
          model: ServiceOrderItem,
          as: 'items',
          attributes: ['service_order_item_id', 'description', 'quantity', 'unit_price', 'total']
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['user_id', 'full_name']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    const orderData = order.toJSON();
    
    const formatted = {
      id: orderData.order_number,
      clientId: orderData.company?.company_id || null,
      clientName: orderData.company?.name || 'N/A',
      clientArea: 'centro',
      periodStart: orderData.period_start 
        ? new Date(orderData.period_start).toLocaleDateString('pt-BR')
        : null,
      periodEnd: orderData.period_end 
        ? new Date(orderData.period_end).toLocaleDateString('pt-BR')
        : null,
      services: orderData.items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        total: parseFloat(item.total)
      })) || [],
      totalValue: parseFloat(orderData.total_value || 0),
      paymentStatus: orderData.payment_status,
      createdDate: new Date(orderData.created_at).toLocaleDateString('pt-BR'),
      createdBy: orderData.createdBy?.full_name || 'Sistema',
      notes: orderData.description || ''
    };

    return res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'buscar ordem de serviço');
  }
};

// ============================================================================
// POST /api/service-orders - Criar ordem
// ============================================================================
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      clientId,
      periodStart,
      periodEnd,
      services,
      paymentStatus,
      notes
    } = req.body;

    // Validações
    if (!clientId || isNaN(parseInt(clientId))) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cliente é obrigatório'
      });
    }

    if (!periodStart || !periodEnd) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Período é obrigatório'
      });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'É necessário adicionar pelo menos um serviço'
      });
    }

    // Verificar se empresa existe
    const company = await Company.findByPk(parseInt(clientId));
    if (!company) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Calcular total
    const totalValue = services.reduce((sum, service) => 
      sum + (service.quantity * service.unitPrice), 0
    );

    // Gerar número da ordem
    const order_number = await ServiceOrder.generateOrderNumber();

    // Pegar user_id do usuário autenticado
    const created_by_user_id = req.user ? req.user.user_id : null;

    // Criar ordem de serviço
    const newOrder = await ServiceOrder.create({
      order_number,
      company_id: parseInt(clientId),
      title: `Ordem de Serviço - ${company.name}`,
      description: notes || null,
      period_start: periodStart,
      period_end: periodEnd,
      total_value: totalValue,
      payment_status: paymentStatus || 'pending',
      status: 'active',
      created_by_user_id
    }, { transaction });

    // Criar itens da ordem
    const itemsToCreate = services.map(service => ({
      service_order_id: newOrder.service_order_id,
      description: service.description,
      quantity: service.quantity,
      unit_price: service.unitPrice,
      total: service.quantity * service.unitPrice
    }));

    await ServiceOrderItem.bulkCreate(itemsToCreate, { transaction });

    // ✅ COMMIT ANTES DE BUSCAR
    await transaction.commit();

    // Buscar ordem completa (fora da transação)
    const createdOrder = await ServiceOrder.findByPk(newOrder.service_order_id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name'] // ✅ SEM main_area
        },
        {
          model: ServiceOrderItem,
          as: 'items'
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Ordem de serviço criada com sucesso',
      data: createdOrder
    });

  } catch (error) {
    // ✅ SÓ FAZ ROLLBACK SE AINDA ESTIVER ATIVA
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Erro ao criar ordem:', error);
    return handleDatabaseError(res, error, 'criar ordem de serviço');
  }
};

// ============================================================================
// PUT /api/service-orders/:id - Atualizar ordem
// ============================================================================
exports.update = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const {
      clientId,
      periodStart,
      periodEnd,
      services,
      paymentStatus,
      notes
    } = req.body;

    // Buscar ordem
    const order = await ServiceOrder.findOne({
      where: { order_number: id }
    });

    if (!order) {
      if (!transaction.finished) await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    // Atualizar campos
    const updates = {};
    
    if (clientId) {
      const company = await Company.findByPk(parseInt(clientId));
      if (!company) {
        if (!transaction.finished) await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Empresa não encontrada'
        });
      }
      updates.company_id = parseInt(clientId);
      updates.title = `Ordem de Serviço - ${company.name}`;
    }
    
    if (periodStart) updates.period_start = periodStart;
    if (periodEnd) updates.period_end = periodEnd;
    if (paymentStatus) updates.payment_status = paymentStatus;
    if (notes !== undefined) updates.description = notes || null;

    // Se services foi enviado, atualizar itens
    if (services && Array.isArray(services)) {
      // Deletar itens antigos
      await ServiceOrderItem.destroy({
        where: { service_order_id: order.service_order_id },
        transaction
      });

      // Criar novos itens
      const itemsToCreate = services.map(service => ({
        service_order_id: order.service_order_id,
        description: service.description,
        quantity: service.quantity,
        unit_price: service.unitPrice,
        total: service.quantity * service.unitPrice
      }));

      await ServiceOrderItem.bulkCreate(itemsToCreate, { transaction });

      // Recalcular total
      const totalValue = services.reduce((sum, service) => 
        sum + (service.quantity * service.unitPrice), 0
      );
      updates.total_value = totalValue;
    }

    await order.update(updates, { transaction });
    
    // ✅ COMMIT ANTES DE BUSCAR
    await transaction.commit();

    // Buscar ordem atualizada (fora da transação)
    const updatedOrder = await ServiceOrder.findByPk(order.service_order_id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'name'] // ✅ SEM main_area
        },
        {
          model: ServiceOrderItem,
          as: 'items'
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Ordem de serviço atualizada com sucesso',
      data: updatedOrder
    });

  } catch (error) {
    // ✅ SÓ FAZ ROLLBACK SE AINDA ESTIVER ATIVA
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Erro ao atualizar ordem:', error);
    return handleDatabaseError(res, error, 'atualizar ordem de serviço');
  }
};

// ============================================================================
// DELETE /api/service-orders/:id - Excluir ordem
// ============================================================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await ServiceOrder.findOne({
      where: { order_number: id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Ordem de serviço não encontrada'
      });
    }

    // Deletar (cascade irá deletar os itens automaticamente)
    await order.destroy();

    return res.status(200).json({
      success: true,
      message: 'Ordem de serviço excluída com sucesso'
    });

  } catch (error) {
    return handleDatabaseError(res, error, 'excluir ordem de serviço');
  }
};