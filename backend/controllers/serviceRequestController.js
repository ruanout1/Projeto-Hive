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
            attributes: ['service_catalog_id', 'name', 'price', 'description']
          },
          {
            model: models.users,
            as: 'requester_user',
            attributes: ['user_id', 'full_name']
          },
          {
            model: models.client_branches,
            as: 'branch',
            attributes: ['branch_id', 'name', 'street', 'number', 'neighborhood', 'city', 'state', 'area']
          }
        ],
        attributes: [
          'service_request_id',
          'request_number',
          'title',
          'description',
          'desired_date',
          'desired_time',
          'priority_key',
          'status_key',
          'address_reference',
          'created_at',
          'updated_at'
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
      const { service_catalog_id, description, priority, preferred_date, branch_id } = req.body;
      const requesterId = req.user.id;
      const userRole = req.user.role_key;

      // 1. ✅ GERAR request_number automaticamente (formato: REQ-YYYYMMDD-XXXXX)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      const timeStr = now.getTime().toString().slice(-5); // Últimos 5 dígitos do timestamp
      const request_number = `REQ-${dateStr}-${timeStr}`;

      // 2. ✅ DEDUZIR requester_type baseado no role do usuário
      const requesterTypeMap = {
        'client': 'client_user',
        'admin': 'admin',
        'manager': 'manager',
        'collaborator': 'collaborator'
      };
      const requester_type = requesterTypeMap[userRole] || 'client_user';

      // 3. ✅ BUSCAR company_id se o usuário for cliente
      let company_id = req.body.company_id;
      if (userRole === 'client' && !company_id) {
        const clientUser = await models.client_users.findOne({
          where: { user_id: requesterId }
        });
        if (clientUser) {
          company_id = clientUser.company_id;
        }
      }

      // 4. ✅ BUSCAR título do serviço na tabela service_catalog
      let title = req.body.title;
      if (!title && service_catalog_id) {
        const service = await models.service_catalog.findByPk(service_catalog_id);
        if (service) {
          title = service.name;
        }
      }

      // Se ainda não tem título, usar um fallback
      if (!title) {
        title = 'Solicitação de Serviço';
      }

      // 5. ✅ NORMALIZAR priority_key (converter valores do frontend para valores do banco)
      const priorityMap = {
        'urgente': 'urgent',
        'rotina': 'low',
        'baixa': 'low',
        'média': 'medium',
        'alta': 'high',
        // Valores já corretos do banco
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'urgent': 'urgent'
      };

      const normalizedPriority = priorityMap[priority?.toLowerCase()] || 'low';

      // 6. ✅ VALIDAR que priority_key está nos valores aceitos pelo banco
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const priority_key = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'low';

      // 7. ✅ VALIDAR status_key (garantir que seja um valor válido)
      const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected'];
      const status_key = validStatuses.includes(req.body.status?.toLowerCase()) ? req.body.status.toLowerCase() : 'pending';

      // 8. ✅ CRIAR a solicitação com todos os campos obrigatórios e validados
      const newRequest = await models.service_requests.create({
        request_number,           // ✅ Gerado automaticamente
        requester_type,           // ✅ Deduzido do role
        title,                    // ✅ Buscado do catálogo ou fallback
        company_id,
        branch_id,
        service_catalog_id,
        requester_user_id: requesterId,
        description,
        priority_key,             // ✅ Normalizado e validado
        desired_date: preferred_date,
        status_key                // ✅ Validado (sempre 'pending' para novas solicitações)
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