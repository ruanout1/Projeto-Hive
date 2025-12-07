const { models, sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // ========================================================================
  // 1. LISTAR ALOCAÇÕES (GET /api/allocations)
  // ========================================================================
  async listAllocations(req, res) {
    try {
      const { start_date, end_date, area_id } = req.query;
      const whereClause = {};

      if (start_date && end_date) {
        whereClause.start_date = { [Op.gte]: start_date };
        whereClause.end_date = { [Op.lte]: end_date };
      }

      if (area_id) whereClause.area_id = area_id;

      const allocations = await models.collaborator_allocations.findAll({
        where: whereClause,
        include: [
          {
            model: models.users,
            as: 'collaborator_user',
            attributes: ['user_id', 'full_name', 'avatar_url', 'email']
          },
          {
            model: models.companies,
            as: 'company',
            attributes: ['company_id', 'name']
          },
          {
            model: models.areas,
            as: 'area',
            attributes: ['area_id', 'name']
          },
          // IMPORTANTE: Incluir os dias de trabalho para o frontend exibir
          {
            model: models.allocation_work_days,
            as: 'allocation_work_days'
          }
        ],
        order: [['start_date', 'ASC']]
      });

      return res.json(allocations);

    } catch (error) {
      handleDatabaseError(res, error, 'listar alocações');
    }
  },

  // ========================================================================
  // 2. CRIAR ALOCAÇÃO (POST /api/allocations)
  // ========================================================================
  async createAllocation(req, res) {
    const t = await sequelize.transaction();
    try {
      const { 
        collaborator_user_id, 
        company_id, 
        area_id, 
        start_date, 
        end_date, 
        shift_start, 
        shift_end,
        work_days // Array de strings: ['monday', 'tuesday']
      } = req.body;

      // 1. Validação de Conflito (Opcional mas recomendada)
      const conflict = await models.collaborator_allocations.findOne({
        where: {
          collaborator_user_id,
          status_key: 'active',
          [Op.or]: [
            { start_date: { [Op.between]: [start_date, end_date] } },
            { end_date: { [Op.between]: [start_date, end_date] } }
          ]
        },
        transaction: t
      });

      if (conflict) {
        await t.rollback();
        return res.status(409).json({ message: 'Colaborador já possui alocação neste período.' });
      }

      // 2. Criar a Alocação Pai
      const newAllocation = await models.collaborator_allocations.create({
        collaborator_user_id,
        company_id,
        area_id, // Pode vir do body ou ser inferido do cliente
        start_date,
        end_date,
        shift_start_time: shift_start,
        shift_end_time: shift_end,
        status_key: 'active',
        created_by_user_id: req.user.id
      }, { transaction: t });

      // 3. Criar os Dias de Trabalho (Filhos)
      if (work_days && Array.isArray(work_days) && work_days.length > 0) {
          const workDaysData = work_days.map(day => ({
              allocation_id: newAllocation.allocation_id,
              day_of_week: day,
              start_time: shift_start, // Replica o horário do turno
              end_time: shift_end
          }));

          await models.allocation_work_days.bulkCreate(workDaysData, { transaction: t });
      }

      await t.commit();
      res.status(201).json(newAllocation);

    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'criar alocação');
    }
  },

  // ========================================================================
  // 3. ATUALIZAR ALOCAÇÃO (PUT /api/allocations/:id)
  // ========================================================================
  async updateAllocation(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { 
        collaborator_user_id, 
        company_id, 
        area_id,
        start_date, 
        end_date, 
        shift_start, 
        shift_end,
        work_days 
      } = req.body;

      // 1. Atualiza dados principais
      const [updated] = await models.collaborator_allocations.update({
        collaborator_user_id,
        company_id,
        area_id,
        start_date,
        end_date,
        shift_start_time: shift_start,
        shift_end_time: shift_end
      }, { 
        where: { allocation_id: id },
        transaction: t
      });

      if (updated === 0) {
        await t.rollback();
        return res.status(404).json({ message: 'Alocação não encontrada.' });
      }

      // 2. Atualiza dias de trabalho (Estratégia: Apagar tudo e recriar)
      if (work_days && Array.isArray(work_days)) {
          // Remove dias antigos
          await models.allocation_work_days.destroy({ 
              where: { allocation_id: id },
              transaction: t 
          });

          // Insere novos dias
          if (work_days.length > 0) {
              const workDaysData = work_days.map(day => ({
                  allocation_id: id,
                  day_of_week: day,
                  start_time: shift_start,
                  end_time: shift_end
              }));
              await models.allocation_work_days.bulkCreate(workDaysData, { transaction: t });
          }
      }

      await t.commit();
      res.json({ message: 'Alocação atualizada com sucesso.' });

    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'atualizar alocação');
    }
  },

  // ========================================================================
  // 4. REMOVER ALOCAÇÃO (DELETE /api/allocations/:id)
  // ========================================================================
  async deleteAllocation(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      
      // Remove dias primeiro (cascade manual se o banco não tiver)
      await models.allocation_work_days.destroy({ where: { allocation_id: id }, transaction: t });
      
      // Remove alocação
      const deleted = await models.collaborator_allocations.destroy({ where: { allocation_id: id }, transaction: t });

      if (!deleted) {
          await t.rollback();
          return res.status(404).json({ message: 'Alocação não encontrada' });
      }

      await t.commit();
      res.json({ message: 'Alocação removida.' });

    } catch (error) {
      await t.rollback();
      handleDatabaseError(res, error, 'remover alocação');
    }
  }
};