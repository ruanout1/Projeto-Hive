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

// Mapeamento de status (necessário para getActiveRequests)
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
// FUNÇÕES DE DASHBOARD (ADMIN E GESTOR)
// =====================================

// Retorna estatísticas de solicitações
exports.getDashboardStats = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {};
    const includeClient = {
      model: Client,
      as: 'client',
      attributes: [], // Não precisamos dos atributos, só para o 'where'
      required: true // Garante que só traga requests com clientes
    };

    // Se for gestor, filtra por clientes da sua área.
    // Se for admin, o 'where' fica vazio (vê tudo).
    if (loggedInUser.user_type === 'manager') {
      // TODO: Verifique se 'req.user.area' está vindo do middleware 'protect'
      whereCondition['$client.area$'] = loggedInUser.area;
    }

    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: whereCondition,
      include: [includeClient],
      group: ['status'],
    });

    const stats = counts.reduce((acc, item) => {
      // Usando o 'get' para acessar o dado 'count' da agregação
      const count = Number(item.get('count'));
      const frontendStatus = statusMap[item.status] || item.status;
      acc[frontendStatus] = (acc[frontendStatus] || 0) + count;
      return acc;
    }, {});

    // Garante que todos os status principais existam
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
    handleDatabaseError(res, error, 'buscar estatísticas do dashboard');
  }
};

// Retorna solicitações ativas (tabela da dashboard)
exports.getActiveRequests = async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    // Condição base: status
    const whereCondition = {
      status: {
        [Op.notIn]: ['completed', 'cancelled'],
      },
    };

    // Condição de inclusão
    const include = [
      {
        model: Client,
        as: 'client',
        attributes: ['user_id', 'area'], // Inclua 'area' para o filtro
        required: true,
        include: [{ model: User, as: 'user', attributes: ['full_name'] }],
      },
      {
        model: Team,
        as: 'assignedTeam',
        attributes: ['name'],
      },
    ];
    
    // Se for gestor, filtra por clientes da sua área. Admin vê tudo.
    if (loggedInUser.user_type === 'manager') {
      whereCondition['$client.area$'] = loggedInUser.area;
    }

    const activeRequests = await ServiceRequest.findAll({
      where: whereCondition,
      include: include,
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
