const ScheduledService = require('../models/ScheduledService');
const ServiceRequest = require('../models/ServiceRequest');
const Client = require('../models/Client');
const ServiceCatalog = require('../models/ServiceCatalog');
const User = require('../models/User'); 
const ServicePhoto = require('../models/ServicePhoto'); // NOVO: Importar modelo de fotos
const { handleDatabaseError } = require('../utils/errorHandling');

// ... (getMyScheduledServices e updateServiceStatus permanecem os mesmos)

/**
 * @desc    Lista os serviços agendados para o colaborador autenticado.
 * @route   GET /api/service-execution/my-services
 * @access  Private (Collaborator)
 */
exports.getMyScheduledServices = async (req, res) => {
  // ... (código existente)
};

/**
 * @desc    Atualiza o status de um serviço (em andamento, concluído, etc.)
 * @route   PUT /api/service-execution/:id/status
 * @access  Private (Collaborator)
 */
exports.updateServiceStatus = async (req, res) => {
    // ... (código existente)
};

/**
 * @desc    Upload de fotos para um serviço agendado (antes/depois)
 * @route   POST /api/service-execution/:id/photos
 * @access  Private (Collaborator)
 */
exports.uploadServicePhotos = async (req, res) => {
  const { id: scheduledServiceId } = req.params;
  const { photo_type } = req.body; // 'before' ou 'after'
  const { id: userId, user_type: userType } = req.user;

  // 1. Validação básica
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Nenhum arquivo de foto foi enviado.' });
  }
  if (!['before', 'after'].includes(photo_type)) {
    return res.status(400).json({ message: 'O tipo da foto (photo_type) é inválido. Use \'before\' ou \'after\'.' });
  }

  try {
    // 2. Verificar se o serviço existe e pertence ao colaborador
    const service = await ScheduledService.findByPk(scheduledServiceId);
    if (!service) {
      return res.status(404).json({ message: 'Serviço agendado não encontrado.' });
    }
    if (userType === 'collaborator' && service.collaborator_user_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para enviar fotos para este serviço.' });
    }

    // 3. Preparar registros para o banco de dados
    const photoRecords = req.files.map(file => ({
      scheduled_service_id: scheduledServiceId,
      // A URL será o caminho relativo a partir da pasta 'public'
      image_url: `/uploads/${file.filename}`,
      photo_type: photo_type,
    }));

    // 4. Salvar as fotos no banco de dados
    const newPhotos = await ServicePhoto.bulkCreate(photoRecords);

    res.status(201).json({ 
      message: `${newPhotos.length} foto(s) enviada(s) com sucesso!`,
      photos: newPhotos 
    });

  } catch (error) {
    // Em caso de erro, seria bom deletar os arquivos que já foram salvos no disco,
    // mas para manter simples, vamos apenas logar o erro.
    console.error('Erro ao salvar fotos do serviço:', error);
    handleDatabaseError(res, error, 'enviar as fotos do serviço');
  }
};
