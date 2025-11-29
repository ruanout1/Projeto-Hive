const ScheduleService = require('../models/ScheduledService');
const TeamMember = require('../models/TeamMember');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');
const User = require('../models/User');
const ServiceCatalog = require('../models/ServiceCatalog');
const ClientAddress = require('../models/ClientAddress');
const { Op } = require('sequelize');

// @desc    Get the personal schedule for the logged-in collaborator
// @route   GET /api/collaborator-schedule/my-schedule
// @access  Private (Collaborator)
exports.getMySchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Encontrar as equipes do colaborador logado
    const teamMemberships = await TeamMember.findAll({
      where: { user_id: userId },
      attributes: ['team_id'],
    });

    if (teamMemberships.length === 0) {
      return res.status(200).json([]);
    }

    const teamIds = teamMemberships.map(tm => tm.team_id);

    // 2. Buscar os serviços agendados para as equipes encontradas
    const scheduledServices = await ScheduleService.findAll({
      where: {
        team_id: { [Op.in]: teamIds },
      },
      include: [
        {
          model: ServiceRequest,
          as: 'serviceRequest',
          attributes: ['description'], 
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['client_id'], 
              include: [{
                  model: User,
                  as: 'user',
                  attributes: ['full_name'] 
              }]
            },
            {
                model: ServiceCatalog,
                as: 'service',
                attributes: ['title'] 
            },
            {
                model: ClientAddress,
                as: 'address',
                attributes: ['street_address'] 
            }
          ],
        },
      ],
      order: [['scheduledDate', 'DESC'], ['scheduledTime', 'DESC']],
      logging: console.log 
    });

    res.status(200).json(scheduledServices);

  } catch (error) {
    console.error('Erro detalhado ao buscar a agenda do colaborador:', error);
    res.status(500).json({ 
      message: 'Erro de servidor ao buscar a agenda do colaborador.', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Contacte o suporte' 
    });
  }
};
