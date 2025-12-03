const { Op, Sequelize } = require('sequelize');
const { CollaboratorAllocation, Company, User, Team, TeamMember } = require('../database/db');

// =====================================
// HELPER: Gerar Condição de Permissão
// =====================================
const buildAllocationsWhere = async (user) => {
  if (user.user_type === 'admin') {
    return {}; // Admin vê tudo
  }

  // Gestor vê alocações da sua área
  // NOTA: O schema 'collaborator_allocations' TEM 'area_id'.
  // Vamos assumir que 'user.area' contém o 'area_id' do gestor.
  if (!user.area) {
     console.error(`Gestor ${user.id} sem 'area' definida no token.`);
     throw new Error('Usuário gestor não tem área definida.');
  }
  return { area_id: user.area };
};

// =====================================
// HELPER: Validar Permissão de Criação/Edição
// =====================================
const validateAllocationPermissions = async (user, clientId, collaboratorUserId) => {
  if (user.user_type === 'admin') {
    return true; // Admin pode tudo
  }

  // 1. Gestor: Checar se o Cliente pertence à sua área
  //    (Assumindo que a 'area' está no model Client)
  const client = await Client.findOne({ 
    where: { 
      id: clientId, 
      area: user.area 
    } 
  });
  if (!client) {
    throw new Error('Cliente inválido ou não pertence à sua área.');
  }

  // 2. Gestor: Checar se o Colaborador pertence a uma de suas equipes
  const managerTeams = await Team.findAll({ 
    where: { manager_user_id: user.id }, 
    attributes: ['team_id'] 
  });
  const teamIds = managerTeams.map(t => t.team_id);

  const teamMember = await TeamMember.findOne({
    where: {
      team_id: { [Op.in]: teamIds },
      user_id: collaboratorUserId // Assumindo que 'user_id' é a FK em TeamMember
    }
  });

  if (!teamMember) {
    throw new Error('Colaborador inválido ou não pertence às suas equipes.');
  }
};

// =====================================
// FUNÇÕES DE ALOCAÇÃO (CRUD)
// =====================================

// GET /api/allocations/stats
exports.getAllocationStats = async (req, res) => {
  try {
    const where = await buildAllocationsWhere(req.user);
    
    const counts = await CollaboratorAllocation.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('status')), 'count'],
      ],
      where: where,
      group: ['status'],
    });

    const stats = counts.reduce((acc, item) => {
      acc[item.status] = Number(item.get('count'));
      return acc;
    }, {});

    const result = {
      total: (stats.active || 0) + (stats.upcoming || 0) + (stats.completed || 0) + (stats.cancelled || 0),
      active: stats.active || 0,
      upcoming: stats.upcoming || 0,
      completed: stats.completed || 0
    };

    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de alocações');
  }
};

// GET /api/allocations
exports.getAllocations = async (req, res) => {
  try {
    const { status } = req.query;
    const where = await buildAllocationsWhere(req.user);

    if (status && status !== 'all') {
      where.status = status;
    }

    const allocations = await CollaboratorAllocation.findAll({
      where: where,
      include: [
        {
          model: User,
          as: 'collaborator', // Verifique seu alias de associação
          attributes: ['full_name', 'user_id']
          // TODO: Incluir 'position' da tabela 'collaborators'
        },
        {
          model: Client,
          as: 'client', // Verifique seu alias de associação
          attributes: ['main_company_name', 'client_id', 'area'] // Assumindo 'area' no Client
        }
      ],
      order: [['start_date', 'DESC']]
    });

    // Formatar dados (o frontend espera 'collaboratorName', etc.)
    const formatted = allocations.map(a => ({
      id: a.allocation_id,
      collaboratorId: a.collaborator_user_id,
      collaboratorName: a.collaborator?.full_name || 'Não encontrado',
      collaboratorPosition: 'Cargo', // TODO: Buscar da tabela 'collaborators'
      clientId: a.client_id,
      clientName: a.client?.main_company_name || 'Não encontrado',
      clientArea: a.client?.area || a.area_id, // Pega a área do cliente ou da alocação
      startDate: a.start_date,
      endDate: a.end_date,
      workDays: a.shift, // TODO: O front espera 'workDays' (array), o banco tem 'shift' (enum)
      startTime: '08:00', // TODO: Adicionar 'start_time' e 'end_time' no schema
      endTime: '17:00',
      status: a.status,
      createdAt: a.created_at
    }));

    res.status(200).json(formatted);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar alocações');
  }
};

// POST /api/allocations
exports.createAllocation = async (req, res) => {
  const {
    collaboratorId,
    clientId,
    startDate,
    endDate,
    workDays, // Array
    startTime,
    endTime,
  } = req.body;

  try {
    // 1. Validar permissões
    await validateAllocationPermissions(req.user, clientId, collaboratorId);

    // 2. Encontrar a área (do cliente ou do gestor)
    const client = await Client.findByPk(clientId, { attributes: ['area_id'] }); // Assumindo 'area_id' no client
    const area_id = client?.area_id || req.user.area;

    // 3. Calcular status
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status = 'upcoming';
    if (today >= start && today <= end) status = 'active';
    else if (today > end) status = 'completed';

    // 4. Criar
    const newAllocation = await CollaboratorAllocation.create({
      allocation_number: `ALLOC-${Date.now()}`,
      collaborator_user_id: collaboratorId,
      client_id: clientId,
      area_id: area_id,
      start_date: startDate,
      end_date: endDate,
      // TODO: O banco espera 'shift' (enum), o front envia 'workDays' (array)
      // Você precisa converter. Ex: JSON.stringify(workDays) se o campo for TEXT
      // ou mapear para um ENUM.
      shift: 'full_day', // Placeholder
      status: status,
      created_by_user_id: req.user.id
    });

    res.status(201).json(newAllocation);

  } catch (error) {
    handleDatabaseError(res, error, 'criar alocação');
  }
};

// PUT /api/allocations/:id
exports.updateAllocation = async (req, res) => {
  const { id } = req.params;
  const {
    collaboratorId,
    clientId,
    startDate,
    endDate,
    workDays,
    startTime,
    endTime,
  } = req.body;

  try {
    // 1. Encontrar alocação (e checar permissão de acesso)
    const where = await buildAllocationsWhere(req.user);
    where.allocation_id = id;
    const allocation = await CollaboratorAllocation.findOne({ where });

    if (!allocation) {
      return res.status(404).json({ message: 'Alocação não encontrada ou inacessível.' });
    }

    // 2. Validar permissões (se os IDs mudaram)
    if (Number(clientId) !== allocation.client_id || Number(collaboratorId) !== allocation.collaborator_user_id) {
       await validateAllocationPermissions(req.user, clientId, collaboratorId);
    }
    
    // 3. Calcular status
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    let status = 'upcoming';
    if (today >= start && today <= end) status = 'active';
    else if (today > end) status = 'completed';

    // 4. Atualizar
    await allocation.update({
      collaborator_user_id: collaboratorId,
      client_id: clientId,
      start_date: startDate,
      end_date: endDate,
      shift: 'full_day', // Placeholder para 'workDays'
      status: status,
    });
    
    res.status(200).json(allocation);

  } catch (error) {
    handleDatabaseError(res, error, 'atualizar alocação');
  }
};

// PUT /api/allocations/:id/cancel
exports.cancelAllocation = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Encontrar alocação (e checar permissão de acesso)
    const where = await buildAllocationsWhere(req.user);
    where.allocation_id = id;
    const allocation = await CollaboratorAllocation.findOne({ where });

    if (!allocation) {
      return res.status(404).json({ message: 'Alocação não encontrada ou inacessível.' });
    }

    // 2. Atualizar status
    await allocation.update({ status: 'cancelled' });

    res.status(200).json({ message: 'Alocação cancelada com sucesso.' });
  } catch (error) {
    handleDatabaseError(res, error, 'cancelar alocação');
  }
};