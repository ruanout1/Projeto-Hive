const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DO DASHBOARD
// =====================

// Proteger TODAS as rotas do Dashboard.
// Apenas Admins e Gestores podem ver.
router.use(protect, checkRole(['admin', 'manager']));

// (GET /api/dashboard/stats)
router.get('/stats', dashboardController.getDashboardStats);

// (GET /api/dashboard/active-requests)
// (Rota antiga era: /api/manager/requests/active)
router.get('/active-requests', dashboardController.getActiveRequests);

module.exports = router;