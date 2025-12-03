const express = require('express');
const router = express.Router();
const TeamMemberController = require('../controllers/teamMemberController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Rotas diretas pelo ID do membro (relacionamento)
router.delete('/:id', TeamMemberController.removeMember);
router.put('/:id/role', TeamMemberController.updateMemberRole);

module.exports = router;