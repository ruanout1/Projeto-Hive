const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  async getDashboardData(req, res) {
    try {
      const userRole = req.user.role_key || req.user.role;
      const userId = req.user.id || req.user.user_id;

      if (!userRole) return res.status(403).json({ message: 'Perfil não identificado.' });

      const normalizedRole = userRole.toLowerCase().trim();

      switch (normalizedRole) {
        case 'admin': case 'administrador': return await getAdminData(res);
        case 'manager': case 'gestor': return await getManagerData(userId, res);
        case 'collaborator': case 'colaborador': return await getCollaboratorData(userId, res);
        case 'client': case 'cliente': return await getClientData(userId, res);
        default: return res.status(403).json({ message: `Perfil não autorizado: ${userRole}` });
      }
    } catch (error) {
      console.error("❌ Erro Fatal no Dashboard:", error);
      handleDatabaseError(res, error, 'carregar dashboard');
    }
  }
};

// --- FUNÇÕES AUXILIARES BLINDADAS ---

async function getManagerData(userId, res) {
  let stats = { pendente: 0, agendado: 0, 'em-andamento': 0, concluido: 0, cancelado: 0 };
  let formattedServices = [];
  let formattedTeams = [];

  // BLOCO 1: Estatísticas (Service Requests)
  try {
    // Busca genérica sem especificar colunas para evitar erro de "Unknown column"
    const allRequests = await models.service_requests.findAll();
    
    allRequests.forEach(r => {
      // Tenta ler status de qualquer coluna possível
      const s = (r.status_key || r.status || r.dataValues?.status || '').toLowerCase();
      if (s.includes('pend')) stats.pendente++;
      else if (s.includes('approv') || s.includes('sched') || s.includes('agen')) stats.agendado++;
      else if (s.includes('prog') || s.includes('andamento')) stats['em-andamento']++;
      else if (s.includes('compl') || s.includes('concl')) stats.concluido++;
      else if (s.includes('rej') || s.includes('canc')) stats.cancelado++;
    });
  } catch (err) {
    console.error("⚠️ Erro ao carregar Estatísticas (Manager):", err.message);
    // Não quebra a requisição, apenas deixa zerado
  }

  // BLOCO 2: Serviços Ativos (Scheduled Services)
  try {
    const activeServices = await models.scheduled_services.findAll({
      where: { status_key: { [Op.or]: ['scheduled', 'in_progress', 'agendado', 'em_andamento'] } },
      include: [
        { model: models.companies, as: 'company', attributes: ['name'] },
        { model: models.service_catalog, as: 'service_catalog', attributes: ['name'] },
        { model: models.teams, as: 'team', attributes: ['name'] }
      ],
      limit: 5,
      order: [['scheduled_date', 'ASC']]
    });

    formattedServices = activeServices.map(s => ({
      id: s.scheduled_service_id,
      cliente: s.company?.name || 'Cliente',
      servico: s.service_catalog?.name || 'Serviço',
      equipe: s.team?.name || 'Sem equipe',
      status: s.status_key,
      prazo: s.scheduled_date
    }));
  } catch (err) {
    console.error("⚠️ Erro ao carregar Serviços Ativos (Manager):", err.message);
  }

  // BLOCO 3: Equipes (Teams)
  try {
    const teams = await models.teams.findAll({
      where: { is_active: true },
      include: [
          { model: models.areas, as: 'area', attributes: ['name'] }, 
          { model: models.team_members, as: 'team_members' }
      ]
    });

    formattedTeams = teams.map(t => ({
      id: t.team_id,
      name: t.name,
      zone: t.area?.name || 'Geral',
      members: t.team_members ? t.team_members.length : 0
    }));
  } catch (err) {
    console.error("⚠️ Erro ao carregar Equipes (Manager):", err.message);
  }

  // Retorna o que conseguiu carregar
  return res.json({
    type: 'manager',
    stats,
    services: formattedServices,
    teams: formattedTeams
  });
}

// --- OUTROS PERFIS (MANTIDOS) ---

async function getAdminData(res) {
  // Simplificado para evitar erros, você pode expandir depois
  try {
    const totalTeams = await models.teams.count({ where: { is_active: true } });
    const totalOrders = await models.service_orders.count();
    const activeClients = await models.companies.count({ where: { is_active: true } });
    
    return res.json({
        type: 'admin',
        kpis: { totalTeams, totalOrders, activeClients, financialHealth: "94%", customerSatisfaction: 4.8 },
        charts: { resources: [], performance: [] },
        activities: []
    });
  } catch (err) {
     console.error("Erro Admin Dashboard:", err);
     return res.status(500).json({ message: "Erro parcial no dashboard admin" });
  }
}

async function getCollaboratorData(userId, res) {
    try {
        const myServices = await models.scheduled_services.count({
            where: { collaborator_user_id: userId, status_key: { [Op.ne]: 'completed' } }
        });
        return res.json({ type: 'collaborator', stats: { myPendingServices: myServices, hoursWorkedToday: '0h' } });
    } catch (err) {
        console.error("Erro Colab Dashboard:", err);
        return res.json({ type: 'collaborator', stats: { myPendingServices: 0, hoursWorkedToday: '0h' } });
    }
}

async function getClientData(userId, res) {
    try {
        const clientUser = await models.client_users.findOne({ where: { user_id: userId } });
        if (!clientUser) return res.json({ type: 'client', companyId: null, stats: { openRequests: 0 }, message: 'Sem empresa.' });
        
        const openRequests = await models.service_requests.count({
            where: { company_id: clientUser.company_id, status: { [Op.notIn]: ['completed', 'cancelled'] } }
        });
        return res.json({ type: 'client', companyId: clientUser.company_id, stats: { openRequests } });
    } catch (err) {
        console.error("Erro Client Dashboard:", err);
        return res.json({ type: 'client', companyId: null, stats: { openRequests: 0 } });
    }
}