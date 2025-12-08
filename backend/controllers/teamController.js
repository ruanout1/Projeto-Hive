const { Op } = require('sequelize');
const sequelize = require('../database/connection');
const Team = require('../models/Team');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const Area = require('../models/Area');

// ==========================================
// OBTER TODAS AS EQUIPES
// ==========================================
exports.getAllTeams = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {};

    // Se for gestor, vê apenas as equipes que ele gerencia
    // Se for admin, vê todas
    if (loggedInUser.role_key === 'manager') {
      whereCondition.manager_user_id = loggedInUser.user_id;
    }

    const teams = await Team.findAll({
      where: whereCondition,
      attributes: [
        'team_id',
        ['team_id', 'id'],
        'name',
        ['is_active', 'status'],
        'created_at',
        'updated_at'
      ],
      include: [
        {
          model: User,
          as: 'manager',
          attributes: [
            'user_id',
            ['user_id', 'id'],
            ['full_name', 'name'],
            'email'
          ],
          required: false
        },
        {
          model: User,
          as: 'members',
          attributes: [
            'user_id',
            ['user_id', 'id'],
            ['full_name', 'name'],
            'email'
          ],
          through: { attributes: [] },
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Formatar para o frontend
    const formattedTeams = teams.map(team => {
      const plainTeam = team.get({ plain: true });
      return {
        id: plainTeam.id,
        name: plainTeam.name,
        status: plainTeam.status ? 'active' : 'inactive',
        manager: plainTeam.manager ? {
          ...plainTeam.manager,
          role: 'gestor'
        } : null,
        members: (plainTeam.members || []).map(m => ({
          ...m,
          role: 'colaborador'
        })),
        createdAt: plainTeam.created_at,
        updatedAt: plainTeam.updated_at
      };
    });

    res.status(200).json({
      success: true,
      data: formattedTeams
    });

  } catch (error) {
    console.error('Erro ao buscar equipes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar equipes',
      error: error.message
    });
  }
};

// ==========================================
// OBTER EQUIPE POR ID
// ==========================================
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUser = req.user;

    const whereCondition = { team_id: id };

    // Se for gestor, verifica se a equipe é dele
    if (loggedInUser.role_key === 'manager') {
      whereCondition.manager_user_id = loggedInUser.user_id;
    }

    const team = await Team.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['user_id', ['user_id', 'id'], ['full_name', 'name'], 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['user_id', ['user_id', 'id'], ['full_name', 'name'], 'email'],
          through: { attributes: [] }
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada ou você não tem permissão para visualizá-la'
      });
    }

    const plainTeam = team.get({ plain: true });
    const formattedTeam = {
      id: plainTeam.team_id,
      name: plainTeam.name,
      status: plainTeam.is_active ? 'active' : 'inactive',
      manager: plainTeam.manager || null,
      members: plainTeam.members || [],
      createdAt: plainTeam.created_at,
      updatedAt: plainTeam.updated_at
    };

    res.json({
      success: true,
      data: formattedTeam
    });

  } catch (error) {
    console.error('Erro ao buscar equipe:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar equipe',
      error: error.message
    });
  }
};

// ==========================================
// CRIAR NOVA EQUIPE (Apenas Admin)
// ==========================================
exports.createTeam = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, managerId, memberIds } = req.body;

    // Validações
    if (!name || !managerId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nome da equipe e gestor são obrigatórios'
      });
    }

    // Verificar se o gestor existe e é realmente um gestor
    const manager = await User.findByPk(managerId, { transaction: t });
    if (!manager) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
    }

    if (manager.role_key !== 'manager') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'O usuário selecionado não é um gestor'
      });
    }

    // Verificar se já existe uma equipe com esse nome
    const existingTeam = await Team.findOne({
      where: { name },
      transaction: t
    });

    if (existingTeam) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'Já existe uma equipe com este nome'
      });
    }

    // Criar a equipe
    const newTeam = await Team.create({
      name,
      manager_user_id: managerId,
      is_active: true
    }, { transaction: t });

    // Adicionar membros (se houver)
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      const membersData = memberIds.map(userId => ({
        team_id: newTeam.team_id,
        user_id: userId // ✅ CORRETO: user_id
      }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    await t.commit();

    // Buscar a equipe recém-criada para retornar
    const createdTeam = await Team.findByPk(newTeam.team_id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['user_id', ['user_id', 'id'], ['full_name', 'name'], 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['user_id', ['user_id', 'id'], ['full_name', 'name'], 'email'],
          through: { attributes: [] }
        }
      ]
    });

    const plainTeam = createdTeam.get({ plain: true });
    const formattedTeam = {
      id: plainTeam.team_id,
      name: plainTeam.name,
      status: 'active',
      manager: plainTeam.manager,
      members: plainTeam.members || []
    };

    res.status(201).json({
      success: true,
      message: 'Equipe criada com sucesso',
      data: formattedTeam
    });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao criar equipe:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar equipe',
      error: error.message
    });
  }
};

// ==========================================
// ATUALIZAR EQUIPE (Apenas Admin)
// ==========================================
exports.updateTeam = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, managerId, memberIds } = req.body;

    // Verificar se a equipe existe
    const team = await Team.findByPk(id, { transaction: t });

    if (!team) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada'
      });
    }

    // Validações
    if (!name || !managerId) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nome da equipe e gestor são obrigatórios'
      });
    }

    // Verificar se o gestor existe
    const manager = await User.findByPk(managerId, { transaction: t });
    if (!manager) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Gestor não encontrado'
      });
    }

    if (manager.role_key !== 'manager') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'O usuário selecionado não é um gestor'
      });
    }

    // Verificar se outro time já tem esse nome
    const existingTeam = await Team.findOne({
      where: {
        name,
        team_id: { [Op.ne]: id }
      },
      transaction: t
    });

    if (existingTeam) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'Já existe outra equipe com este nome'
      });
    }

    // Atualizar a equipe
    await team.update({
      name,
      manager_user_id: managerId
    }, { transaction: t });

    // Atualizar membros
    // Remover todos os membros atuais
    await TeamMember.destroy({
      where: { team_id: id },
      transaction: t
    });

    // Adicionar novos membros (se houver)
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      const membersData = memberIds.map(userId => ({
        team_id: id,
        user_id: userId // ✅ CORRETO: user_id
      }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    await t.commit();

    res.json({
      success: true,
      message: 'Equipe atualizada com sucesso'
    });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao atualizar equipe:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar equipe',
      error: error.message
    });
  }
};

// ==========================================
// ATUALIZAR STATUS DA EQUIPE (Apenas Admin)
// ==========================================
exports.updateTeamStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' ou 'inactive'

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status é obrigatório'
      });
    }

    const team = await Team.findByPk(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada'
      });
    }

    await team.update({ is_active: status === 'active' });

    res.json({
      success: true,
      message: `Equipe ${status === 'active' ? 'ativada' : 'desativada'} com sucesso`
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status da equipe',
      error: error.message
    });
  }
};

// ==========================================
// DELETAR EQUIPE (Apenas Admin)
// ==========================================
exports.deleteTeam = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, { transaction: t });

    if (!team) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Equipe não encontrada'
      });
    }

    // Remover todos os membros da equipe
    await TeamMember.destroy({
      where: { team_id: id },
      transaction: t
    });

    // Deletar a equipe
    await team.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Equipe excluída com sucesso'
    });

  } catch (error) {
    await t.rollback();
    console.error('Erro ao deletar equipe:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar equipe',
      error: error.message
    });
  }
};

// ==========================================
// OBTER GESTORES DISPONÍVEIS
// ==========================================
exports.getAvailableManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: {
        role_key: 'manager',
        is_active: true
      },
      attributes: [
        'user_id',
        ['user_id', 'id'],
        ['full_name', 'name'],
        'email'
      ],
      order: [['full_name', 'ASC']]
    });

    res.json({
      success: true,
      data: managers
    });

  } catch (error) {
    console.error('Erro ao buscar gestores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar gestores disponíveis',
      error: error.message
    });
  }
};

// ==========================================
// OBTER COLABORADORES DISPONÍVEIS
// ==========================================
exports.getAvailableMembers = async (req, res) => {
  try {
    const members = await User.findAll({
      where: {
        role_key: 'collaborator',
        is_active: true
      },
      attributes: [
        'user_id',
        ['user_id', 'id'],
        ['full_name', 'name'],
        'email'
      ],
      order: [['full_name', 'ASC']]
    });

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar colaboradores disponíveis',
      error: error.message
    });
  }
};