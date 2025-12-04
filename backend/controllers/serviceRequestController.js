const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // ========================================================================
  // 1. LISTAR SOLICITAÇÕES (GET /api/service-requests)
  // ========================================================================
  async listRequests(req, res) {
    try {
      const { status, startDate, endDate, clientId } = req.query;
      const userRole = req.user.role_key;
      const userId = req.user.id;

      const whereClause = {};

      // Filtros Básicos
      if (status && status !== 'todos') whereClause.status = status;
      
      if (startDate && endDate) {
        whereClause.created_at = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // REGRA DE SEGURANÇA:
      // Se for CLIENTE, só vê as suas próprias solicitações.
      // (Assumindo que existe uma relação user -> client, mas aqui vamos filtrar pelo user_id de criação por enquanto)
      if (userRole === 'client') {
         whereClause.requester_user_id = userId;
      } else if (clientId) {
         // Admin/Gestor pode filtrar por cliente específico
         whereClause.company_id = clientId;
      }

      const requests = await models.service_requests.findAll({
        where: whereClause,
        include: [
          { 
            model: models.companies, 
            as: 'company',
            attributes: ['company_id', 'name', 'cnpj']
          },
          { 
            model: models.service_catalog, 
            as: 'service_catalog',
            attributes: ['service_catalog_id', 'name', 'price']
          },
          {
            model: models.users,
            as: 'requester_user',
            attributes: ['user_id', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json(requests);

    } catch (error) {
      handleDatabaseError(res, error, 'listar solicitações');
    }
  },

  // ========================================================================
  // 2. CRIAR SOLICITAÇÃO (POST /api/service-requests)
  // ========================================================================
  async createRequest(req, res) {
    const t = await sequelize.transaction();
    try {
      const { company_id, service_catalog_id, description, priority, preferred_date } = req.body;
      const requesterId = req.user.id;

      const newRequest = await models.service_requests.create({
        company_id,
        service_catalog_id,
        requester_user_id: requesterId,
        description,
        priority: priority || 'medium',
        preferred_date,
        status: 'pending' // Nasce como pendente
      }, { transaction: t });

      await t.commit();
      res.status(201).json(newRequest);

    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'criar solicitação');
    }
  },

  // ========================================================================
  // 3. ATUALIZAR STATUS (PUT /api/service-requests/:id/status)
  // Ex: Aprovar, Rejeitar
  // ========================================================================
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body; // status: 'approved', 'rejected', 'completed'

      const request = await models.service_requests.findByPk(id);
      if (!request) return res.status(404).json({ message: 'Solicitação não encontrada' });

      await request.update({ 
          status,
          admin_notes: notes // Se tiver campo de obs do admin
      });

      res.json({ message: `Solicitação atualizada para ${status}` });

    } catch (error) {
      handleDatabaseError(res, error, 'atualizar status da solicitação');
    }
  },

  // ========================================================================
  // 4. EXCLUIR (DELETE /api/service-requests/:id)
  // ========================================================================
  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      await models.service_requests.destroy({ where: { request_id: id } });
      res.json({ message: 'Solicitação excluída' });
    } catch (error) {
      handleDatabaseError(res, error, 'excluir solicitação');
    }
  },

// ========================================================================
// 5. LISTAR SOLICITAÇÕES PARA GESTOR (GET /api/service-requests/manager)
// ========================================================================
async listManagerRequests(req, res) {
  try {
    const { areas } = req.query; // áreas do gestor: 'norte,centro'
    const managerId = req.user.id;
    const userRole = req.user.role_key;

    if (!['manager', 'admin'].includes(userRole)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const areasArray = areas ? areas.split(',') : [];
    
    const whereClause = {
      status_key: {
        [Op.in]: ['pending', 'urgent', 'delegated', 'approved', 'in-progress']
      }
    };

    // Gestor vê apenas solicitações de suas áreas
    if (userRole === 'manager' && areasArray.length > 0) {
      whereClause[Op.or] = [
        // Solicitações da área do gestor
        { '$branch.area_id$': { [Op.in]: areasArray } },
        // Solicitações delegadas especificamente para este gestor
        { 
          assigned_manager_user_id: managerId,
          status_key: 'delegated'
        }
      ];
    }

    const requests = await models.service_requests.findAll({
      where: whereClause,
      include: [
        { 
          model: models.companies, 
          as: 'company',
          attributes: ['company_id', 'name', 'cnpj']
        },
        { 
          model: models.client_branches, 
          as: 'branch',
          attributes: ['branch_id', 'name', 'address_reference', 'area_id'],
          include: [{
            model: models.areas,
            as: 'area',
            attributes: ['area_id', 'name']
          }]
        },
        { 
          model: models.service_catalog, 
          as: 'service_catalog',
          attributes: ['service_catalog_id', 'name', 'price']
        },
        {
          model: models.users,
          as: 'requester',
          attributes: ['user_id', 'full_name']
        },
        {
          model: models.scheduled_services,
          as: 'scheduled_services',
          attributes: ['scheduled_service_id', 'scheduled_date', 'notes', 'status_key']
        }
      ],
      order: [
        ['priority_key', 'DESC'], // Urgentes primeiro
        ['desired_date', 'ASC']
      ]
    });

    return res.json(requests);

  } catch (error) {
    handleDatabaseError(res, error, 'listar solicitações do gestor');
  }
}
};