const { Op, Sequelize } = require('sequelize');
const {
  Company,
  User,
  ServiceRequest,
  ClientBranch,
  Area,
  ClientUser
} = require('../database/db');

// Helper para erros de banco (se não existir, vamos criar inline)
const handleDatabaseError = (res, error, action) => {
  console.error(`Erro ao ${action}:`, error);
  return res.status(500).json({
    message: `Erro ao ${action}`,
    error: error.message
  });
};

// =====================================
// FUNÇÕES DE CLIENTES (PARA GESTOR E ADMIN)
// =====================================

// Estatísticas de clientes
exports.getClientsStats = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const clientWhere = {};
    const revenueWhere = { status: 'completed' };

    // Se for gestor, filtra por clientes da sua área (via ClientBranch)
    if (loggedInUser.role_key === 'manager') {
      const managerAreaId = req.user.area_id; // Vem do middleware 'protect'
      clientWhere.area_id = managerAreaId; // Assumindo que a área está em ClientBranch
      revenueWhere['$company.client_branches.area_id$'] = managerAreaId;
    }

    const counts = await Company.findAll({
      attributes: [
        'is_active',
        [Sequelize.fn('COUNT', Sequelize.col('companies.company_id')), 'count'],
      ],
      include: [{
        model: ClientBranch,
        as: 'client_branches',
        attributes: [],
        where: clientWhere, // Aplica o filtro de área aqui
      }],
      group: ['companies.is_active'],
    });

    const stats = counts.reduce((acc, item) => {
      const statusKey = item.is_active ? 'active' : 'inactive';
      acc[statusKey] = Number(item.get('count'));
      return acc;
    }, {});

    const totalRevenue = await ServiceRequest.sum('total_value', { // Verifique se 'total_value' existe em ServiceRequest
      where: revenueWhere,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: [],
          include: [{
            model: ClientBranch,
            as: 'client_branches',
            attributes: [],
          }]
        },
      ],
    });

    const result = {
      total: (stats.active || 0) + (stats.inactive || 0),
      active: stats.active || 0,
      inactive: stats.inactive || 0,
      totalRevenue: totalRevenue || 0,
    };

    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de clientes');
  }
};

// Listar clientes (com paginação e filtros)
exports.getClients = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, page = 1, limit = 10, search } = req.query;

    const whereCondition = {};
    const includeWhere = {};

    // Se for gestor, filtra por área via ClientBranch
    if (loggedInUser.role_key === 'manager') {
      includeWhere.area_id = loggedInUser.area_id;
    }

    // Filtro por status
    if (status && status !== 'all') {
      whereCondition.is_active = (status === 'active');
    }

    // Filtro por busca
    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cnpj: { [Op.like]: `%${search}%` } },
        { '$client_users.user.full_name$': { [Op.like]: `%${search}%` } },
        { '$client_users.user.email$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: clients } = await Company.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: ClientUser,
          as: 'client_users',
          include: [{
            model: User,
            as: 'user',
            attributes: ['full_name', 'email', 'phone']
          }]
        },
        {
          model: ClientBranch,
          as: 'client_branches',
          where: includeWhere, // Filtra pela área do gestor
          required: (loggedInUser.role_key === 'manager'), // Garante que só venham clientes da área
          include: [{ model: Area, as: 'area', attributes: ['name'] }]
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
      subQuery: false // Necessário para 'search' em 'include' funcionar
    });

    const clientsWithStats = clients.map((client) => {
      const primaryUser = client.client_users?.find(cu => cu.is_primary_contact) || client.client_users?.[0];
      // TODO: Lógica de stats (activeServices, etc.) precisa de include de ServiceRequest
      return {
        id: client.company_id,
        name: client.name,
        cnpj: client.cnpj,
        email: primaryUser?.user?.email,
        phone: primaryUser?.user?.phone,
        area: client.client_branches?.[0]?.area?.name || 'Sem área',
        status: client.is_active ? 'active' : 'inactive',
        // ... stats mockados por enquanto
        servicesActive: 0,
        servicesCompleted: 0,
        lastService: '-',
        rating: 0,
        totalValue: 'R$ 0,00',
        notes: client.notes,
        createdAt: client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '-',
      };
    });

    res.json({
      clients: formattedData,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });

  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes');
  }
};

// ========================================================================
// 2. DETALHES DO CLIENTE (GET /api/clients/:id)
// ========================================================================
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    const whereCondition = { company_id: id };
    const includeWhere = {};

    // Se for gestor, só pode ver cliente da sua área
    if (loggedInUser.role_key === 'manager') {
      includeWhere.area_id = loggedInUser.area_id;
    }

    const client = await Company.findOne({
      where: whereCondition,
      include: [
        {
          model: ClientUser,
          as: 'client_users',
          include: [{
            model: User,
            as: 'user',
            attributes: ['full_name', 'email', 'phone']
          }]
        },
        {
          model: ClientBranch,
          as: 'client_branches',
          where: includeWhere,
          required: (loggedInUser.role_key === 'manager'),
          include: [{ model: Area, as: 'area' }]
        }
      ]
    });

    if (!company) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const primaryUser = client.client_users?.find(cu => cu.is_primary_contact) || client.client_users?.[0];

    const formattedClient = {
      id: client.company_id,
      name: client.name,
      legal_name: client.legal_name,
      cnpj: client.cnpj,
      email: primaryUser?.user?.email,
      phone: primaryUser?.user?.phone,
      branches: client.client_branches,
      notes: client.notes,
      is_active: client.is_active
    };

    res.status(200).json(formattedClient);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar detalhes do cliente');
  }
};

// ========================================================================
// 3. CRIAR CLIENTE (POST /api/clients) - VERSÃO FINAL COM NOTES E ÁREA
// ========================================================================
exports.createClient = async (req, res) => {
  // TODO: Esta lógica precisa ser revista. O admin/gestor cria o *usuário* e o *cliente* ao mesmo tempo?
  try {
    const loggedInUser = req.user;
    const { name, cnpj, email} = req.body; // Supondo que o formulário envia tudo

    let clientAreaId;
    if (loggedInUser.role_key === 'manager') {
      clientAreaId = loggedInUser.area_id; // Gestor SÓ pode criar na sua área
    } else {
      clientAreaId = req.body.area_id; // Admin DEVE especificar a área
      if (!clientAreaId) {
        return res.status(400).json({
          error: 'Administradores devem especificar uma "area_id" ao criar um cliente.',
        });
      }
    }
    // ... (Lógica de criar User, Company e ClientUser em uma transação) ...
    res.status(201).json({ message: 'Cliente criado com sucesso' });
  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'criar cliente');
  }
};

// ========================================================================
// 4. ATUALIZAR CLIENTE (PUT /api/clients/:id)
// Atualiza Empresa + Obs + Área + Endereço Principal + FILIAIS (Loop Inteligente)
// ========================================================================
exports.updateClient = async (req, res) => {
  // ... (Lógica de PUT) ...
};

// Ativar/desativar cliente
exports.toggleClientStatus = async (req, res) => {
  // ... (Lógica de PUT) ...
};

// =====================================
// FUNÇÃO AUXILIAR (A CAUSA DO ERRO)
// =====================================

// GET /api/clients/list/my-area
exports.getManagerClientsList = async (req, res) => {
  try {
    const managerAreaId = req.user.area_id; // Vem do middleware 'protect'

    if (!managerAreaId) {
      return res.status(400).json({ message: 'Gestor não tem área associada.' });
    }

    const clients = await Company.findAll({
      attributes: ['company_id', 'name'],
      include: [
        {
          model: ClientBranch,
          as: 'client_branches',
          attributes: [],
          where: { area_id: managerAreaId },
          required: true,
          include: [
            {
              model: Area,
              as: 'area',
              attributes: ['name']
            }
          ]
        }
      ],
      where: { is_active: true },
      order: [['name', 'ASC']],
      group: ['companies.company_id']
    });

    const formattedClients = clients.map(client => {
      const areaName = client.client_branches?.[0]?.area?.name || `Área ID ${managerAreaId}`;
      return {
        id: client.company_id,
        name: client.name,
        area: areaName
      };
    });

    res.status(200).json(formattedClients);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar lista de clientes da área');
  }
};

// =====================================
// FUNÇÕES DE LOCALIZAÇÃO (Unidades)
// =====================================

// POST /api/clients/:id/locations
exports.addClientLocation = async (req, res) => {
  const { id } = req.params; // company_id
  const loggedInUser = req.user;
  const { nickname, street, area_id, number, complement, neighborhood, city, state, zip_code } = req.body;

  try {
    const findWhere = { company_id: id };
    if (loggedInUser.role_key === 'manager') {
      // Um gestor SÓ pode adicionar localizações a clientes da sua área.
      // Esta é uma checagem de segurança extra.
      const client = await Company.findOne({
        where: findWhere,
        include: [{
          model: ClientBranch,
          as: 'client_branches',
          where: { area_id: loggedInUser.area_id },
          required: true
        }]
      });
      if (!client) {
        return res.status(404).json({ message: 'Cliente não encontrado na sua área.' });
      }
    }

    // Cria a nova filial/unidade
    const newBranch = await ClientBranch.create({
      company_id: id,
      name: nickname || street, // name é obrigatório
      nickname: nickname,
      street: street,
      number: number,
      complement: complement,
      neighborhood: neighborhood,
      city: city,
      state: state,
      zip_code: zip_code,
      area_id: area_id || loggedInUser.area_id, // Usa a área do form, ou a área do gestor
      is_active: true
    });

    res.status(201).json(newBranch);
  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar cliente');
  }
};

// PUT /api/clients/:id/locations/:locationId
exports.updateClientLocation = async (req, res) => {
  const { id, locationId } = req.params; // company_id, branch_id
  const loggedInUser = req.user;
  const updateData = req.body;

  try {
    // Acha a filial/unidade
    const branch = await ClientBranch.findOne({
      where: {
        branch_id: locationId,
        company_id: id
      }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Localização não encontrada.' });
    }

    // Se for gestor, checa se tem permissão (se a filial é da sua área)
    if (loggedInUser.role_key === 'manager') {
      if (branch.area_id !== loggedInUser.area_id) {
         return res.status(403).json({ message: 'Você não tem permissão para editar esta localização.' });
      }
      // Garante que o gestor não possa mover a localização para OUTRA área
      updateData.area_id = loggedInUser.area_id;
    }

    await branch.update(updateData);
    res.status(200).json(branch);

  } catch (error) {
    handleDatabaseError(res, error, 'adicionar local');
  }
};

// DELETE /api/clients/:id/locations/:locationId
exports.removeClientLocation = async (req, res) => {
  const { id, locationId } = req.params; // company_id, branch_id
  const loggedInUser = req.user;

  try {
    const branch = await ClientBranch.findOne({
      where: {
        branch_id: locationId,
        company_id: id
      }
    });

    if (!branch) {
      return res.status(404).json({ message: 'Localização não encontrada.' });
    }

    // Se for gestor, checa se tem permissão
    if (loggedInUser.role_key === 'manager') {
      if (branch.area_id !== loggedInUser.area_id) {
         return res.status(403).json({ message: 'Você não tem permissão para excluir esta localização.' });
      }
    }

    // TODO: Checar se a localização está em uso em 'service_requests' antes de deletar

    await branch.destroy();
    res.status(200).json({ message: 'Localização removida com sucesso.' });

  } catch (error) {
    handleDatabaseError(res, error, 'alterar status cliente');
  }
};