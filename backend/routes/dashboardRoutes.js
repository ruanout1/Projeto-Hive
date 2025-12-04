const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Todas as rotas de dashboard exigem login
router.use(protect);

// Rota Única e Inteligente
router.get('/', DashboardController.getDashboardData);

module.exports = router;