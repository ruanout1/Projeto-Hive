// routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/adminClientController');
const { protect } = require('../middleware/authMiddleware');

// ============================================================================
// ROTAS DE CLIENTES
// ============================================================================

// Estatísticas (dashboard)
router.get('/stats/summary', protect, clientController.getClientStats);

// CRUD básico
router.get('/', protect, clientController.getAllClients);
router.get('/:id', protect, clientController.getClientById);
router.post('/', protect, clientController.createClient);
router.put('/:id', protect, clientController.updateClient);
router.delete('/:id', protect, clientController.deleteClient);

// Ações específicas
router.patch('/:id/toggle-status', protect, clientController.toggleClientStatus);

module.exports = router;