const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // ========================================================================
  // 1. ESTATÍSTICAS (Cards do Dashboard)
  // ========================================================================
  async getScheduleStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const items = await models.vw_user_agenda.findAll({
        where: {
          user_id: userId,
          start_at: { [Op.gte]: today }
        }
      });

      const stats = {
        total: items.length,
        upcoming_services: items.filter(i => i.item_type === 'service' && i.status === 'scheduled').length,
        upcoming_meetings: items.filter(i => i.item_type === 'event').length,
        completed_today: items.filter(i => 
          i.status === 'completed' && 
          new Date(i.end_at).toDateString() === today.toDateString()
        ).length
      };

      return res.json(stats);
    } catch (error) {
      handleDatabaseError(res, error, 'buscar estatísticas da agenda');
    }
  },

  // ========================================================================
  // 2. LISTAGEM DA AGENDA (GET /api/schedule)
  // ========================================================================
  async getSchedule(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, type, status } = req.query;

      const whereClause = { user_id: userId };

      if (startDate && endDate) {
        whereClause.start_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      if (type) whereClause.item_type = type;
      if (status) whereClause.status = status;

      const agendaItems = await models.vw_user_agenda.findAll({
        where: whereClause,
        order: [['start_at', 'ASC']]
      });

      return res.json(agendaItems);
    } catch (error) {
      handleDatabaseError(res, error, 'buscar agenda');
    }
  },

  // ========================================================================
  // 3. DETALHES DO ITEM (GET /api/schedule/:id)
  // ========================================================================
  async getScheduleItemById(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.query; 

      if (!type) return res.status(400).json({ message: 'Tipo do item é obrigatório' });

      let item = null;

      if (type === 'service') {
        item = await models.scheduled_services.findByPk(id, {
          include: [
            { model: models.companies, as: 'company' },
            { model: models.service_catalog, as: 'service_catalog' }
          ]
        });
      } else {
        // Inclui participantes se for evento
        item = await models.calendar_events.findByPk(id, {
          include: [
             { model: models.event_participants, as: 'event_participants' }
          ]
        });
      }

      if (!item) return res.status(404).json({ message: 'Item não encontrado' });
      return res.json(item);

    } catch (error) {
      handleDatabaseError(res, error, 'buscar detalhes do item');
    }
  },

  // ========================================================================
  // 4. CRIAR NOVO ITEM (POST /api/schedule)
  // ========================================================================
  async createScheduleItem(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const managerId = req.user.id;
      const data = req.body;
      const isService = data.event_type === 'service';

      // Checagem de conflito
      const hasConflict = await models.vw_user_agenda.findOne({
        where: {
          user_id: managerId,
          start_at: { [Op.lt]: data.end_date },
          end_at: { [Op.gt]: data.start_date },
          status: { [Op.ne]: 'cancelled' }
        },
        transaction
      });

      if (hasConflict) {
        await transaction.rollback();
        return res.status(409).json({ message: 'Conflito de horário detectado.' });
      }

      let newItem = null;

      if (isService) {
        // --- CRIAR SERVIÇO ---
        newItem = await models.scheduled_services.create({
          company_id: data.client_id,
          service_catalog_id: data.service_catalog_id,
          collaborator_user_id: managerId,
          scheduled_date: data.start_date.split('T')[0],
          start_time: data.start_time,
          end_time: data.end_time,
          status_key: 'scheduled',
          notes: data.description,
          created_by_user_id: managerId
        }, { transaction });

      } else {
        // --- CRIAR EVENTO (Reunião/Pessoal) ---
        newItem = await models.calendar_events.create({
          title: data.title,
          description: data.description,
          event_type: data.event_type || 'meeting',
          start_at: data.start_date,
          end_at: data.end_date,
          is_all_day: data.is_all_day || false,
          location: data.location,
          meeting_link: data.meeting_link,
          created_by_user_id: managerId,
          color_hex: data.color || '#8E44AD',
          reminder: data.reminder || 'none' // <--- CAMPO NOVO
        }, { transaction });

        // --- SALVAR PARTICIPANTES (Se houver) ---
        if (data.participants && Array.isArray(data.participants) && data.participants.length > 0) {
            const participantsData = data.participants.map(userId => ({
                event_id: newItem.event_id,
                user_id: userId,
                status: 'pending'
            }));
            await models.event_participants.bulkCreate(participantsData, { transaction });
        }
      }

      await transaction.commit();
      return res.status(201).json(newItem);

    } catch (error) {
      await transaction.rollback();
      handleDatabaseError(res, error, 'criar agendamento');
    }
  },

  // ========================================================================
  // 5. ATUALIZAR STATUS (PUT /api/schedule/:id/status)
  // ========================================================================
  async updateScheduleItemStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, type } = req.body;
      const userId = req.user.id;

      if (!type) return res.status(400).json({ message: 'Tipo é obrigatório' });

      let updated = 0;

      if (type === 'service') {
        [updated] = await models.scheduled_services.update(
          { status_key: status, updated_by_user_id: userId },
          { where: { scheduled_service_id: id } }
        );
      } else {
        return res.status(400).json({ message: 'Apenas serviços têm fluxo de status.' });
      }

      if (updated === 0) return res.status(404).json({ message: 'Item não encontrado' });
      return res.json({ success: true, status });

    } catch (error) {
      handleDatabaseError(res, error, 'atualizar status');
    }
  },

  // ========================================================================
  // 6. DELETAR (DELETE /api/schedule/:id)
  // ========================================================================
  async deleteScheduleItem(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.query;

      if (type === 'service') {
        await models.scheduled_services.destroy({ where: { scheduled_service_id: id } });
      } else if (type === 'event') {
        // Remove participantes primeiro (se não tiver CASCADE no banco)
        await models.event_participants.destroy({ where: { event_id: id } });
        await models.calendar_events.destroy({ where: { event_id: id } });
      } else {
        return res.status(400).json({ message: 'Tipo inválido para exclusão.' });
      }

      return res.json({ message: 'Item excluído com sucesso.' });

    } catch (error) {
      handleDatabaseError(res, error, 'excluir item');
    }
  },

  // ========================================================================
  // 7. ATUALIZAR LEMBRETE (PATCH /api/schedule/:id/reminder)
  // ========================================================================
  async updateScheduleItemReminder(req, res) {
    try {
      const { id } = req.params;
      const { reminder } = req.body; // Ex: 'one_day_before'

      // Atualiza apenas o campo reminder na tabela de eventos
      const [updated] = await models.calendar_events.update(
        { reminder: reminder },
        { where: { event_id: id } }
      );

      if (updated === 0) {
        // Se não achou em eventos, pode ser um serviço (que geralmente não tem lembrete pessoal editável assim, mas tratamos o erro)
        return res.status(404).json({ message: 'Evento não encontrado ou tipo não suporta lembrete.' });
      }

      return res.json({ success: true, message: 'Lembrete atualizado com sucesso.' });

    } catch (error) {
      handleDatabaseError(res, error, 'atualizar lembrete');
    }
  }
};