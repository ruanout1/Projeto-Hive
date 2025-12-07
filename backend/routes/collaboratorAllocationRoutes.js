const express = require('express');
const router = express.Router();
const CollaboratorAllocationController = require('../controllers/collaboratorAllocationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Proteção: Apenas Admin e Gestor podem mexer em alocações
router.use(protect);
router.use(authorize('admin', 'manager')); // 'gestor' se preferir usar o termo em PT

router.get('/', CollaboratorAllocationController.listAllocations);
router.post('/', CollaboratorAllocationController.createAllocation);
router.put('/:id', CollaboratorAllocationController.updateAllocation);
router.delete('/:id', CollaboratorAllocationController.deleteAllocation);

module.exports = router;