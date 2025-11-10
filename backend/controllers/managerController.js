const { Op, Sequelize } = require('sequelize');
const ServiceRequest = require('../models/ServiceRequest');
const Client         = require('../models/Client');
const Team           = require('../models/Team');
const User           = require('../models/User');

// Mapeamento de status para exibir no frontend
const statusMap = {
  pending: 'pendente',
  scheduled: 'agendado',
  in_progress: 'em-andamento',
  completed: 'concluido',
  cancelled: 'cancelado',
  delegated: 'delegado',
  'refused-by-manager': 'recusado-pelo-gestor',
  approved: 'aprovado',
  urgent: 'urgente'
};

// =====================================
// DASHBOARD DO GESTOR
// =====================================

// Retorna estatísticas de solicitações
exports.getDashboardStats = async (req, res) => {
  try {
    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      group: ['status'],
    });

    const stats = counts.reduce((acc, item) => {
      const frontendStatus = statusMap[item.status] || item.status;
      acc[frontendStatus] = Number(item.get('count'));
      return acc;
    }, {});

    const allStatuses = {
      pendente: 0,
      agendado: 0,
      'em-andamento': 0,
      concluido: 0,
      cancelado: 0,
      ...stats,
    };

    res.status(200).json(allStatuses);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas');
  }
};

// Retorna solicitações ativas (tabela da dashboard)
exports.getActiveRequests = async (req, res) => {
  try {
    const activeRequests = await ServiceRequest.findAll({
      where: {
        status: {
          [Op.notIn]: ['completed', 'cancelled'],
        },
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }],
        },
        {
          model: Team,
          as: 'assignedTeam',
          attributes: ['name'],
        },
      ],
      order: [['desired_date', 'ASC']],
      limit: 10,
    });

    const formatted = activeRequests.map((req) => ({
      id: req.request_number,
      cliente: req.client?.user?.full_name || 'Cliente não encontrado',
      servico: req.title,
      equipe: req.assignedTeam?.name || 'Não assignada',
      status: statusMap[req.status] || req.status,
      prazo: new Date(req.desired_date).toLocaleDateString('pt-BR'),
    }));

    res.status(200).json(formatted);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações ativas');
  }
};

// =====================================
// NOVAS FUNÇÕES PARA TELA DE SOLICITAÇÕES
// =====================================

// Estatísticas específicas para a tela de solicitações do gestor
exports.getServiceRequestsStats = async (req, res) => {
  try {
    const managerId = req.user.id; // Assume que o ID do gestor vem do token JWT
    const managerArea = req.user.area; // Assume que a área do gestor vem do token

    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: {
        [Op.or]: [
          { assigned_manager_area: managerArea },
          { assigned_manager_id: managerId }
        ],
        status: {
          [Op.in]: ['delegated', 'approved', 'refused-by-manager', 'in-progress']
        }
      },
      group: ['status'],
    });

    const stats = counts.reduce((acc, item) => {
      acc[item.status] = Number(item.get('count'));
      return acc;
    }, {});

    const result = {
      delegated: stats.delegated || 0,
      approved: stats.approved || 0,
      refused: stats['refused-by-manager'] || 0,
      total: Object.values(stats).reduce((sum, count) => sum + count, 0)
    };

    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de solicitações');
  }
};

// Lista todas as solicitações do gestor (com paginação e filtros)
exports.getServiceRequests = async (req, res) => {
  try {
    const managerId = req.user.id;
    const managerArea = req.user.area;
    const { status, page = 1, limit = 10, search } = req.query;

    const whereCondition = {
      [Op.or]: [
        { assigned_manager_area: managerArea },
        { assigned_manager_id: managerId }
      ]
    };

    // Filtro por status
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Filtro por busca
    if (search) {
      whereCondition[Op.or] = [
        { request_number: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { '$client.user.full_name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: requests } = await ServiceRequest.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id', 'area'],
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['full_name', 'email'] 
            }
          ]
        },
        {
          model: Team,
          as: 'assignedTeam',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignedManager',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const formattedRequests = requests.map(request => ({
      id: request.request_number,
      clientName: request.client?.user?.full_name || 'Cliente não encontrado',
      clientArea: request.client?.area,
      clientLocation: request.location,
      serviceType: request.title,
      description: request.description,
      requestDate: request.created_at.toLocaleDateString('pt-BR'),
      requestTime: request.created_at.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', minute: '2-digit' 
      }),
      preferredDate: request.desired_date?.toLocaleDateString('pt-BR') || '',
      status: request.status,
      assignedTeam: request.assignedTeam?.name,
      assignedCollaborator: request.assigned_collaborator,
      assignedManager: request.assignedManager?.full_name,
      assignedManagerArea: request.assigned_manager_area,
      observations: request.observations,
      availableDates: request.available_dates ? JSON.parse(request.available_dates) : [],
      urgentReason: request.urgent_reason,
      refusalReason: request.refusal_reason,
      refusalDate: request.refusal_date?.toLocaleDateString('pt-BR'),
      invoice: request.invoice_data ? JSON.parse(request.invoice_data) : null,
      photoDocumentation: request.photo_documentation ? JSON.parse(request.photo_documentation) : null
    }));

    res.status(200).json({
      requests: formattedRequests,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações do gestor');
  }
};

// Busca uma solicitação específica por ID
exports.getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const managerArea = req.user.area;

    const request = await ServiceRequest.findOne({
      where: {
        request_number: id,
        [Op.or]: [
          { assigned_manager_area: managerArea },
          { assigned_manager_id: managerId }
        ]
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id', 'area'],
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['full_name', 'email', 'phone'] 
            }
          ]
        },
        {
          model: Team,
          as: 'assignedTeam',
          attributes: ['id', 'name', 'description']
        },
        {
          model: User,
          as: 'assignedManager',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        error: 'Solicitação não encontrada ou você não tem permissão para acessá-la'
      });
    }

    const formattedRequest = {
      id: request.request_number,
      clientName: request.client?.user?.full_name,
      clientArea: request.client?.area,
      clientLocation: request.location,
      serviceType: request.title,
      description: request.description,
      requestDate: request.created_at.toLocaleDateString('pt-BR'),
      requestTime: request.created_at.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', minute: '2-digit' 
      }),
      preferredDate: request.desired_date?.toLocaleDateString('pt-BR'),
      status: request.status,
      assignedTeam: request.assignedTeam?.name,
      assignedCollaborator: request.assigned_collaborator,
      assignedManager: request.assignedManager?.full_name,
      assignedManagerArea: request.assigned_manager_area,
      observations: request.observations,
      availableDates: request.available_dates ? JSON.parse(request.available_dates) : [],
      urgentReason: request.urgent_reason,
      refusalReason: request.refusal_reason,
      refusalDate: request.refusal_date?.toLocaleDateString('pt-BR'),
      invoice: request.invoice_data ? JSON.parse(request.invoice_data) : null,
      photoDocumentation: request.photo_documentation ? JSON.parse(request.photo_documentation) : null
    };

    res.status(200).json(formattedRequest);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitação por ID');
  }
};

// Aceitar uma solicitação delegada
exports.acceptServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const { observations } = req.body;

    const request = await ServiceRequest.findOne({
      where: {
        request_number: id,
        status: 'delegated',
        [Op.or]: [
          { assigned_manager_area: req.user.area },
          { assigned_manager_id: managerId }
        ]
      }
    });

    if (!request) {
      return res.status(404).json({
        error: 'Solicitação não encontrada ou não está disponível para aceitação'
      });
    }

    await request.update({
      status: 'approved',
      assigned_manager_id: managerId,
      observations: observations || `Aceito por ${req.user.full_name} em ${new Date().toLocaleDateString('pt-BR')}`,
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Solicitação aceita com sucesso',
      request: {
        id: request.request_number,
        status: 'approved',
        assignedManager: req.user.full_name
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'aceitar solicitação');
  }
};

// Recusar uma solicitação delegada
exports.refuseServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const { refusalReason } = req.body;

    if (!refusalReason || refusalReason.trim() === '') {
      return res.status(400).json({
        error: 'Motivo da recusa é obrigatório'
      });
    }

    const request = await ServiceRequest.findOne({
      where: {
        request_number: id,
        status: 'delegated',
        [Op.or]: [
          { assigned_manager_area: req.user.area },
          { assigned_manager_id: managerId }
        ]
      }
    });

    if (!request) {
      return res.status(404).json({
        error: 'Solicitação não encontrada ou não está disponível para recusa'
      });
    }

    await request.update({
      status: 'refused-by-manager',
      refusal_reason: refusalReason,
      refusal_date: new Date(),
      assigned_manager_id: managerId,
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Solicitação recusada com sucesso',
      request: {
        id: request.request_number,
        status: 'refused-by-manager',
        refusalReason: refusalReason,
        refusalDate: new Date().toLocaleDateString('pt-BR')
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'recusar solicitação');
  }
};

// Buscar solicitações por área (filtro)
exports.getRequestsByArea = async (req, res) => {
  try {
    const { area } = req.query;
    const managerArea = req.user.area;

    // Garante que o gestor só veja solicitações da sua área
    if (area && area !== managerArea) {
      return res.status(403).json({
        error: 'Você só pode visualizar solicitações da sua área'
      });
    }

    const requests = await ServiceRequest.findAll({
      where: {
        [Op.or]: [
          { assigned_manager_area: managerArea },
          { assigned_manager_id: req.user.id }
        ]
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id', 'area'],
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['full_name'] 
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedRequests = requests.map(request => ({
      id: request.request_number,
      clientName: request.client?.user?.full_name,
      clientArea: request.client?.area,
      serviceType: request.title,
      status: request.status,
      requestDate: request.created_at.toLocaleDateString('pt-BR')
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações por área');
  }
};

// Busca avançada de solicitações
exports.searchServiceRequests = async (req, res) => {
  try {
    const { q, status, startDate, endDate } = req.query;
    const managerArea = req.user.area;

    const whereCondition = {
      [Op.or]: [
        { assigned_manager_area: managerArea },
        { assigned_manager_id: req.user.id }
      ]
    };

    if (q) {
      whereCondition[Op.or] = [
        { request_number: { [Op.like]: `%${q}%` } },
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { '$client.user.full_name$': { [Op.like]: `%${q}%` } }
      ];
    }

    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    if (startDate && endDate) {
      whereCondition.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const requests = await ServiceRequest.findAll({
      where: whereCondition,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id', 'area'],
          include: [
            { 
              model: User, 
              as: 'user', 
              attributes: ['full_name'] 
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const formattedRequests = requests.map(request => ({
      id: request.request_number,
      clientName: request.client?.user?.full_name,
      clientArea: request.client?.area,
      serviceType: request.title,
      status: request.status,
      requestDate: request.created_at.toLocaleDateString('pt-BR')
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações');
  }
};

// =====================================
// FUNÇÃO AUXILIAR PARA TRATAMENTO DE ERROS
// =====================================

function handleDatabaseError(res, error, action) {
  console.error(`Erro ao ${action}:`, error);
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Dados de entrada inválidos',
      details: error.errors.map(err => err.message)
    });
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Erro de referência: registro relacionado não encontrado'
    });
  }

  res.status(500).json({
    error: `Erro interno do servidor ao ${action}`,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// =====================================
// NOVAS FUNÇÕES PARA TELA DE CLIENTES DO GESTOR
// =====================================

// Estatísticas de clientes para o gestor
exports.getClientsStats = async (req, res) => {
  try {
    const managerArea = req.user.area;

    const counts = await Client.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: {
        area: managerArea
      },
      group: ['status'],
    });

    const stats = counts.reduce((acc, item) => {
      acc[item.status] = Number(item.get('count'));
      return acc;
    }, {});

    const totalRevenue = await ServiceRequest.sum('total_value', {
      where: {
        '$client.area$': managerArea,
        status: 'completed'
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: []
        }
      ]
    });

    const result = {
      total: (stats.active || 0) + (stats.inactive || 0),
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      totalRevenue: totalRevenue || 0
    };

    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de clientes');
  }
};

// Listar clientes da área do gestor
exports.getClients = async (req, res) => {
  try {
    const managerArea = req.user.area;
    const { status, page = 1, limit = 10, search } = req.query;

    const whereCondition = {
      area: managerArea
    };

    // Filtro por status
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Filtro por busca
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ServiceRequest,
          as: 'serviceRequests',
          attributes: [
            'id',
            'status',
            'total_value',
            'created_at'
          ],
          required: false
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calcular estatísticas para cada cliente
    const clientsWithStats = clients.map(client => {
      const serviceRequests = client.serviceRequests || [];
      const completedServices = serviceRequests.filter(req => req.status === 'completed').length;
      const activeServices = serviceRequests.filter(req => ['scheduled', 'in_progress'].includes(req.status)).length;
      const totalRevenue = serviceRequests
        .filter(req => req.status === 'completed')
        .reduce((sum, req) => sum + (req.total_value || 0), 0);
      
      const lastService = serviceRequests.length > 0 
        ? new Date(Math.max(...serviceRequests.map(req => new Date(req.created_at))))
        : null;

      return {
        id: client.id,
        name: client.name,
        cnpj: client.cnpj,
        email: client.email,
        phone: client.phone,
        address: client.address,
        area: client.area,
        locations: client.locations ? JSON.parse(client.locations) : [],
        status: client.status,
        servicesActive: activeServices,
        servicesCompleted: completedServices,
        lastService: lastService ? lastService.toLocaleDateString('pt-BR') : '-',
        rating: client.rating || 0,
        totalValue: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(totalRevenue),
        notes: client.notes,
        createdAt: client.created_at.toLocaleDateString('pt-BR')
      };
    });

    res.status(200).json({
      clients: clientsWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes do gestor');
  }
};

// Buscar cliente específico por ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const managerArea = req.user.area;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      },
      include: [
        {
          model: ServiceRequest,
          as: 'serviceRequests',
          attributes: ['id', 'title', 'status', 'total_value', 'created_at'],
          order: [['created_at', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    const serviceRequests = client.serviceRequests || [];
    const completedServices = serviceRequests.filter(req => req.status === 'completed').length;
    const activeServices = serviceRequests.filter(req => ['scheduled', 'in_progress'].includes(req.status)).length;
    const totalRevenue = serviceRequests
      .filter(req => req.status === 'completed')
      .reduce((sum, req) => sum + (req.total_value || 0), 0);

    const formattedClient = {
      id: client.id,
      name: client.name,
      cnpj: client.cnpj,
      email: client.email,
      phone: client.phone,
      address: client.address,
      area: client.area,
      locations: client.locations ? JSON.parse(client.locations) : [],
      status: client.status,
      servicesActive: activeServices,
      servicesCompleted: completedServices,
      lastService: serviceRequests.length > 0 
        ? new Date(serviceRequests[0].created_at).toLocaleDateString('pt-BR')
        : '-',
      rating: client.rating || 0,
      totalValue: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalRevenue),
      notes: client.notes,
      createdAt: client.created_at.toLocaleDateString('pt-BR'),
      recentServices: serviceRequests.map(req => ({
        id: req.id,
        title: req.title,
        status: req.status,
        value: req.total_value ? new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(req.total_value) : 'R$ 0,00',
        date: new Date(req.created_at).toLocaleDateString('pt-BR')
      }))
    };

    res.status(200).json(formattedClient);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar cliente por ID');
  }
};

// Criar novo cliente (apenas na área do gestor)
exports.createClient = async (req, res) => {
  try {
    const managerArea = req.user.area;
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      notes,
      status = 'active',
      locations = []
    } = req.body;

    // Validar campos obrigatórios
    if (!name || !cnpj || !email) {
      return res.status(400).json({
        error: 'Nome, CNPJ e email são campos obrigatórios'
      });
    }

    // Verificar se CNPJ já existe
    const existingClient = await Client.findOne({ where: { cnpj } });
    if (existingClient) {
      return res.status(400).json({
        error: 'Já existe um cliente cadastrado com este CNPJ'
      });
    }

    // Garantir que todas as locations sejam da área do gestor
    const validatedLocations = locations.map(location => ({
      ...location,
      area: managerArea // Forçar área do gestor
    }));

    const newClient = await Client.create({
      name,
      cnpj,
      email,
      phone: phone || '',
      address: address || {},
      area: managerArea, // Sempre criar na área do gestor
      locations: JSON.stringify(validatedLocations),
      notes: notes || '',
      status: status,
      rating: 0,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      client: {
        id: newClient.id,
        name: newClient.name,
        cnpj: newClient.cnpj,
        email: newClient.email,
        area: newClient.area
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'criar cliente');
  }
};

// Atualizar cliente (apenas da área do gestor)
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const managerArea = req.user.area;
    const {
      name,
      cnpj,
      email,
      phone,
      address,
      notes,
      status,
      locations = []
    } = req.body;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    // Verificar se novo CNPJ já existe em outro cliente
    if (cnpj && cnpj !== client.cnpj) {
      const existingClient = await Client.findOne({ 
        where: { 
          cnpj: cnpj,
          id: { [Op.ne]: id }
        } 
      });
      if (existingClient) {
        return res.status(400).json({
          error: 'Já existe outro cliente cadastrado com este CNPJ'
        });
      }
    }

    // Garantir que todas as locations sejam da área do gestor
    const validatedLocations = locations.map(location => ({
      ...location,
      area: managerArea
    }));

    await client.update({
      name: name || client.name,
      cnpj: cnpj || client.cnpj,
      email: email || client.email,
      phone: phone || client.phone,
      address: address || client.address,
      notes: notes || client.notes,
      status: status || client.status,
      locations: JSON.stringify(validatedLocations),
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Cliente atualizado com sucesso',
      client: {
        id: client.id,
        name: client.name,
        cnpj: client.cnpj,
        email: client.email
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar cliente');
  }
};

// Ativar/desativar cliente
exports.toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const managerArea = req.user.area;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    
    await client.update({
      status: newStatus,
      updated_at: new Date()
    });

    res.status(200).json({
      message: `Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`,
      client: {
        id: client.id,
        name: client.name,
        status: newStatus
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'alterar status do cliente');
  }
};

// Buscar clientes por área (sempre da área do gestor)
exports.getClientsByArea = async (req, res) => {
  try {
    const managerArea = req.user.area;

    const clients = await Client.findAll({
      where: {
        area: managerArea,
        status: 'active'
      },
      attributes: ['id', 'name', 'cnpj', 'email'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(clients);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes por área');
  }
};

// Busca de clientes
exports.searchClients = async (req, res) => {
  try {
    const { q, status } = req.query;
    const managerArea = req.user.area;

    const whereCondition = {
      area: managerArea
    };

    if (q) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { cnpj: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } }
      ];
    }

    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    const clients = await Client.findAll({
      where: whereCondition,
      attributes: ['id', 'name', 'cnpj', 'email', 'status', 'area'],
      order: [['name', 'ASC']],
      limit: 50
    });

    res.status(200).json(clients);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes');
  }
};

// Adicionar localização a cliente
exports.addClientLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const managerArea = req.user.area;
    const locationData = req.body;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    const locations = client.locations ? JSON.parse(client.locations) : [];
    const newLocation = {
      id: `loc-${Date.now()}`,
      ...locationData,
      area: managerArea // Forçar área do gestor
    };

    locations.push(newLocation);

    await client.update({
      locations: JSON.stringify(locations),
      updated_at: new Date()
    });

    res.status(201).json({
      message: 'Localização adicionada com sucesso',
      location: newLocation
    });
  } catch (error) {
    handleDatabaseError(res, error, 'adicionar localização');
  }
};

// Atualizar localização do cliente
exports.updateClientLocation = async (req, res) => {
  try {
    const { id, locationId } = req.params;
    const managerArea = req.user.area;
    const locationData = req.body;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    const locations = client.locations ? JSON.parse(client.locations) : [];
    const locationIndex = locations.findIndex(loc => loc.id === locationId);

    if (locationIndex === -1) {
      return res.status(404).json({
        error: 'Localização não encontrada'
      });
    }

    locations[locationIndex] = {
      ...locations[locationIndex],
      ...locationData,
      area: managerArea // Manter área do gestor
    };

    await client.update({
      locations: JSON.stringify(locations),
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Localização atualizada com sucesso',
      location: locations[locationIndex]
    });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar localização');
  }
};

// Remover localização do cliente
exports.removeClientLocation = async (req, res) => {
  try {
    const { id, locationId } = req.params;
    const managerArea = req.user.area;

    const client = await Client.findOne({
      where: {
        id: id,
        area: managerArea
      }
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou não pertence à sua área'
      });
    }

    const locations = client.locations ? JSON.parse(client.locations) : [];
    
    // Verificar se é a última localização
    if (locations.length <= 1) {
      return res.status(400).json({
        error: 'O cliente deve ter pelo menos uma localização'
      });
    }

    const filteredLocations = locations.filter(loc => loc.id !== locationId);

    await client.update({
      locations: JSON.stringify(filteredLocations),
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Localização removida com sucesso'
    });
  } catch (error) {
    handleDatabaseError(res, error, 'remover localização');
  }
};

// =====================================
// FUNÇÕES PARA CONTROLE DE PONTO DO GESTOR
// =====================================

// Buscar estatísticas dos registros de ponto
exports.getTimeRecordsStats = async (req, res) => {
  try {
    const managerId = req.user.id;
    const managerArea = req.user.area;

    // Buscar equipes do gestor
    const managerTeams = await Team.findAll({
      where: {
        manager_id: managerId
      },
      attributes: ['id', 'name']
    });

    const teamIds = managerTeams.map(team => team.id);

    // Buscar colaboradores das equipes do gestor
    const teamMembers = await TeamMember.findAll({
      where: {
        team_id: teamIds
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'employee_id']
        }
      ]
    });

    const employeeIds = teamMembers.map(member => member.user.id);

    // Buscar registros de ponto do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeRecords = await TimeRecord.findAll({
      where: {
        employee_id: employeeIds,
        date: {
          [Op.between]: [today, tomorrow]
        }
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['full_name', 'employee_id'],
          include: [
            {
              model: TeamMember,
              as: 'teamMembers',
              include: [
                {
                  model: Team,
                  as: 'team',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ]
    });

    // Calcular estatísticas
    const totalActive = employeeIds.length;
    const checkedIn = timeRecords.filter(record => record.check_in_time !== null).length;
    const onDuty = timeRecords.filter(record => 
      record.check_in_time !== null && 
      record.check_out_time === null
    ).length;
    const late = timeRecords.filter(record => {
      if (!record.check_in_time) return false;
      const checkInTime = new Date(record.check_in_time);
      const expectedTime = new Date(checkInTime);
      expectedTime.setHours(8, 0, 0, 0); // Horário esperado: 08:00
      return checkInTime > expectedTime;
    }).length;
    const absent = totalActive - checkedIn;

    const stats = {
      totalActive,
      checkedIn,
      onDuty,
      late,
      absent
    };

    res.status(200).json(stats);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de ponto');
  }
};

// Listar registros de ponto das equipes do gestor
exports.getTimeRecords = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { date = new Date().toISOString().split('T')[0], team, status } = req.query;

    // Buscar equipes do gestor
    const managerTeams = await Team.findAll({
      where: {
        manager_id: managerId
      },
      attributes: ['id', 'name']
    });

    const teamIds = managerTeams.map(team => team.id);

    // Buscar colaboradores das equipes do gestor
    const teamMembers = await TeamMember.findAll({
      where: {
        team_id: teamIds
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'employee_id']
        }
      ]
    });

    const employeeIds = teamMembers.map(member => member.user.id);

    // Construir condições da query
    const whereCondition = {
      employee_id: employeeIds
    };

    // Filtro por data
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      whereCondition.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Filtro por equipe
    if (team && team !== 'Todas') {
      const teamMembersFiltered = teamMembers.filter(member => 
        member.team.name === team
      );
      whereCondition.employee_id = teamMembersFiltered.map(member => member.user.id);
    }

    const timeRecords = await TimeRecord.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'employee_id'],
          include: [
            {
              model: TeamMember,
              as: 'teamMembers',
              include: [
                {
                  model: Team,
                  as: 'team',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ],
      order: [['check_in_time', 'DESC']]
    });

    // Formatar resposta
    const formattedRecords = timeRecords.map(record => {
      const employee = record.employee;
      const team = employee.teamMembers[0]?.team?.name || 'Sem equipe';
      
      // Determinar status
      let status = 'not-registered';
      if (record.check_in_time && !record.check_out_time) {
        status = 'on-duty';
      } else if (record.check_in_time && record.check_out_time) {
        // Verificar se houve atraso
        const checkInTime = new Date(record.check_in_time);
        const expectedTime = new Date(checkInTime);
        expectedTime.setHours(8, 0, 0, 0); // Horário esperado: 08:00
        
        status = checkInTime > expectedTime ? 'late' : 'present';
      } else if (!record.check_in_time) {
        status = 'absent';
      }

      // Calcular total de horas
      let totalHours = '-';
      if (record.check_in_time && record.check_out_time) {
        const checkIn = new Date(record.check_in_time);
        const checkOut = new Date(record.check_out_time);
        const diffMs = checkOut - checkIn;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalHours = `${diffHours}h ${diffMinutes.toString().padStart(2, '0')}m`;
      }

      return {
        id: record.id,
        employeeName: employee.full_name,
        employeeId: employee.employee_id,
        team: team,
        checkInTime: record.check_in_time 
          ? new Date(record.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '-',
        checkInLocation: {
          lat: record.check_in_lat || 0,
          lng: record.check_in_lng || 0,
          address: record.check_in_address || '-'
        },
        checkOutTime: record.check_out_time
          ? new Date(record.check_out_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : undefined,
        checkOutLocation: record.check_out_lat ? {
          lat: record.check_out_lat,
          lng: record.check_out_lng,
          address: record.check_out_address
        } : undefined,
        totalHours: totalHours,
        status: status,
        notes: record.notes,
        managerReport: record.manager_report ? JSON.parse(record.manager_report) : undefined,
        reportRequested: record.report_requested || false
      };
    });

    // Aplicar filtro de status se especificado
    let filteredRecords = formattedRecords;
    if (status && status !== 'todos') {
      filteredRecords = formattedRecords.filter(record => record.status === status);
    }

    res.status(200).json({
      records: filteredRecords,
      total: filteredRecords.length
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar registros de ponto');
  }
};

// Buscar equipes do gestor
exports.getManagerTeams = async (req, res) => {
  try {
    const managerId = req.user.id;

    const teams = await Team.findAll({
      where: {
        manager_id: managerId
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const teamNames = teams.map(team => team.name);

    res.status(200).json({
      teams: teamNames
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar equipes do gestor');
  }
};

// Buscar detalhes de um registro específico
exports.getTimeRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    const record = await TimeRecord.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'employee_id'],
          include: [
            {
              model: TeamMember,
              as: 'teamMembers',
              include: [
                {
                  model: Team,
                  as: 'team',
                  attributes: ['name'],
                  where: {
                    manager_id: managerId
                  }
                }
              ]
            }
          ]
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        error: 'Registro de ponto não encontrado ou não pertence às suas equipes'
      });
    }

    // Formatar resposta
    const team = record.employee.teamMembers[0]?.team?.name || 'Sem equipe';
    
    let status = 'not-registered';
    if (record.check_in_time && !record.check_out_time) {
      status = 'on-duty';
    } else if (record.check_in_time && record.check_out_time) {
      const checkInTime = new Date(record.check_in_time);
      const expectedTime = new Date(checkInTime);
      expectedTime.setHours(8, 0, 0, 0);
      status = checkInTime > expectedTime ? 'late' : 'present';
    }

    let totalHours = '-';
    if (record.check_in_time && record.check_out_time) {
      const checkIn = new Date(record.check_in_time);
      const checkOut = new Date(record.check_out_time);
      const diffMs = checkOut - checkIn;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      totalHours = `${diffHours}h ${diffMinutes.toString().padStart(2, '0')}m`;
    }

    const formattedRecord = {
      id: record.id,
      employeeName: record.employee.full_name,
      employeeId: record.employee.employee_id,
      team: team,
      checkInTime: record.check_in_time 
        ? new Date(record.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : '-',
      checkInLocation: {
        lat: record.check_in_lat || 0,
        lng: record.check_in_lng || 0,
        address: record.check_in_address || '-'
      },
      checkOutTime: record.check_out_time
        ? new Date(record.check_out_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      checkOutLocation: record.check_out_lat ? {
        lat: record.check_out_lat,
        lng: record.check_out_lng,
        address: record.check_out_address
      } : undefined,
      totalHours: totalHours,
      status: status,
      notes: record.notes,
      managerReport: record.manager_report ? JSON.parse(record.manager_report) : undefined,
      reportRequested: record.report_requested || false,
      date: new Date(record.date).toLocaleDateString('pt-BR')
    };

    res.status(200).json(formattedRecord);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar registro de ponto por ID');
  }
};

// Justificar registro de ponto para o administrador
exports.justifyTimeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;
    const { reason, document } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        error: 'Motivo da justificativa é obrigatório'
      });
    }

    // Verificar se o registro pertence às equipes do gestor
    const record = await TimeRecord.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id'],
          include: [
            {
              model: TeamMember,
              as: 'teamMembers',
              include: [
                {
                  model: Team,
                  as: 'team',
                  attributes: ['id'],
                  where: {
                    manager_id: managerId
                  }
                }
              ]
            }
          ]
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        error: 'Registro de ponto não encontrado ou não pertence às suas equipes'
      });
    }

    const managerReport = {
      reason: reason.trim(),
      document: document || null,
      date: new Date().toLocaleDateString('pt-BR'),
      reportedBy: req.user.full_name || 'Gestor'
    };

    await record.update({
      manager_report: JSON.stringify(managerReport),
      report_requested: false, // Marcar como respondida
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Justificativa enviada com sucesso',
      report: managerReport
    });
  } catch (error) {
    handleDatabaseError(res, error, 'justificar registro de ponto');
  }
};

// Exportar relatório de ponto
exports.exportTimeRecords = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { type, team, employeeId, startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Período do relatório é obrigatório'
      });
    }

    // Buscar equipes do gestor
    const managerTeams = await Team.findAll({
      where: {
        manager_id: managerId
      },
      attributes: ['id', 'name']
    });

    const teamIds = managerTeams.map(team => team.id);

    // Buscar colaboradores das equipes do gestor
    let employeeIds = [];
    if (type === 'team' && team) {
      const specificTeam = managerTeams.find(t => t.name === team);
      if (!specificTeam) {
        return res.status(400).json({
          error: 'Equipe não encontrada'
        });
      }

      const teamMembers = await TeamMember.findAll({
        where: {
          team_id: specificTeam.id
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      });

      employeeIds = teamMembers.map(member => member.user.id);
    } else if (type === 'individual' && employeeId) {
      // Verificar se o colaborador pertence às equipes do gestor
      const employee = await User.findOne({
        where: { employee_id: employeeId },
        include: [
          {
            model: TeamMember,
            as: 'teamMembers',
            include: [
              {
                model: Team,
                as: 'team',
                where: {
                  id: teamIds
                }
              }
            ]
          }
        ]
      });

      if (!employee) {
        return res.status(400).json({
          error: 'Colaborador não encontrado ou não pertence às suas equipes'
        });
      }

      employeeIds = [employee.id];
    } else {
      // Todos os colaboradores das equipes do gestor
      const allTeamMembers = await TeamMember.findAll({
        where: {
          team_id: teamIds
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      });

      employeeIds = allTeamMembers.map(member => member.user.id);
    }

    // Buscar registros no período
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const timeRecords = await TimeRecord.findAll({
      where: {
        employee_id: employeeIds,
        date: {
          [Op.between]: [start, end]
        }
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['full_name', 'employee_id'],
          include: [
            {
              model: TeamMember,
              as: 'teamMembers',
              include: [
                {
                  model: Team,
                  as: 'team',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['check_in_time', 'ASC']]
    });

    // Formatar dados para o relatório
    const reportData = timeRecords.map(record => {
      const employee = record.employee;
      const team = employee.teamMembers[0]?.team?.name || 'Sem equipe';

      let status = 'Não Registrado';
      if (record.check_in_time && !record.check_out_time) {
        status = 'Em Jornada';
      } else if (record.check_in_time && record.check_out_time) {
        const checkInTime = new Date(record.check_in_time);
        const expectedTime = new Date(checkInTime);
        expectedTime.setHours(8, 0, 0, 0);
        status = checkInTime > expectedTime ? 'Atraso' : 'Presente';
      }

      let totalHours = '0h 00m';
      if (record.check_in_time && record.check_out_time) {
        const checkIn = new Date(record.check_in_time);
        const checkOut = new Date(record.check_out_time);
        const diffMs = checkOut - checkIn;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        totalHours = `${diffHours}h ${diffMinutes.toString().padStart(2, '0')}m`;
      }

      return {
        date: new Date(record.date).toLocaleDateString('pt-BR'),
        employee: employee.full_name,
        team: team,
        employeeId: employee.employee_id,
        checkIn: record.check_in_time 
          ? new Date(record.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '-',
        checkInLocation: record.check_in_address || '-',
        breakStart: '12:00', // Horário padrão de pausa
        breakEnd: '13:00',   // Horário padrão de retorno
        checkOut: record.check_out_time
          ? new Date(record.check_out_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : '-',
        checkOutLocation: record.check_out_address || '-',
        totalHours: totalHours,
        status: status,
        notes: record.notes || ''
      };
    });

    // TODO: Implementar geração de PDF/Excel
    // Por enquanto, retornar JSON
    res.status(200).json({
      message: 'Relatório gerado com sucesso',
      data: reportData,
      metadata: {
        type: type,
        team: type === 'team' ? team : 'Todos',
        employee: type === 'individual' ? reportData[0]?.employee : 'Todos',
        period: `${startDate} a ${endDate}`,
        totalRecords: reportData.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    handleDatabaseError(res, error, 'exportar relatório de ponto');
  }
};

// Pré-visualizar relatório de ponto
exports.previewTimeRecordsExport = async (req, res) => {
  try {
    // Reutilizar a lógica do export, mas retornar apenas uma amostra
    const result = await exports.exportTimeRecords(req, res);
    
    // Se chegou aqui, a exportação foi bem-sucedida
    // Retornar apenas os primeiros 10 registros para pré-visualização
    if (result && result.data) {
      const previewData = result.data.slice(0, 10);
      res.status(200).json({
        ...result,
        data: previewData,
        isPreview: true,
        totalRecords: result.data.length,
        previewRecords: previewData.length
      });
    }
  } catch (error) {
    handleDatabaseError(res, error, 'pré-visualizar relatório de ponto');
  }
};