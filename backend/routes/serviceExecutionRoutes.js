const express = require('express');
const router = express.Router();
const serviceExecutionController = require('../controllers/serviceExecutionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // NOVO: Importar middleware de upload

// ... (rotas GET /my-services e PUT /:id/status permanecem as mesmas)

/**
 * @swagger
 * /api/service-execution/my-services:
 *   get:
 *     summary: Lista os serviços agendados para o colaborador autenticado
 *     // ... (swagger docs)
 */
router.get(
    '/my-services',
    protect,
    serviceExecutionController.getMyScheduledServices 
);

/**
 * @swagger
 * /api/service-execution/{id}/status:
 *   put:
 *     summary: Atualiza o status de um serviço em execução
 *     // ... (swagger docs)
 */
router.put(
    '/:id/status',
    protect,
    serviceExecutionController.updateServiceStatus
);

/**
 * @swagger
 * /api/service-execution/{id}/photos:
 *   post:
 *     summary: Faz o upload de fotos para um serviço (antes/depois)
 *     tags: [ServiceExecution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do Serviço Agendado
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo_type:
 *                 type: string
 *                 enum: [before, after]
 *                 description: O tipo das fotos sendo enviadas.
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Arquivos de imagem para upload (até 5 por vez).
 *     responses:
 *       201:
 *         description: Fotos enviadas com sucesso.
 *       400:
 *         description: Nenhum arquivo enviado ou tipo de foto inválido.
 *       403:
 *         description: Usuário não tem permissão para este serviço.
 *       404:
 *         description: Serviço não encontrado.
 */
router.post(
    '/:id/photos',
    protect,
    upload.array('photos', 5), // Middleware do Multer para processar até 5 arquivos no campo 'photos'
    serviceExecutionController.uploadServicePhotos
);


module.exports = router;
