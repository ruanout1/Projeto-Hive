const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../database/connection'); // Para transações
const User = require('../models/User');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const Collaborator = require('../models/Collaborator');
const Client = require('../models/Client');
const { handleDatabaseError } = require('../utils/errorHandling');

// =====================================
// FUNÇÕES DE CRUD (ADMIN)
// =====================================

// GET /api/users (Lê todos os usuários)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'full_name', 'email', 'user_type', 'is_active', 'created_at'],
      include: [
        {
          model: Collaborator,
          as: 'collaboratorDetails',
          attributes: ['position', 'hire_date']
        },
        {
          model: Client,
          as: 'clientDetails',
          attributes: ['main_company_name', 'main_cnpj']
        }
      ],
      order: [['full_name', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar todos os usuários');
  }
};

// GET /api/users/:id (Lê um usuário)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['user_id', 'full_name', 'email', 'user_type', 'is_active', 'phone', 'avatar_url', 'created_at'],
      include: [
        {
          model: Collaborator,
          as: 'collaboratorDetails'
        },
        {
          model: Client,
          as: 'clientDetails'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar usuário por ID');
  }
};

// POST /api/users (Cria um novo usuário)
exports.createUser = async (req, res) => {
  // 'userData' contém: full_name, email, password, user_type
  // 'detailsData' contém: { position, hire_date } (se for colaborador)
  //                      ou { main_company_name, main_cnpj } (se for cliente)
  const { userData, detailsData } = req.body;

  if (!userData || !userData.email || !userData.password || !userData.full_name || !userData.user_type) {
    return res.status(400).json({ message: 'Dados do usuário (email, senha, nome, tipo) são obrigatórios.' });
  }

  const t = await sequelize.transaction(); // Inicia a transação

  try {
    // 1. Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    // 2. Cria o usuário principal
    const newUser = await User.create({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: password_hash,
      user_type: userData.user_type,
      is_active: true
    }, { transaction: t });

    // 3. Cria o registro associado (Colaborador ou Cliente)
    if (userData.user_type === 'collaborator') {
      await Collaborator.create({
        user_id: newUser.user_id,
        position: detailsData?.position || 'Não definido',
        hire_date: detailsData?.hire_date || new Date()
        // ... (outros campos de detailsData)
      }, { transaction: t });

    } else if (userData.user_type === 'client') {
      if (!detailsData?.main_company_name || !detailsData?.main_cnpj) {
        // Se for cliente, esses campos são essenciais
        throw new Error('Nome da Empresa e CNPJ são obrigatórios para criar um cliente.');
      }
      await Client.create({
        user_id: newUser.user_id,
        main_company_name: detailsData.main_company_name,
        main_cnpj: detailsData.main_cnpj
        // ... (outros campos de detailsData)
      }, { transaction: t });
    }
    // (Tipos 'admin' ou 'manager' não precisam de tabela extra)

    // 4. Se tudo deu certo, commita a transação
    await t.commit();
    
    // Retorna o usuário criado (sem a senha)
    const result = newUser.toJSON();
    delete result.password_hash;
    res.status(201).json(result);

  } catch (error) {
    // 5. Se algo deu errado, desfaz tudo
    await t.rollback();
    handleDatabaseError(res, error, 'criar usuário');
  }
};

// PUT /api/users/:id (Atualiza um usuário)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  // 'userData' (full_name, email, is_active)
  // 'detailsData' (position, main_company_name, etc.)
  const { userData, detailsData } = req.body;

  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(id);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // 1. Atualiza o User
    await user.update(userData, { transaction: t });

    // 2. Atualiza os detalhes (Collaborator ou Client)
    if (user.user_type === 'collaborator') {
      const collaborator = await Collaborator.findOne({ where: { user_id: id } });
      if (collaborator) {
        await collaborator.update(detailsData, { transaction: t });
      }
    } else if (user.user_type === 'client') {
      const client = await Client.findOne({ where: { user_id: id } });
      if (client) {
        await client.update(detailsData, { transaction: t });
      }
    }

    await t.commit();
    res.status(200).json({ message: 'Usuário atualizado com sucesso.' });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar usuário');
  }
};

// PUT /api/users/:id/status (Ativa/Desativa um usuário)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Inverte o status atual
    const newStatus = !user.is_active;
    await user.update({ is_active: newStatus });

    res.status(200).json({ 
      message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      newStatus: newStatus
    });
  } catch (error) {
    handleDatabaseError(res, error, 'alterar status do usuário');
  }
};


// =====================================
// FUNÇÕES AUXILIARES (Usado pelo Admin e Gestor)
// =====================================

// GET /api/users/managers (Lista gestores disponíveis para equipes)
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

// GET /api/users/staff (Lista colaboradores disponíveis para equipes)
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

// =====================================
// FUNÇÕES AUXILIARES PARA GESTOR
// =====================================

// GET /api/users/list/my-staff (Usado na tela de Alocações)
exports.getManagerStaffList = async (req, res) => {
  try {
    const managerId = req.user.id;

    // 1. Encontra as equipes do gestor
    const managerTeams = await Team.findAll({
      where: { manager_user_id: managerId },
      attributes: ['team_id', 'name'] // Pega o nome da equipe
    });

    if (managerTeams.length === 0) {
      return res.status(200).json([]); // Gestor sem equipes
    }

    const teamIds = managerTeams.map(t => t.team_id);
    const teamIdToNameMap = new Map(managerTeams.map(t => [t.team_id, t.name]));

    // 2. Encontra todos os membros (TeamMember)
    const teamMembers = await TeamMember.findAll({
      where: { team_id: { [Op.in]: teamIds } },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'full_name'],
          where: { user_type: 'collaborator', is_active: true },
          // CORREÇÃO (Mismatch 3): Inclui 'collaboratorDetails'
          include: [{
            model: Collaborator,
            as: 'collaboratorDetails',
            attributes: ['position'], // Pega o CARGO
            required: false // Left join
          }]
        }
      ]
    });

    // 3. Formata a lista para o frontend
    const formattedCollaborators = teamMembers.map(member => {
      const user = member.user;
      return {
        id: user.user_id,
        name: user.full_name,
        // Pega o cargo (position) do 'collaboratorDetails'
        position: user.collaboratorDetails?.position || 'Colaborador',
        team: teamIdToNameMap.get(member.team_id) || 'Equipe',
        available: true // TODO: Implementar lógica de disponibilidade
      };
    });

    res.status(200).json(formattedCollaborators);

  } catch (error) {
    handleDatabaseError(res, error, 'buscar lista de colaboradores da equipe');
  }
};