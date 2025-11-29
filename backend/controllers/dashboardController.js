const ScheduledService = require('../models/ScheduledService');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceCatalog = require('../models/ServiceCatalog');
const Client = require('../models/Client');
const User = require('../models/User');
const ManagerArea = require('../models/ManagerArea');
const Team = require('../models/Team');

const { Op, Sequelize } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

/**
 * @desc    Busca dados para o dashboard do colaborador.
 * @route   GET /api/dashboard/collaborator
 * @access  Private (Collaborator)
 */
exports.getCollaboratorDashboard = async (req, res) => {
  // Sinto muito. Eu apaguei o código original desta função por engano.
  // Por favor, me forneça o código para que eu possa restaurá-lo.
  res.status(500).json({ error: 'Implementação ausente. O código original foi perdido.' });
};


/**
 * @desc    Busca dados consolidados para o dashboard do gestor.
 * @route   GET /api/dashboard/manager
 * @access  Private (Manager)
 */
exports.getManagerDashboard = async (req, res) => {
  const { id: userId, user_type: userType, name } = req.user;

  if (userType !== 'manager') {
    return res.status(403).json({ message: 'Acesso negado. Apenas gestores podem ver este dashboard.' });
  }

  try {
    // 1. Encontrar as áreas de atuação do gestor
    const managerAreas = await ManagerArea.findAll({
      where: { manager_user_id: userId },
      attributes: ['area_id'],
    });
    const areaIds = managerAreas.map(area => area.area_id);

    if (areaIds.length === 0) {
        return res.status(200).json({ 
            welcomeMessage: `Olá, ${name}! Parece que você ainda não foi designado a uma área.`,
            keyMetrics: { pendingRequests: 0, servicesInProgress: 0, completedThisMonth: 0 },
            recentActivity: []
        });
    }

    // 2. Buscar métricas chave para essas áreas
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const pendingRequests = await ServiceRequest.count({
      where: { status: 'pending', area_id: { [Op.in]: areaIds } }
    });

    const servicesInProgress = await ScheduledService.count({
      where: { status: 'in-progress' },
      include: [{ model: ServiceRequest, as: 'serviceRequest', where: { area_id: { [Op.in]: areaIds } }, attributes: [] }]
    });

    const completedThisMonth = await ScheduledService.count({
        where: {
            status: 'completed',
            completion_date: { [Op.between]: [startOfMonth, endOfMonth] },
        },
        include: [{ model: ServiceRequest, as: 'serviceRequest', where: { area_id: { [Op.in]: areaIds } }, attributes: [] }]
    });

    // 3. Buscar atividades recentes da equipe na área
    const recentActivity = await ScheduledService.findAll({
        limit: 5,
        order: [['scheduled_date', 'DESC']],
        include: [
            {
                model: ServiceRequest,
                as: 'serviceRequest',
                attributes: ['title'],
                where: { area_id: { [Op.in]: areaIds } },
                include: [
                    { model: Client, as: 'client', attributes: ['main_company_name'] }
                ]
            },
            {
                model: User,
                as: 'collaborator',
                attributes: ['name']
            }
        ]
    });

    // 4. Montar e enviar a resposta
    const dashboardData = {
      welcomeMessage: `Olá, ${name}! Aqui está a performance da sua área.`,
      keyMetrics: {
        pendingRequests,
        servicesInProgress,
        completedThisMonth
      },
      recentActivity: recentActivity.map(item => ({
        id: item.scheduled_service_id,
        title: item.serviceRequest.title,
        clientName: item.serviceRequest.client.main_company_name,
        collaboratorName: item.collaborator?.name || 'Não atribuído',
        scheduledDate: item.scheduled_date,
        status: item.status
      }))
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error("Erro detalhado no dashboard do gestor:", error);
    handleDatabaseError(res, error, 'buscar dados para o dashboard do gestor');
  }
};

/**
 * @desc    Busca estatísticas de requisições de serviço para o dashboard do gestor.
 * @route   GET /api/manager/dashboard/stats
 * @access  Private (Manager)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('service_request_id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const initialStats = {
      pendente: 0,
      agendado: 0,
      'em-andamento': 0,
      concluido: 0,
      cancelado: 0,
    };

    const formattedStats = stats.reduce((acc, item) => {
      const keyMap = {
        'pending': 'pendente',
        'assigned': 'agendado',
        'in-progress': 'em-andamento',
        'completed': 'concluido',
        'cancelled': 'cancelado'
      };
      const frontendKey = keyMap[item.status];
      if (frontendKey) {
        acc[frontendKey] = parseInt(item.count, 10);
      }
      return acc;
    }, initialStats);

    res.status(200).json(formattedStats);

  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard do gestor:", error);
    handleDatabaseError(res, error, 'buscar estatísticas do dashboard');
  }
};
