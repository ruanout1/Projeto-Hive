const { Op } = require('sequelize');
const sequelize = require('../database/connection');
// CORREÇÃO: Adicionando todos os modelos necessários a partir das associações
const { Team, User, TeamMember, ManagerArea, Area } = require('../database/associations');
const { handleDatabaseError } = require('../utils/errorHandling');

// GET /api/teams
exports.getAllTeams = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const whereCondition = {};

    if (loggedInUser.user_type === 'manager') {
      whereCondition.manager_user_id = loggedInUser.id;
    }

    const teams = await Team.findAll({
      where: whereCondition,
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

    const createdTeam = await Team.findByPk(newTeam.team_id, {
      attributes: [['team_id', 'id'], 'name', ['is_active', 'status'], 'created_at'],
      include: [
        { model: User, as: 'manager', attributes: [['user_id', 'id'], ['full_name', 'name'], 'email'] },
        { model: User, as: 'members', attributes: [['user_id', 'id'], ['full_name', 'name'], 'email'], through: { attributes: [] } }
      ]
    });

    if (!createdTeam) {
      return res.status(404).json({ message: "Equipe criada, mas não pôde ser recuperada." });
    }

    const plainTeam = createdTeam.get({ plain: true });
    const formattedTeam = {
      ...plainTeam,
      status: plainTeam.status ? 'active' : 'inactive',
      createdAt: plainTeam.created_at,
      manager: plainTeam.manager ? { ...plainTeam.manager, role: 'gestor' } : null,
      members: plainTeam.members.map((m) => ({ ...m, role: 'colaborador' }))
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

    await team.update({ name, manager_user_id: managerId }, { transaction: t });

    await TeamMember.destroy({ where: { team_id: id }, transaction: t });

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
  const { status } = req.body;

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

/**
 * @desc    Busca as equipes da área do gestor com a contagem de membros.
 * @route   GET /api/manager/teams
 * @access  Private (Manager)
 */
exports.getManagerTeams = async (req, res) => {
  const managerId = req.user.user_id;

  try {
    // 1. Encontrar as áreas do gestor
    const managerAreas = await ManagerArea.findAll({
      where: { manager_user_id: managerId },
      attributes: ['area_id'],
    });

    if (!managerAreas || managerAreas.length === 0) {
      return res.status(200).json([]); // Retorna array vazio se o gestor não tem área
    }

    const areaIds = managerAreas.map(ma => ma.area_id);

    // 2. Buscar as equipes nessas áreas, incluindo a contagem de membros
    const teams = await Team.findAll({
      where: {
        area_id: {
          [Op.in]: areaIds,
        },
      },
      include: [
        {
          model: Area,
          as: 'area',
          attributes: ['name'], // Buscar o nome da área (ex: 'Zona Norte')
        },
      ],
      attributes: {
        include: [
          // Adiciona um subquery para contar os membros de cada equipe
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM team_members AS teamMember
              WHERE
                teamMember.team_id = Team.team_id
            )`),
            'memberCount',
          ],
        ],
      },
    });

    // 3. Formatar a resposta para o frontend
    const formattedTeams = teams.map(team => ({
      id: team.team_id,
      name: team.name, // ex: "Equipe Alpha"
      zone: team.area?.name || 'Área não definida', // ex: "Zona Norte"
      members: parseInt(team.get('memberCount'), 10) || 0, // ex: 8
    }));

    res.status(200).json(formattedTeams);

  } catch (error) {
    console.error("Erro ao buscar equipes do gestor:", error);
    handleDatabaseError(res, error, 'buscar equipes do gestor');
  }
};
