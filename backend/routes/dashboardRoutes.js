const express = require('express');
const router = express.Router();
const { getCollaboratorDashboard, getManagerDashboard } = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Rota para o dashboard do Colaborador
// Acessível apenas para usuários autenticados com o tipo 'collaborator'
router.route('/collaborator').get(protect, restrictTo('collaborator'), getCollaboratorDashboard);

// Rota para o dashboard do Gestor
// Acessível apenas para usuários autenticados com o tipo 'manager'
router.route('/manager').get(protect, restrictTo('manager'), getManagerDashboard);

module.exports = router;
