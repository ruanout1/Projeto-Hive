const { Op, Sequelize } = require('sequelize');
const {
  ServiceRequest,
  Company,
  Team,
  User
} = require('../database/db');

// Helper para erros de banco
const handleDatabaseError = (res, error, action) => {
  console.error(`Erro ao ${action}:`, error);
  return res.status(500).json({
    message: `Erro ao ${action}`,
    error: error.message
  });
};


// Mapeamento de status (copiado do managerController)
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
// FUNÇÕES DE SOLICITAÇÃO DE SERVIÇO (ADMIN E GESTOR)
// =====================================

// Função auxiliar para criar a condição 'WHERE' baseada no papel
const buildServiceRequestWhere = (user) => {
  if (user.role_key === 'admin') {
    // Admin vê tudo, sem filtro de área/gestor
    return {}; 
  }
  
  // Gestor vê apenas sua área ou o que foi atribuído a ele
  // TODO: Verifique se 'user.area' está sendo preenchido corretamente no middleware 'protect'
  return {
    [Op.or]: [
      { assigned_manager_area: user.area },
      { assigned_manager_id: user.id }
    ]
  };
};


// Estatísticas específicas para a tela de solicitações
exports.getServiceRequestsStats = async (req, res) => {
  try {
    const whereCondition = buildServiceRequestWhere(req.user);

    // Adiciona o filtro de status que você tinha
    whereCondition.status = {
      [Op.in]: ['delegated', 'approved', 'refused-by-manager', 'in-progress']
    };

    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: whereCondition,
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

// Lista todas as solicitações (com paginação e filtros)
exports.getServiceRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // Começa com a condição de permissão (admin vê {}, gestor vê sua área)
    const whereCondition = buildServiceRequestWhere(req.user);

    // Filtro por status
    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    // Filtro por busca
    if (search) {
      whereCondition[Op.or] = [
        { request_number: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        // IMPORTANTE: Esta busca em 'include' pode ser lenta.
        // É melhor usar um 'subQuery' ou um join explícito se ficar lento.
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
          attributes: ['user_id', 'area'], // 'area' pode estar no model Client direto
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
      offset: offset,
      distinct: true
    });

    // ... (Sua lógica de formatação de requests está correta) ...
    const formattedRequests = requests.map(request => ({
        id: request.request_number,
        clientName: request.client?.user?.full_name || 'Cliente não encontrado',
        clientArea: request.client?.area,
        // ... resto dos seus campos formatados ...
        status: request.status,
    }));

    res.status(200).json({
      requests: formattedRequests,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações');
  }
};

// Busca uma solicitação específica por ID
exports.getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Começa com a condição de permissão
    const whereCondition = buildServiceRequestWhere(req.user);
    // Adiciona a busca pelo ID
    whereCondition.request_number = id;

    const request = await ServiceRequest.findOne({
      where: whereCondition,
      include: [ /* ... Seus includes ... */ ]
    });

    if (!request) {
      return res.status(404).json({
        error: 'Solicitação não encontrada ou você não tem permissão para acessá-la'
      });
    }

    // ... (Sua lógica de formatação do 'formattedRequest' está correta) ...
    const formattedRequest = { /* ... */ };

    res.status(200).json(formattedRequest);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitação por ID');
  }
};

// Aceitar uma solicitação delegada
exports.acceptServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { observations } = req.body;
    
    // Condição de permissão + status
    const whereCondition = buildServiceRequestWhere(req.user);
    whereCondition.request_number = id;
    whereCondition.status = 'delegated';

    const request = await ServiceRequest.findOne({
      where: whereCondition
    });

    if (!request) {
      return res.status(404).json({
        error: 'Solicitação não encontrada ou não está disponível para aceitação'
      });
    }

    await request.update({
      status: 'approved',
      assigned_manager_id: req.user.id, // Atribui ao usuário que aceitou
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
    const { refusalReason } = req.body;

    if (!refusalReason || refusalReason.trim() === '') {
      return res.status(400).json({
        error: 'Motivo da recusa é obrigatório'
      });
    }

    // Condição de permissão + status
    const whereCondition = buildServiceRequestWhere(req.user);
    whereCondition.request_number = id;
    whereCondition.status = 'delegated';

    const request = await ServiceRequest.findOne({
      where: whereCondition
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
      assigned_manager_id: req.user.id, // Marca quem recusou
      updated_at: new Date()
    });

    res.status(200).json({
      message: 'Solicitação recusada com sucesso',
      request: {
        id: request.request_number,
        status: 'refused-by-manager',
        refusalReason: refusalReason,
      }
    });
  } catch (error) {
    handleDatabaseError(res, error, 'recusar solicitação');
  }
};

// Busca solicitações por área (esta função é um pouco redundante agora)
// `getServiceRequests` com query `?area=...` faria o mesmo.
// Mas vamos mantê-la por enquanto.
exports.getRequestsByArea = async (req, res) => {
  try {
    const { area } = req.query;
    const baseWhere = buildServiceRequestWhere(req.user);

    // Se um gestor tentar ver uma área que não é a dele, bloqueia.
    if (req.user.role_key === 'manager' && area && area !== req.user.area) {
      return res.status(403).json({
        error: 'Você só pode visualizar solicitações da sua área'
      });
    }

    // Se for gestor, a 'baseWhere' já filtra pela área dele.
    // Se for admin, ele pode adicionar um filtro de área.
    if (req.user.role_key === 'admin' && area) {
      baseWhere.assigned_manager_area = area;
    }

    const requests = await ServiceRequest.findAll({
      where: baseWhere,
      include: [ /* ... Seus includes ... */ ],
      order: [['created_at', 'DESC']]
    });
    
    // ... (Sua formatação) ...
    const formattedRequests = requests.map(request => ({ /* ... */ }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações por área');
  }
};

// Busca avançada de solicitações
exports.searchServiceRequests = async (req, res) => {
  try {
    const { q, status, startDate, endDate } = req.query;
    
    // Começa com a permissão base
    const whereCondition = buildServiceRequestWhere(req.user);

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
      include: [ /* ... Seus includes ... */ ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    // ... (Sua formatação) ...
    const formattedRequests = requests.map(request => ({ /* ... */ }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar solicitações');
  }
};
