// ============================================================================
// AdminDocumentsRoutes.js - Rotas de Documentos COM AUTENTICAÇÃO
// ============================================================================

const express = require('express');
const router = express.Router();
const AdminDocumentsController = require('../controllers/AdminDocumentsController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================================
// TODAS AS ROTAS PROTEGIDAS COM AUTENTICAÇÃO JWT
// ============================================================================

// GET /api/documents/clients - Listar clientes ativos
router.get('/clients', protect, AdminDocumentsController.getClients);

// GET /api/documents/stats - Estatísticas de documentos
router.get('/stats', protect, AdminDocumentsController.getStats);

// GET /api/documents - Listar todos os documentos (com filtros)
router.get('/', protect, AdminDocumentsController.getAll);

// GET /api/documents/:id - Buscar documento por ID
router.get('/:id', protect, AdminDocumentsController.getById);

// POST /api/documents - Criar novo documento
router.post('/', protect, AdminDocumentsController.create);

// PUT /api/documents/:id - Atualizar documento
router.put('/:id', protect, AdminDocumentsController.update);

// PATCH /api/documents/:id/toggle-visibility - Alternar visibilidade
router.patch('/:id/toggle-visibility', protect, AdminDocumentsController.toggleVisibility);

// DELETE /api/documents/:id - Excluir documento
router.delete('/:id', protect, AdminDocumentsController.delete);

module.exports = router;