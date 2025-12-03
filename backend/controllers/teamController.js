const { Sequelize, Op } = require('sequelize');
const { sequelize, Team, User, TeamMember } = require('../database/db');

// ==========================================================
// FUNÇÕES - GERENCIAMENTO DE EQUIPES (ADMIN E GESTOR)
// ==========================================================

// GET /api/teams
exports.getAllTeams = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {};

    // *** A MÁGICA DA PERMISSÃO ***
    // Se for gestor, vê apenas as equipes que ele gerencia.
    // Se for admin, o 'where' fica vazio e ele vê tudo.
    if (loggedInUser.user_type === 'manager') {
      whereCondition.manager_user_id = loggedInUser.id;
    }

    const teams = await Team.findAll({
      where: whereCondition, // Aplica o filtro de permissão
      attributes: [
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
        createdAt: plainTeam.created_at,
        manager: plainTeam.manager ? { ...plainTeam.manager, role: 'gestor' } : null,
        members: plainTeam.members.map((m) => ({ ...m, role: 'colaborador' }))
      };
    });

    res.status(200).json(formattedTeams);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar equipes');
  }
};

// POST /api/teams (Apenas Admin)
exports.createTeam = async (req, res) => {
  const { name, managerId, memberIds } = req.body;
  
  if (!name || !managerId) {
    return res.status(400).json({ message: "Nome e Gestor são obrigatórios." });
  }

  const t = await sequelize.transaction(); 

  try {
    const newTeam = await Team.create({
      name,
      manager_user_id: managerId,
      is_active: true
    }, { transaction: t });

    if (memberIds && memberIds.length > 0) {
      const membersData = memberIds.map((userId) => ({
        team_id: newTeam.team_id,
        user_id: userId
      }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    await t.commit();
    
    // Busca a equipe recém-criada para retornar ao frontend
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

    // ... (formatação do createdTeam) ...
    const plainTeam = createdTeam.get({ plain: true });
    const formattedTeam = {
      // ... (formatação) ...
    };

    res.status(201).json(formattedTeam);

  } catch (error) {
    await t.rollback(); 
    handleDatabaseError(res, error, 'criar equipe');
  }
};

// PUT /api/teams/:id (Apenas Admin)
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

    // 1. Atualiza dados
    await team.update({ name, manager_user_id: managerId }, { transaction: t });

    // 2. Remove membros antigos
    await TeamMember.destroy({ where: { team_id: id }, transaction: t });

    // 3. Adiciona novos membros
    if (memberIds && memberIds.length > 0) {
      const membersData = memberIds.map((userId) => ({ team_id: id, user_id: userId }));
      await TeamMember.bulkCreate(membersData, { transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: "Equipe atualizada com sucesso." });

  } catch (error) {
    await t.rollback();
    handleDatabaseError(res, error, 'atualizar equipe');
  }
};

// PUT /api/teams/:id/status (Apenas Admin)
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

    await team.update({ is_active: status === 'active' });
    res.status(200).json({ message: "Status da equipe atualizado." });
  } catch (error) {
    handleDatabaseError(res, error, 'atualizar status da equipe');
  }
};

// DELETE /api/teams/:id (Apenas Admin)
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