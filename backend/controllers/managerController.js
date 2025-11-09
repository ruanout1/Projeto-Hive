const { Sequelize, Op } = require('sequelize');
const sequelize = require('../database/connection'); // Para transações

// Importação de Models
const User = require('../models/User');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const ServiceCategory = require('../models/ServiceCategory');
const ServiceCatalog = require('../models/ServiceCatalog');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');

// Mapeamento de Status (Banco -> Frontend)
const statusMap = {
  pending: 'pendente',
  assigned: 'agendado', 
  in_progress: 'em-andamento',
  completed: 'concluido',
  cancelled: 'cancelado',
};

// =====================================
// HELPER: Tratamento de Erros
// =====================================
const handleDatabaseError = (res, error, operation) => {
  console.error(`Erro ao ${operation}:`, error);

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.fields ? Object.keys(error.fields)[0] : 'dados';
    const value = error.fields ? error.fields[field] : 'desconhecido';
    return res.status(400).json({ message: `Já existe um registro com ${field} = ${value}.` });
  }
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Erro de referência: um dos IDs fornecidos não existe.' });
  }
  
  res.status(500).json({ message: `Erro ao ${operation}.` });
};


// =====================================
// FUNÇÕES DO DASHBOARD
// =====================================
// (exports.getDashboardStats e getActiveRequests permanecem iguais)
exports.getDashboardStats = async (req, res) => {
  try {
    const counts = await ServiceRequest.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      group: ['status'],
    });

    // Formata para o frontend (ex: "pending" vira "pendente")
    const stats = counts.reduce((acc, item) => {
      const frontendStatus = statusMap[item.status] || item.status;
      acc[frontendStatus] = Number(item.get('count'));
      return acc;
    }, {});

    // Garante que todos os status esperados existam, mesmo que sejam 0
    const allStatuses = {
      'pendente': 0,
      'agendado': 0,
      'em-andamento': 0,
      'concluido': 0,
      'cancelado': 0,
      ...stats // Sobrescreve com os valores reais
    };

    res.status(200).json(allStatuses);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas');
  }
};

exports.getActiveRequests = async (req, res) => {
  try {
    const activeRequests = await ServiceRequest.findAll({
      where: {
        status: {
          [Op.notIn]: ['completed', 'cancelled'], // Busca serviços que não estão finalizados
        },
      },
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['user_id'], // Pega o client
          include: [{ model: User, as: 'user', attributes: ['full_name'] }] // Pega o nome do usuário do cliente
        },
        {
          model: Team,
          as: 'assignedTeam', // Busca a equipe assignada
          attributes: ['name']
        }
      ],
      order: [['desired_date', 'ASC']],
      limit: 10,
    });

    // Formata a resposta para o frontend
    const formattedRequests = activeRequests.map((req) => ({
      id: req.request_number,
      cliente: req.client?.user?.full_name || 'Cliente não encontrado',
      servico: req.title,
      equipe: req.assignedTeam?.name || 'Não assignada',
      status: statusMap[req.status] || req.status,
      prazo: new Date(req.desired_date).toLocaleDateString('pt-BR'),
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar serviços ativos');
  }
};


// =====================================
// FUNÇÕES DO CATÁLOGO DE SERVIÇOS
// =====================================

// GET /api/manager/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.findAll({
      order: [['name', 'ASC']],
      attributes: [
        ['category_id', 'id'], // Renomeia category_id para id
        'name',
        'color'
      ]
    });
    res.status(200).json(categories);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar categorias');
  }
};

// POST /api/manager/categories
exports.createCategory = async (req, res) => {
  const { name, color } = req.body;
  try {
    const newCategory = await ServiceCategory.create({ name, color });
    // Formata a resposta para bater com o frontend
    const response = {
      id: newCategory.category_id,
      name: newCategory.name,
      color: newCategory.color
    };
    res.status(201).json(response);
  } catch (error) {
    handleDatabaseError(res, error, 'criar categoria');
  }
};

// GET /api/manager/catalog
exports.getAllCatalogServices = async (req, res) => {
  try {
    const services = await ServiceCatalog.findAll({
      include: [{
        model: ServiceCategory,
        as: 'category', 
        attributes: [['category_id', 'id'], 'name', 'color']
      }],
      order: [['name', 'ASC']],
      // --- CORREÇÃO AQUI ---
      // Trocado 'is_active' por 'status'
      attributes: [
        ['service_catalog_id', 'id'],
        'name',
        'description',
        'price',
        'duration_value',
        'duration_type',
        'status', // Não precisa mais renomear ['is_active', 'status']
        'created_at'
      ]
    });
    
    // --- CORREÇÃO AQUI ---
    // O mapeamento de true/false para 'active'/'inactive' não é mais necessário
    // O banco já retorna os dados corretos.
    const formattedServices = services.map((service) => service.get({ plain: true }));

    res.status(200).json(formattedServices);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar catálogo de serviços');
  }
};

// POST /api/manager/catalog
exports.createCatalogService = async (req, res) => {
  const { name, description, category_id, price, duration_value, duration_type } = req.body;
  
  if (!name || !category_id || !price || !duration_value || !duration_type) {
    return res.status(400).json({ message: "Campos obrigatórios faltando." });
  }

  try {
    // --- CORREÇÃO AQUI ---
    const newService = await ServiceCatalog.create({
      name,
      description,
      category_id,
      price,
      duration_value,
      duration_type,
      status: 'active' // --- Corrigido de 'is_active: true' ---
    });
    res.status(201).json(newService);
  } catch (error) {
    handleDatabaseError(res, error, 'criar serviço no catálogo');
  }
};

// PUT /api/manager/catalog/:id
exports.updateCatalogService = async (req, res) => {
  const { id } = req.params;
  const { name, description, category_id, price, duration_value, duration_type } = req.body;

  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    await service.update({
      name,
      description,
      category_id,
      price,
      duration_value,
      duration_type
    });
    
    res.status(200).json({ message: "Serviço atualizado com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar serviço');
  }
};

// PUT /api/manager/catalog/:id/status
exports.updateCatalogServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Espera 'active' ou 'inactive'

  if (status === undefined) {
    return res.status(400).json({ message: "Status é obrigatório." });
  }

  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    // --- CORREÇÃO AQUI ---
    // O banco agora espera 'active' ou 'inactive', não true/false
    await service.update({ status: status }); 
    
    res.status(200).json({ message: "Status do serviço atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status do serviço');
  }
};

// DELETE /api/manager/catalog/:id
exports.deleteCatalogService = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await ServiceCatalog.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado." });
    }

    await service.destroy();
    res.status(200).json({ message: "Serviço excluído com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir serviço');
  }
};


// ==========================================================
// FUNÇÕES - GERENCIAMENTO DE EQUIPES (TeamManagement)
// ==========================================================

// GET /api/manager/users/managers (Lista gestores disponíveis)
exports.getAvailableManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: {
        user_type: 'manager', 
        is_active: true
      },
      attributes: ['user_id', 'full_name', 'email']
    });
    res.status(200).json(managers);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar gestores');
  }
};

// GET /api/manager/users/staff (Lista colaboradores disponíveis)
exports.getAvailableStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        user_type: 'collaborator', 
        is_active: true
      },
      attributes: ['user_id', 'full_name', 'email']
    });
    res.status(200).json(staff);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar colaboradores');
  }
};

// GET /api/manager/teams
// GET /api/manager/teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      attributes: [
        ['team_id', 'id'],
        'name',
        ['is_active', 'status'], 
        'created_at', // ✅ GARANTIR QUE ESTÁ INCLUÍDO
        'updated_at'
      ],
      include: [
        {
          model: User,
          as: 'manager', 
          attributes: [['user_id', 'id'], ['full_name', 'name'], 'email']
        },
        {
          model: User,
          as: 'members', 
          attributes: [['user_id', 'id'], ['full_name', 'name'], 'email'],
          through: { attributes: [] } 
        }
      ],
      order: [['name', 'ASC']]
    });

    // Formata o status para 'active'/'inactive'
    const formattedTeams = teams.map((team) => {
      const plainTeam = team.get({ plain: true });
      return {
        ...plainTeam,
        status: plainTeam.status ? 'active' : 'inactive',
        createdAt: plainTeam.created_at, // ✅ GARANTIR QUE ESTÁ SENDO MAPEADO
        manager: plainTeam.manager ? { ...plainTeam.manager, role: 'gestor' } : null,
        members: plainTeam.members.map((m) => ({ ...m, role: 'colaborador' }))
      };
    });

    res.status(200).json(formattedTeams);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar equipes');
  }
};

// POST /api/manager/teams
exports.createTeam = async (req, res) => {
  const { name, managerId, memberIds } = req.body;
  
  if (!name || !managerId) {
    return res.status(400).json({ message: "Nome e Gestor são obrigatórios." });
  }

  const t = await sequelize.transaction(); 

  try {
    // 1. Cria a equipe
    const newTeam = await Team.create({
      name,
      manager_user_id: managerId,
      is_active: true
    }, { transaction: t });

    // 2. Associa os membros (se houver)
    if (memberIds && memberIds.length > 0) {
      const membersData = memberIds.map((userId) => ({
        team_id: newTeam.team_id,
        user_id: userId // <-- Usa a 'key' do model ('user_id')
      }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    // 3. Se tudo deu certo, commita a transação
    await t.commit();
    
    // 4. Busca a equipe recém-criada (com os includes) para retornar ao frontend
    const createdTeam = await Team.findByPk(newTeam.team_id, {
      attributes: [['team_id', 'id'], 'name', ['is_active', 'status'], 'created_at'],
      include: [
        { model: User, as: 'manager', attributes: [['user_id', 'id'], ['full_name', 'name'], 'email'] },
        { model: User, as: 'members', attributes: [['user_id', 'id'], ['full_name', 'name'], 'email'], through: { attributes: [] } }
      ]
    });

    if (!createdTeam) {
      return res.status(404).json({ message: "Equipe criada, mas não pôde ser recuperada."});
    }

    const plainTeam = createdTeam.get({ plain: true });
    const formattedTeam = {
      ...plainTeam,
      status: plainTeam.status ? 'active' : 'inactive',
      manager: plainTeam.manager ? { ...plainTeam.manager, role: 'gestor' } : null,
      members: plainTeam.members.map((m) => ({ ...m, role: 'colaborador' }))
    };

    res.status(201).json(formattedTeam);

  } catch (error) {
    await t.rollback(); 
    handleDatabaseError(res, error, 'criar equipe');
  }
};

// PUT /api/manager/teams/:id
exports.updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name, managerId, memberIds } = req.body;

  if (!name || !managerId) {
    return res.status(400).json({ message: "Nome e Gestor são obrigatórios." });
  }

  const t = await sequelize.transaction();

  try {
    const team = await Team.findByPk(id);
    if (!team) {
      await t.rollback();
      return res.status(404).json({ message: "Equipe não encontrada." });
    }

    // 1. Atualiza os dados básicos da equipe
    await team.update({
      name,
      manager_user_id: managerId
    }, { transaction: t });

    // 2. Remove todos os membros antigos
    await TeamMember.destroy({
      where: { team_id: id },
      transaction: t
    });

    // 3. Adiciona os novos membros
    if (memberIds && memberIds.length > 0) {
      const membersData = memberIds.map((userId) => ({
        team_id: id,
        user_id: userId // <-- Usa a 'key' do model ('user_id')
      }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: "Equipe atualizada com sucesso." });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar equipe');
  }
};

// PUT /api/manager/teams/:id/status
exports.updateTeamStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Espera 'active' ou 'inactive'

  if (status === undefined) {
    return res.status(400).json({ message: "Status é obrigatório." });
  }

  try {
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada." });
    }

    // --- CORREÇÃO AQUI ---
    await team.update({ is_active: status === 'active' });
    res.status(200).json({ message: "Status da equipe atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status da equipe');
  }
};

// DELETE /api/manager/teams/:id
exports.deleteTeam = async (req, res) => {
  const { id } = req.params;
  try {
    const team = await Team.findByPk(id);
    if (!team) {
      return res.status(404).json({ message: "Equipe não encontrada." });
    }

    await team.destroy();
    res.status(200).json({ message: "Equipe excluída com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir equipe');
  }
};

// =====================================
// NOVAS FUNÇÕES PARA CATEGORIAS - EDIÇÃO E EXCLUSÃO
// =====================================

// PUT /api/manager/categories/:id
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nome da categoria é obrigatório." });
  }

  try {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    await category.update({
      name,
      color: color || category.color // Mantém a cor atual se não for fornecida
    });

    // Formata a resposta para o frontend
    const response = {
      id: category.category_id,
      name: category.name,
      color: category.color
    };

    res.status(200).json(response);
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar categoria');
  }
};

// DELETE /api/manager/categories/:id
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  
  try {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    // Verifica se existem serviços usando esta categoria
    const servicesUsingCategory = await ServiceCatalog.count({
      where: { category_id: id }
    });

    if (servicesUsingCategory > 0) {
      return res.status(400).json({ 
        message: "Não é possível excluir esta categoria pois existem serviços vinculados a ela.",
        servicesCount: servicesUsingCategory
      });
    }

    await category.destroy();
    res.status(200).json({ message: "Categoria excluída com sucesso." });
  } catch (error) {
    handleDatabaseError(res, error, 'excluir categoria');
  }
};

