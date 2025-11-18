const { Op, fn, col, literal } = require('sequelize');
const Client = require('../models/Client');
const User = require('../models/User');
const Team = require('../models/Team');
const ServiceRequest = require('../models/ServiceRequest');
const ServiceCatalog = require('../models/ServiceCatalog');
const ClientAddress = require('../models/ClientAddress');
const Area = require('../models/Area');

// Mapeamento de status para o frontend
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


// FUNÇÃO DE ESTATÍSTICAS (VERSÃO ANTERIOR - COM BUG)
exports.getDashboardStats = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {};

    // Filtro por gestor
    if (loggedInUser.user_type === 'manager') {
      const managerWithArea = await User.findByPk(loggedInUser.id, {
        include: [{ model: Area, as: 'managerAreas' }]
      });

      if (!managerWithArea || !managerWithArea.managerAreas || managerWithArea.managerAreas.length === 0) {
        return res.status(403).json({ message: "Gestor não está associado a nenhuma área." });
      }
      const areaIds = managerWithArea.managerAreas.map(ma => ma.area_id);

      whereCondition['$address.area.id$'] = { [Op.in]: areaIds };
    }

    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      include: [
        {
          model: ClientAddress,
          as: 'address',
          attributes: [],
          include: [{
            model: Area,
            as: 'area',
            attributes: []
          }]
        }
      ],
      where: whereCondition,
      group: ['status'],
      raw: true
    });

    const stats = counts.reduce((acc, item) => {
      const frontendStatus = statusMap[item.status] || item.status;
      acc[frontendStatus] = parseInt(item.count, 10);
      return acc;
    }, {});

    const allStatuses = { pendente: 0, agendado: 0, 'em-andamento': 0, concluido: 0, cancelado: 0, ...stats };

    res.status(200).json(allStatuses);
  } catch (error) {
    console.error('ERRO AO BUSCAR ESTATÍSTICAS (REVERTIDO):', error);
    res.status(500).json({ message: 'Erro interno ao processar estatísticas do dashboard.', error: error.message });
  }
};


// FUNÇÃO DE SOLICITAÇÕES ATIVAS (VERSÃO ANTERIOR - COM BUG)
exports.getActiveRequests = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {
      status: { [Op.notIn]: ['completed', 'cancelled'] },
    };

    // Filtro por gestor
    if (loggedInUser.user_type === 'manager') {
      const managerWithArea = await User.findByPk(loggedInUser.id, {
        include: [{ model: Area, as: 'managerAreas' }]
      });
      if (managerWithArea && managerWithArea.managerAreas && managerWithArea.managerAreas.length > 0) {
        const areaIds = managerWithArea.managerAreas.map(ma => ma.area_id);
        whereCondition['$address.area.id$'] = { [Op.in]: areaIds };
      } else {
        return res.status(200).json([]); // Retorna vazio se o gestor não tem área
      }
    }

    const activeRequests = await ServiceRequest.findAll({
      where: whereCondition,
      include: [
        { model: Client, as: 'client', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: ServiceCatalog, as: 'service', attributes: ['name'] },
        { model: Team, as: 'assignedTeam', attributes: ['name'] },
        { model: ClientAddress, as: 'address', include: [{ model: Area, as: 'area' }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const formatted = activeRequests.map(req => ({
      id: req.id, // Ou qualquer outro ID que você use
      cliente: req.client?.user?.name || 'N/A',
      servico: req.service?.name || 'N/A',
      equipe: req.assignedTeam?.name || 'Não atribuída',
      status: statusMap[req.status] || req.status,
      prazo: req.createdAt ? new Date(req.createdAt).toLocaleDateString('pt-BR') : 'N/A'
    }));

    res.status(200).json(formatted);

  } catch (error) {
    console.error('ERRO AO BUSCAR SOLICITAÇÕES ATIVAS (REVERTIDO):', error);
    res.status(500).json({ message: 'Erro interno ao processar solicitações ativas.', error: error.message });
  }
};
