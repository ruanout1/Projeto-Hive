const { Op } = require('sequelize');
const {
  Team,
  TeamMember,
  User,
  TimeClockEntry
} = require('../database/db');

// Helper para erros de banco
const handleDatabaseError = (res, error, action) => {
  console.error(`Erro ao ${action}:`, error);
  return res.status(500).json({
    message: `Erro ao ${action}`,
    error: error.message
  });
};

// =====================================
// FUNÇÕES PARA CONTROLE DE PONTO (ADMIN E GESTOR)
// =====================================

// Função auxiliar para buscar IDs de colaboradores (baseado no papel)
const getManagedEmployeeIds = async (user) => {
  let teamIds = [];

  if (user.role_key === 'manager') {
    // 1. Gestor: Buscar apenas suas equipes
    const managerTeams = await Team.findAll({
      where: { manager_id: user.id },
      attributes: ['id'],
    });
    teamIds = managerTeams.map(team => team.id);
  } else if (user.user_type === 'admin') {
    // 2. Admin: Buscar todas as equipes
    const allTeams = await Team.findAll({ attributes: ['id'] });
    teamIds = allTeams.map(team => team.id);
  }

  if (teamIds.length === 0) {
    return [];
  }

  // 3. Buscar todos os membros dessas equipes
  const teamMembers = await TeamMember.findAll({
    where: { team_id: { [Op.in]: teamIds } },
    attributes: ['user_id'], // Assumindo que a FK é 'user_id'
  });
  
  return teamMembers.map(member => member.user_id);
};

// Buscar estatísticas dos registros de ponto
exports.getTimeRecordsStats = async (req, res) => {
  try {
    const employeeIds = await getManagedEmployeeIds(req.user);

    if (employeeIds.length === 0) {
      return res.status(200).json({
        totalActive: 0, checkedIn: 0, onDuty: 0, late: 0, absent: 0
      });
    }

    // Buscar registros de ponto do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeRecords = await TimeRecord.findAll({
      where: {
        employee_id: { [Op.in]: employeeIds }, // Usar employee_id (ou user_id)
        date: {
          [Op.between]: [today, tomorrow],
        },
      },
    });
    
    // ... (O resto da sua lógica de stats está correta) ...
    const totalActive = employeeIds.length;
    const checkedIn = timeRecords.filter(record => record.check_in_time !== null).length;
    const onDuty = timeRecords.filter(record => 
      record.check_in_time !== null && 
      record.check_out_time === null
    ).length;
    const late = timeRecords.filter(record => {
      if (!record.check_in_time) return false;
      const checkInTime = new Date(record.check_in_time);
      const expectedTime = new Date(checkInTime);
      expectedTime.setHours(8, 0, 0, 0); // Horário esperado: 08:00
      return checkInTime > expectedTime;
    }).length;
    const absent = totalActive - checkedIn;

    const stats = { totalActive, checkedIn, onDuty, late, absent };

    res.status(200).json(stats);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar estatísticas de ponto');
  }
};

// Listar registros de ponto
exports.getTimeRecords = async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0], team, status } = req.query;

    // Pega todos os colaboradores que o usuário pode ver
    let employeeIds = await getManagedEmployeeIds(req.user);

    // Construir condições da query
    const whereCondition = {};
    
    // Filtro por equipe
    if (team && team !== 'Todas') {
      const targetTeam = await Team.findOne({ where: { name: team } });
      if (targetTeam) {
        // Se admin, apenas filtra. Se gestor, precisa checar se a equipe é dele.
        if (req.user.user_type === 'manager' && targetTeam.manager_id !== req.user.id) {
           return res.status(403).json({ error: 'Equipe não pertence a este gestor' });
        }
        
        const teamMembers = await TeamMember.findAll({
           where: { team_id: targetTeam.id },
           attributes: ['user_id']
        });
        const teamEmployeeIds = teamMembers.map(m => m.user_id);
        
        // Interseção: Apenas colaboradores da equipe E que o gestor pode ver
        employeeIds = employeeIds.filter(id => teamEmployeeIds.includes(id));
      }
    }
    
    whereCondition.employee_id = { [Op.in]: employeeIds };


    // Filtro por data
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      whereCondition.date = { [Op.between]: [startDate, endDate] };
    }

    const timeRecords = await TimeRecord.findAll({
      where: whereCondition,
      include: [ /* ... seus includes ... */ ],
      order: [['check_in_time', 'DESC']],
    });

    // ... (O resto da sua lógica de formatação está correta) ...
    const formattedRecords = timeRecords.map(record => ({ /* ... */ }));

    // ... (Sua lógica de filtro de status) ...
    
    res.status(200).json({
      records: filteredRecords,
      total: filteredRecords.length,
    });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar registros de ponto');
  }
};

// Buscar equipes (agora para admin ou gestor)
exports.getManagableTeams = async (req, res) => {
  try {
    const where = {};
    if (req.user.user_type === 'manager') {
      where.manager_id = req.user.id;
    }

    const teams = await Team.findAll({
      where: where,
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    const teamNames = teams.map(team => team.name);
    res.status(200).json({ teams: teamNames });
  } catch (error) {
    handleDatabaseError(res, error, 'buscar equipes');
  }
};

// Buscar detalhes de um registro específico
exports.getTimeRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeIds = await getManagedEmployeeIds(req.user);

    const record = await TimeRecord.findOne({
      where: { 
        id: id,
        employee_id: { [Op.in]: employeeIds } // Garante que o registro é de um colaborador gerenciado
      },
      include: [ /* ... seus includes ... */ ]
    });

    if (!record) {
      return res.status(404).json({
        error: 'Registro de ponto não encontrado ou não pertence às suas equipes',
      });
    }
    
    // ... (Sua lógica de formatação está correta) ...
    const formattedRecord = { /* ... */ };

    res.status(200).json(formattedRecord);
  } catch (error) {
    handleDatabaseError(res, error, 'buscar registro de ponto por ID');
  }
};

// Justificar registro de ponto
exports.justifyTimeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, document } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Motivo da justificativa é obrigatório' });
    }

    // Verificar se o registro pertence às equipes do usuário
    const employeeIds = await getManagedEmployeeIds(req.user);
    const record = await TimeRecord.findOne({
      where: { 
        id: id,
        employee_id: { [Op.in]: employeeIds }
      }
    });

    if (!record) {
      return res.status(404).json({
        error: 'Registro de ponto não encontrado ou não pertence às suas equipes',
      });
    }

    const managerReport = {
      reason: reason.trim(),
      document: document || null,
      date: new Date().toLocaleDateString('pt-BR'),
      reportedBy: req.user.full_name
    };

    await record.update({
      manager_report: JSON.stringify(managerReport),
      report_requested: false,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: 'Justificativa enviada com sucesso',
      report: managerReport,
    });
  } catch (error) {
    handleDatabaseError(res, error, 'justificar registro de ponto');
  }
};

// Exportar relatório de ponto
exports.exportTimeRecords = async (req, res) => {
  try {
    const { type, team, employeeId, startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Período do relatório é obrigatório' });
    }

    // IDs que o usuário logado pode ver
    const manageableEmployeeIds = await getManagedEmployeeIds(req.user);

    // IDs filtrados pela requisição
    let requestedEmployeeIds = [];

    if (type === 'team' && team) {
      // ... (Lógica para buscar IDs da equipe) ...
    } else if (type === 'individual' && employeeId) {
      // ... (Lógica para buscar ID individual) ...
    } else {
      requestedEmployeeIds = [...manageableEmployeeIds];
    }
    
    // Interseção final: o usuário só pode exportar quem ele pode gerenciar
    const finalEmployeeIds = requestedEmployeeIds.filter(id => 
      manageableEmployeeIds.includes(id)
    );

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const timeRecords = await TimeRecord.findAll({
      where: {
        employee_id: { [Op.in]: finalEmployeeIds },
        date: { [Op.between]: [start, end] }
      },
      include: [ /* ... seus includes ... */ ],
      order: [['date', 'ASC'], ['check_in_time', 'ASC']]
    });

    // ... (Sua lógica de formatação de relatório) ...
    const reportData = timeRecords.map(record => ({ /* ... */ }));

    // TODO: Implementar geração de PDF/Excel
    res.status(200).json({
      message: 'Relatório gerado com sucesso',
      data: reportData,
      metadata: { /* ... */ }
    });

  } catch (error) {
    handleDatabaseError(res, error, 'exportar relatório de ponto');
  }
};

// Pré-visualizar relatório de ponto
exports.previewTimeRecordsExport = async (req, res) => {
  // Esta função está chamando 'exports.exportTimeRecords'
  // Isso pode ser problemático. É melhor refatorar 'exportTimeRecords'
  // para ser uma função interna e ter duas rotas chamando-a.
  // Por agora, vamos manter, mas ciente do "code smell".
  try {
    // Simulando a resposta para evitar chamada interna complexa
    // A lógica real de 'exportTimeRecords' deve ser executada
    // e depois fatiada (slice) aqui.
    // Esta é uma implementação mock.
    // const fullReport = await internalExportTimeRecords(req); // Função refatorada
    // const previewData = fullReport.data.slice(0, 10);
    
    res.status(200).json({
      message: "Pré-visualização gerada (simulação). Implemente a lógica de exportação.",
      isPreview: true,
      data: []
    });
    
  } catch (error) {
    handleDatabaseError(res, error, 'pré-visualizar relatório de ponto');
  }
};
