const express = require('express');
const router = express.Router();
const timeClockController = require('../controllers/timeClockController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DO CONTROLE DE PONTO
// =====================

// Proteger TODAS as rotas de Ponto.
// Apenas Admins e Gestores podem acessar.
router.use(protect, checkRole(['admin', 'manager']));

// ESTATÍSTICAS E LISTAGEM
// (GET /api/time-clock/stats)
router.get('/stats', timeClockController.getTimeRecordsStats);
// (GET /api/time-clock)
router.get('/', timeClockController.getTimeRecords);
// (GET /api/time-clock/teams)
router.get('/teams', timeClockController.getManagableTeams);

// DETALHES E AÇÕES
// (GET /api/time-clock/:id)
router.get('/:id', timeClockController.getTimeRecordById);
// (POST /api/time-clock/:id/justify)
router.post('/:id/justify', timeClockController.justifyTimeRecord);

// RELATÓRIOS E EXPORTAÇÃO
// (POST /api/time-clock/export)
router.post('/export', timeClockController.exportTimeRecords);
// (POST /api/time-clock/export/preview)
router.post('/export/preview', timeClockController.previewTimeRecordsExport);

module.exports = router;