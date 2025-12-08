const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// Importar controller
const PhotoHistoryController = require('../controllers/PhotoHistoryController');

// Aplicar autenticação em todas as rotas
router.use(protect);

// Rotas
router.get('/stats', checkRole(['admin', 'manager']), PhotoHistoryController.getStats);
router.get('/:id', checkRole(['admin', 'manager']), PhotoHistoryController.getById);
router.get('/', checkRole(['admin', 'manager']), PhotoHistoryController.getAll);

module.exports = router;