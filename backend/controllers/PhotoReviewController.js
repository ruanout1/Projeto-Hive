const { models, sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { handleDatabaseError } = require('../utils/errorHandling');

module.exports = {
  // 1. LISTAR ENVIOS (GET /api/photo-review)
  async listSubmissions(req, res) {
    try {
      console.log("📸 [PhotoReview] Iniciando busca de fotos...");
      const { status, search } = req.query;

      // Filtro de Status da Foto
      let statusFilter = {};
      if (status === 'pending') statusFilter = { review_status_key: 'pending' };
      else if (status === 'sent') statusFilter = { review_status_key: { [Op.in]: ['approved', 'sent'] } };

      console.log("📸 [PhotoReview] Filtro aplicado:", statusFilter);

      const photos = await models.service_order_photos.findAll({
        where: statusFilter,
        include: [
          // Tenta trazer o agendamento vinculado
          {
            model: models.scheduled_services,
            as: 'scheduled_service', 
            required: false, // Traz a foto mesmo se o serviço não for encontrado (para debug)
            include: [
                { model: models.companies, as: 'company', attributes: ['name'] },
                { model: models.client_branches, as: 'branch', attributes: ['name', 'area', 'neighborhood'] },
                { model: models.service_catalog, as: 'service_catalog', attributes: ['name'] }
            ]
          },
          // Tenta trazer o colaborador
          {
            model: models.users,
            as: 'collaborator_user',
            attributes: ['full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      console.log(`📸 [PhotoReview] Encontradas ${photos.length} fotos no total.`);

      // Agrupar fotos por Serviço
      const groupedSubmissions = {};

      photos.forEach(photo => {
        // LOG DE DEBUG PARA CADA FOTO
        // console.log(`   - Processando Foto ID ${photo.photo_id}. ServiceID: ${photo.scheduled_service_id}`);

        // Se não tiver serviço vinculado, usamos um ID genérico ou ignoramos
        const serviceId = photo.scheduled_service_id || 'orphaned';
        const service = photo.scheduled_service;
        
        // Se for a primeira vez que vemos este serviço, criamos o cabeçalho do grupo
        if (!groupedSubmissions[serviceId]) {
            groupedSubmissions[serviceId] = {
                id: `SUB-${serviceId}`,
                serviceRequestId: `SERV-${serviceId}`,
                // Dados do Cliente/Serviço (com Fallbacks seguros)
                clientName: service?.company?.name || 'Cliente Desconhecido',
                clientArea: service?.branch?.area || 'centro', 
                clientLocation: service?.branch?.neighborhood || 'Local não informado',
                serviceType: service?.service_catalog?.name || 'Serviço Avulso',
                serviceDescription: service?.notes || 'Sem descrição',
                // Dados do Colaborador
                collaboratorName: photo.collaborator_user?.full_name || 'Colaborador',
                collaboratorId: String(photo.collaborator_user_id),
                // Datas
                uploadDate: photo.created_at ? new Date(photo.created_at).toLocaleDateString('pt-BR') : '-',
                uploadTime: photo.created_at ? new Date(photo.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '-',
                // Arrays
                beforePhotos: [],
                afterPhotos: [],
                // Detalhes
                collaboratorNotes: photo.description || '', 
                status: photo.review_status_key === 'pending' ? 'pending' : 'sent',
                managerNotes: photo.review_notes,
                sentDate: photo.reviewed_at ? new Date(photo.reviewed_at).toLocaleDateString('pt-BR') : undefined
            };
        }

        // Adiciona a URL da foto no array certo
        if (photo.photo_type === 'before') {
            groupedSubmissions[serviceId].beforePhotos.push(photo.photo_url);
        } else {
            groupedSubmissions[serviceId].afterPhotos.push(photo.photo_url);
        }
      });

      const result = Object.values(groupedSubmissions);
      console.log(`📸 [PhotoReview] Retornando ${result.length} grupos de submissão.`);

      // Filtro de busca
      if (search) {
          const lowerSearch = search.toLowerCase();
          return res.json(result.filter(s => 
              s.clientName.toLowerCase().includes(lowerSearch) ||
              s.collaboratorName.toLowerCase().includes(lowerSearch)
          ));
      }

      res.json(result);

    } catch (error) {
      console.error("❌ [PhotoReview] Erro no Controller:", error);
      handleDatabaseError(res, error, 'listar fotos para revisão');
    }
  },

  // 2. ENVIAR/ATUALIZAR REVISÃO (PUT)
  async sendToClient(req, res) {
      const t = await sequelize.transaction();
      try {
          const { id } = req.params; 
          // Limpa o ID para garantir que é numérico
          const serviceId = id.toString().replace('SUB-', '').replace('PHOTO-', '');
          
          const { notes } = req.body;
          const reviewerId = req.user.id;

          if (!serviceId || isNaN(serviceId)) {
             await t.rollback();
             return res.status(400).json({ message: 'ID inválido.' });
          }

          // AQUI MUDOU: Removemos qualquer checagem de status anterior.
          // Se o gestor mandou salvar, nós salvamos (seja primeira vez ou edição).
          
          const [updatedRows] = await models.service_order_photos.update({
              review_status_key: 'sent', // Garante que fica/continua como enviado
              review_notes: notes,
              reviewed_by_user_id: reviewerId,
              reviewed_at: new Date() // Atualiza a data da última revisão
          }, {
              where: { scheduled_service_id: serviceId },
              transaction: t
          });

          if (updatedRows === 0) {
              await t.rollback();
              // Se não atualizou nada, pode ser que o ID não exista
              return res.status(404).json({ message: 'Serviço não encontrado ou sem fotos.' });
          }

          await t.commit();
          res.json({ message: 'Revisão atualizada com sucesso.' });

      } catch (error) {
          await t.rollback();
          handleDatabaseError(res, error, 'enviar/atualizar fotos');
      }
  },

  // 3. EXCLUIR FOTO (POST)
  async deletePhoto(req, res) {
      try {
          const { photoUrl } = req.body;
          const deleted = await models.service_order_photos.destroy({ where: { photo_url: photoUrl } });
          if (!deleted) return res.status(404).json({ message: 'Foto não encontrada.' });
          res.json({ message: 'Foto excluída.' });
      } catch (error) {
          handleDatabaseError(res, error, 'excluir foto');
      }
  }
};