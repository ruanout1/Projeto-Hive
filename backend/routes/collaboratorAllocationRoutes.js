const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/collaboratorAllocationController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DE ALOCAÇÕES DE COLABORADORES
// =====================

// Proteger TODAS as rotas. Apenas Admins e Gestores podem ver.
router.use(protect, checkRole(['admin', 'manager']));

// GET /api/allocations/stats
router.get('/stats', allocationController.getAllocationStats);

// GET /api/allocations
router.get('/', allocationController.getAllocations);

// POST /api/allocations
router.post('/', allocationController.createAllocation);

// PUT /api/allocations/:id
router.put('/:id', allocationController.updateAllocation);

// PUT /api/allocations/:id/cancel (Soft Delete)
router.put('/:id/cancel', allocationController.cancelAllocation);

module.exports = router;