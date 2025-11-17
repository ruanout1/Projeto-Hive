const { Op, Sequelize } = require('sequelize');
const Client = require('../models/Client');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const ClientAddress = require('../models/ClientAddress');
const Area = require('../models/Area');
const { handleDatabaseError } = require('../utils/errorHandling');

// =====================================
// FUNÇÕES DE CLIENTES (PARA GESTOR E ADMIN)
// =====================================

// Estatísticas de clientes
exports.getClientsStats = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const clientWhere = {};
    const revenueWhere = { status: 'completed' };

    // Se for gestor, filtra por clientes da sua área (via ClientAddress)
    if (loggedInUser.user_type === 'manager') {
      const managerAreaId = req.user.area_id; // Vem do middleware 'protect'
      clientWhere.area_id = managerAreaId; // Assumindo que a área está em ClientAddress
      revenueWhere['$client.addresses.area_id$'] = managerAreaId;
    }

    const counts = await Client.findAll({
      attributes: [
        'is_active',
        [Sequelize.fn('COUNT', Sequelize.col('client.client_id')), 'count'],
      ],
      include: [{
        model: ClientAddress,
        as: 'addresses',
        attributes: [],
        where: clientWhere, // Aplica o filtro de área aqui
      }],
      group: ['client.is_active'],
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
          model: Client,
          as: 'client',
          attributes: [],
          include: [{
            model: ClientAddress,
            as: 'addresses',
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

    // Se for gestor, filtra por área via ClientAddress
    if (loggedInUser.user_type === 'manager') {
      includeWhere.area_id = loggedInUser.area_id;
    }

    // Filtro por status
    if (status && status !== 'all') {
      whereCondition.is_active = (status === 'active');
    }

    // Filtro por busca
    if (search) {
      whereCondition[Op.or] = [
        { main_company_name: { [Op.like]: `%${search}%` } },
        { main_cnpj: { [Op.like]: `%${search}%` } },
        { '$user.full_name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'email', 'phone']
        },
        {
          model: ClientAddress,
          as: 'addresses',
          where: includeWhere, // Filtra pela área do gestor
          required: (loggedInUser.user_type === 'manager'), // Garante que só venham clientes da área
          include: [{ model: Area, as: 'area', attributes: ['name'] }]
        }
        // TODO: Adicionar include para ServiceRequest para estatísticas
      ],
      order: [['main_company_name', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true, 
      subQuery: false // Necessário para 'search' em 'include' funcionar
    });

    const clientsWithStats = clients.map((client) => {
      // TODO: Lógica de stats (activeServices, etc.) precisa de include de ServiceRequest
      return {
        id: client.client_id,
        name: client.main_company_name,
        cnpj: client.main_cnpj,
        email: client.user?.email,
        phone: client.user?.phone,
        area: client.addresses?.[0]?.area?.name || 'Sem área',
        status: client.is_active ? 'active' : 'inactive',
        // ... stats mockados por enquanto
        servicesActive: 0,
        servicesCompleted: 0,
        lastService: '-',
        rating: 0,
        totalValue: 'R$ 0,00',
        notes: client.notes,
        createdAt: client.created_at.toLocaleDateString('pt-BR'),
      };
    });

    res.status(200).json({
      clients: clientsWithStats,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar clientes');
  }
};

// Buscar cliente específico por ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    const whereCondition = { client_id: id };
    const includeWhere = {};
    
    // Se for gestor, só pode ver cliente da sua área
    if (loggedInUser.user_type === 'manager') {
      includeWhere.area_id = loggedInUser.area_id;
    }

    const client = await Client.findOne({
      where: whereCondition,
      include: [
        { model: User, as: 'user' },
        {
          model: ClientAddress,
          as: 'addresses',
          where: includeWhere,
          required: (loggedInUser.user_type === 'manager'),
          include: [{ model: Area, as: 'area' }]
        }
        // TODO: Adicionar include para ServiceRequest
      ]
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado ou você não tem permissão para acessá-lo',
      });
    }

    // ... Lógica de formatação (sem stats por enquanto) ...
    const formattedClient = {
      id: client.client_id,
      name: client.main_company_name,
      // ... (resto dos campos)
    };
    
    res.status(200).json(formattedClient);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar cliente por ID');
  }
};

// Criar novo cliente
exports.createClient = async (req, res) => {
  // TODO: Esta lógica precisa ser revista. O admin/gestor cria o *usuário* // e o *cliente* ao mesmo tempo?
  try {
    const loggedInUser = req.user;
    const { name, cnpj, email} = req.body; // Supondo que o formulário envia tudo

    let clientAreaId;
    if (loggedInUser.user_type === 'manager') {
      clientAreaId = loggedInUser.area_id; // Gestor SÓ pode criar na sua área
    } else {
      clientAreaId = req.body.area_id; // Admin DEVE especificar a área
      if (!clientAreaId) {
        return res.status(400).json({
          error: 'Administradores devem especificar uma "area_id" ao criar um cliente.',
        });
      }
    }
    // ... (Lógica de criar User e Client em uma transação) ...
    res.status(201).json({ message: 'Cliente criado com sucesso' });
  } catch (error) {
    handleDatabaseError(res, error, 'criar cliente');
  }
};

// Atualizar cliente
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

    const clients = await Client.findAll({
  attributes: ['client_id', 'main_company_name'],
  include: [
    {
      model: ClientAddress,
      as: 'addresses',
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
  order: [['main_company_name', 'ASC']],
  group: ['Client.client_id']
});

    
    // CORREÇÃO: Acessar a área através do endereço
    const formattedClients = clients.map(client => {
      const areaName = client.addresses?.[0]?.area?.name || `Área ID ${managerAreaId}`;
      return {
        id: client.client_id,
        name: client.main_company_name,
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
  const { id } = req.params; // client_id
  const loggedInUser = req.user;
  const { nickname, street, area_id, number, complement, neighborhood, city, state, zip_code } = req.body; // Pega os dados da nova localização

  try {
    const findWhere = { client_id: id };
    if (loggedInUser.user_type === 'manager') {
      // Um gestor SÓ pode adicionar localizações a clientes da sua área.
      // Esta é uma checagem de segurança extra.
      const client = await Client.findOne({ 
        where: findWhere,
        include: [{
          model: ClientAddress,
          as: 'addresses',
          where: { area_id: loggedInUser.area_id },
          required: true
        }]
      });
      if (!client) {
        return res.status(404).json({ message: 'Cliente não encontrado na sua área.' });
      }
    }
    
    // Cria o novo endereço
    const newAddress = await ClientAddress.create({
      client_id: id,
      nickname: nickname,
      street: street,
      area_id: area_id || loggedInUser.area_id, // Usa a área do form, ou a área do gestor
      // ... (outros campos de endereço: number, city, etc.)
    });

    res.status(201).json(newAddress);
  } catch (error) {
    handleDatabaseError(res, error, 'adicionar localização');
  }
};

// PUT /api/clients/:id/locations/:locationId
exports.updateClientLocation = async (req, res) => {
  const { id, locationId } = req.params; // client_id, address_id
  const loggedInUser = req.user;
  const updateData = req.body;

  try {
    // Acha o endereço
    const address = await ClientAddress.findOne({
      where: {
        address_id: locationId,
        client_id: id
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Localização não encontrada.' });
    }

    // Se for gestor, checa se tem permissão (se o endereço é da sua área)
    if (loggedInUser.user_type === 'manager') {
      if (address.area_id !== loggedInUser.area_id) {
         return res.status(403).json({ message: 'Você não tem permissão para editar esta localização.' });
      }
      // Garante que o gestor não possa mover a localização para OUTRA área
      updateData.area_id = loggedInUser.area_id;
    }

    await address.update(updateData);
    res.status(200).json(address);

  } catch (error) {
    handleDatabaseError(res, error, 'atualizar localização');
  }
};

// DELETE /api/clients/:id/locations/:locationId
exports.removeClientLocation = async (req, res) => {
  const { id, locationId } = req.params; // client_id, address_id
  const loggedInUser = req.user;

  try {
    const address = await ClientAddress.findOne({
      where: {
        address_id: locationId,
        client_id: id
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Localização não encontrada.' });
    }

    // Se for gestor, checa se tem permissão
    if (loggedInUser.user_type === 'manager') {
      if (address.area_id !== loggedInUser.area_id) {
         return res.status(403).json({ message: 'Você não tem permissão para excluir esta localização.' });
      }
    }

    // TODO: Checar se a localização está em uso em 'service_requests' antes de deletar
    
    await address.destroy();
    res.status(200).json({ message: 'Localização removida com sucesso.' });

  } catch (error) {
    handleDatabaseError(res, error, 'remover localização');
  }
};