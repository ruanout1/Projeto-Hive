const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/ServiceOrderController');
const { protect } = require('../middleware/authMiddleware'); // ✅ CORRETO
const { checkRole } = require('../middleware/authorizationMiddleware'); // ✅ CORRETO

// Todas as rotas requerem autenticação
router.use(protect);

// GET /api/service-orders/stats - Estatísticas
router.get('/stats', checkRole(['admin', 'manager']), serviceOrderController.getStats);

// GET /api/service-orders - Listar ordens
router.get('/', serviceOrderController.getAll);

// GET /api/service-orders/:id - Buscar por ID
router.get('/:id', serviceOrderController.getById);

// POST /api/service-orders - Criar ordem
router.post('/', checkRole(['admin', 'manager']), serviceOrderController.create);

// PUT /api/service-orders/:id - Atualizar ordem
router.put('/:id', checkRole(['admin', 'manager']), serviceOrderController.update);

// DELETE /api/service-orders/:id - Excluir ordem
router.delete('/:id', checkRole(['admin']), serviceOrderController.delete);

module.exports = router;