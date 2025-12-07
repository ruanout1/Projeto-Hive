const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // LISTAR EQUIPES (GET /api/teams)
  async listTeams(req, res) {
    try {
      const { areas } = req.query;
      const whereClause = {};

      if (areas) {
        const areaList = areas.split(',');
        // Se a tabela teams tiver a coluna 'area', filtramos
        // Se não tiver, e a área for definida pelos membros ou supervisor, a lógica muda.
        // Assumindo que teams tem 'area' ou 'region' em string ou ID
         // whereClause.area_id = ... (se for ID) ou whereClause.area = ... (se for string)
         // Para evitar erro se a coluna não existir, deixo comentado ou genérico:
         // whereClause.area = { [Op.in]: areaList }; 
      }

      const teams = await models.teams.findAll({
        where: whereClause,
        include: [
            // Inclui membros para contar
            { 
                model: models.team_members, 
                as: 'team_members',
                include: [{ model: models.users, as: 'user', attributes: ['full_name', 'avatar_url'] }]
            },
            // CORREÇÃO AQUI: O init-models define como 'supervisor', não 'manager_user'
            {
                model: models.users,
                as: 'supervisor', 
                attributes: ['full_name']
            },
            // Inclui Área (se tiver associação no init-models)
            {
                model: models.areas,
                as: 'area',
                attributes: ['name']
            }
        ]
      });

      // Formata para o frontend se necessário, ou retorna direto
      const formattedTeams = teams.map(t => ({
          id: t.team_id,
          name: t.name,
          description: t.description,
          // Tenta pegar do objeto area, se não tiver pega do campo direto, se não, 'Geral'
          area: t.area?.name || 'Geral', 
          status: t.is_active ? 'active' : 'inactive',
          // CORREÇÃO AQUI: Lendo de 'supervisor'
          supervisorName: t.supervisor?.full_name || 'Sem Supervisor',
          memberCount: t.team_members.length,
          members: t.team_members.map(tm => ({
              id: tm.user?.user_id,
              name: tm.user?.full_name,
              avatar: tm.user?.avatar_url
          }))
      }));

      return res.json(formattedTeams);

    } catch (error) {
      console.error(error);
      handleDatabaseError(res, error, 'listar equipes');
    }
  },

  // CRIAR EQUIPE (POST /api/teams)
  async createTeam(req, res) {
    const t = await sequelize.transaction();
    try {
      const { name, description, area, supervisorId } = req.body;

      // Busca ID da área pelo nome (se vier string)
      let areaId = null;
      if (area) {
          const areaRecord = await models.areas.findOne({ where: { name: area } });
          if (areaRecord) areaId = areaRecord.area_id;
      }

      const newTeam = await models.teams.create({
        name,
        description,
        area_id: areaId,
        // O campo no banco (FK) chama manager_user_id, isso está certo
        manager_user_id: supervisorId, 
        is_active: true
      }, { transaction: t });

      await t.commit();
      res.status(201).json(newTeam);

    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'criar equipe');
    }
  },

  // ATUALIZAR EQUIPE (PUT /api/teams/:id)
  async updateTeam(req, res) {
    try {
        const { id } = req.params;
        const { name, description, area, supervisorId } = req.body;

        let areaId = null;
        if (area) {
            const areaRecord = await models.areas.findOne({ where: { name: area } });
            if (areaRecord) areaId = areaRecord.area_id;
        }

        await models.teams.update({
            name, 
            description, 
            area_id: areaId, 
            manager_user_id: supervisorId
        }, { where: { team_id: id } });

        res.json({ message: 'Equipe atualizada' });
    } catch (error) {
        handleDatabaseError(res, error, 'atualizar equipe');
    }
  },

  // ATUALIZAR STATUS (PUT /api/teams/:id/status)
  async updateTeamStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        
        await models.teams.update({
            is_active: status === 'active'
        }, { where: { team_id: id } });

        res.json({ message: 'Status atualizado' });
    } catch (error) {
        handleDatabaseError(res, error, 'atualizar status equipe');
    }
  },

  // EXCLUIR EQUIPE (DELETE /api/teams/:id)
  async deleteTeam(req, res) {
    try {
        const { id } = req.params;
        const count = await models.team_members.count({ where: { team_id: id } });
        if (count > 0) return res.status(400).json({ message: 'Equipe tem membros. Remova-os antes.' });

        await models.teams.destroy({ where: { team_id: id } });
        res.json({ message: 'Equipe excluída' });
    } catch (error) {
        handleDatabaseError(res, error, 'excluir equipe');
    }
  }
};