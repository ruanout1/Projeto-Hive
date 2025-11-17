const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DE EQUIPES
// =====================

// GET /api/teams (Admin vê todas, Gestor vê as suas)
router.get('/', protect, checkRole(['admin', 'manager']), teamController.getAllTeams);

// CRUD de Equipes (Apenas Admin)
router.post('/', protect, checkRole(['admin']), teamController.createTeam);
router.put('/:id', protect, checkRole(['admin']), teamController.updateTeam);
router.put('/:id/status', protect, checkRole(['admin']), teamController.updateTeamStatus);
router.delete('/:id', protect, checkRole(['admin']), teamController.deleteTeam);

module.exports = router;