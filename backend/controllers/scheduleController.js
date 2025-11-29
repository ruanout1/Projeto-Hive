const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // ========================================================================
  // 1. ESTATÍSTICAS (Cards do Dashboard)
  // Usa a VIEW para contar rápido, sem joins manuais
  // ========================================================================
  async getScheduleStats(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera hora para comparar data

      // Busca tudo da view para este usuário (futuro e hoje)
      const items = await models.vw_user_agenda.findAll({
        where: {
          user_id: userId,
          start_at: { [Op.gte]: today } // A partir de hoje
        }
      });

      const stats = {
        total: items.length,
        // Conta serviços agendados
        upcoming_services: items.filter(i => i.item_type === 'service' && i.status === 'scheduled').length,
        // Conta reuniões/eventos agendados
        upcoming_meetings: items.filter(i => i.item_type === 'event').length,
        // Conta concluídos hoje
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
  // Consome a VIEW vw_user_agenda que já une Serviços + Eventos
  // ========================================================================
  async getSchedule(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, type, status } = req.query;

      // Filtros dinâmicos
      const whereClause = {
        user_id: userId
      };

      // Filtro de Data (obrigatório ou padrão mês atual)
      if (startDate && endDate) {
        whereClause.start_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Filtro por Tipo (service ou event)
      if (type) {
        whereClause.item_type = type;
      }

      // Filtro por Status
      if (status) {
        whereClause.status = status;
      }

      const agendaItems = await models.vw_user_agenda.findAll({
        where: whereClause,
        order: [['start_at', 'ASC']]
      });

      // Retorna direto, pois a View já formata Title, Color, Start, End, etc.
      return res.json(agendaItems);

    } catch (error) {
      handleDatabaseError(res, error, 'buscar agenda');
    }
  },

  // ========================================================================
  // 3. DETALHES DO ITEM (GET /api/schedule/:id)
  // Precisamos saber se é Evento ou Serviço para buscar na tabela certa
  // ========================================================================
  async getScheduleItemById(req, res) {
    try {
      const { id } = req.params;
      const { type } = req.query; // O front deve mandar ?type=service ou ?type=event

      if (!type) {
        return res.status(400).json({ message: 'Tipo do item (service/event) é obrigatório' });
      }

      let item = null;

      if (type === 'service') {
        // Busca na tabela de Serviços com os dados do cliente e catálogo
        item = await models.scheduled_services.findByPk(id, {
          include: [
            { model: models.companies, as: 'company' }, // Ajuste o 'as' conforme init-models
            { model: models.service_catalog, as: 'service_catalog' }
          ]
        });
      } else {
        // Busca na tabela de Eventos
        item = await models.calendar_events.findByPk(id, {
          include: [
             { model: models.event_participants, as: 'event_participants' }
          ]
        });
      }

      if (!item) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }

      return res.json(item);

    } catch (error) {
      handleDatabaseError(res, error, 'buscar detalhes do item');
    }
  },

  // ========================================================================
  // 4. CRIAR NOVO ITEM (POST /api/schedule)
  // Decide se grava em scheduled_services ou calendar_events
  // ========================================================================
  async createScheduleItem(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const managerId = req.user.id;
      const data = req.body;
      const isService = data.event_type === 'service'; // Front define o tipo

      // 1. Checagem de Conflito de Horário (Simples)
      // Verifica na VIEW para cobrir tanto serviços quanto eventos
      const hasConflict = await models.vw_user_agenda.findOne({
        where: {
          user_id: managerId,
          start_at: { [Op.lt]: data.end_date },
          end_at: { [Op.gt]: data.start_date },
          status: { [Op.ne]: 'cancelled' } // Ignora cancelados
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
        // Mapeia campos do body para tabela scheduled_services
        newItem = await models.scheduled_services.create({
          company_id: data.client_id, // Atenção: no banco novo é company_id
          service_catalog_id: data.service_catalog_id,
          collaborator_user_id: managerId, // Gestor se auto-atribuindo ou vindo do body
          scheduled_date: data.start_date.split('T')[0], // Pega só a data YYYY-MM-DD
          start_time: data.start_time, // HH:MM
          end_time: data.end_time,     // HH:MM
          status_key: 'scheduled',
          notes: data.description,
          created_by_user_id: managerId
        }, { transaction });

      } else {
        // --- CRIAR EVENTO (Reunião/Pessoal) ---
        // Mapeia campos para calendar_events
        newItem = await models.calendar_events.create({
          title: data.title,
          description: data.description,
          event_type: data.event_type || 'meeting',
          start_at: data.start_date, // DATETIME completo
          end_at: data.end_date,     // DATETIME completo
          is_all_day: data.is_all_day || false,
          location: data.location,
          meeting_link: data.meeting_link,
          created_by_user_id: managerId,
          color_hex: data.color || '#8E44AD'
        }, { transaction });
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
      const { status, type } = req.body; // Front precisa mandar o tipo
      const userId = req.user.id;

      if (!type) return res.status(400).json({ message: 'Tipo é obrigatório' });

      let updated = 0;

      if (type === 'service') {
        [updated] = await models.scheduled_services.update(
          { 
            status_key: status, 
            updated_by_user_id: userId // Gatilho para histórico se tiver campo
          },
          { where: { scheduled_service_id: id } }
        );
      } else {
        // Eventos não têm status complexo na tabela calendar_events, 
        // mas podemos assumir logica customizada ou ignorar
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
      const { type } = req.query; // Obrigatório saber onde deletar

      if (type === 'service') {
        await models.scheduled_services.destroy({ where: { scheduled_service_id: id } });
      } else if (type === 'event') {
        await models.calendar_events.destroy({ where: { event_id: id } });
      } else {
        return res.status(400).json({ message: 'Tipo inválido para exclusão.' });
      }

      return res.json({ message: 'Item excluído com sucesso.' });

    } catch (error) {
      handleDatabaseError(res, error, 'excluir item');
    }
  }
};