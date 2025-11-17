const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController'); // MUDOU
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DA AGENDA PESSOAL DO GESTOR
// =====================

// APLICAR MIDDLEWARES AQUI
// 1. 'protect' - Garante que o usuário está logado.
// 2. 'checkRole(['manager'])' - Garante que SÓ gestores acessem.
// Isso protege TODAS as rotas deste arquivo.
router.use(protect, checkRole(['manager']));

// ESTATÍSTICAS DA AGENDA
// (Caminho antigo: /api/manager/schedule/stats)
// (Caminho novo: GET /api/schedule/stats)
router.get('/stats', scheduleController.getScheduleStats);

// LISTAGEM DE AGENDAMENTOS
// (Caminho novo: GET /api/schedule)
router.get('/', scheduleController.getSchedule);
// (Caminho novo: GET /api/schedule/:id)
router.get('/:id', scheduleController.getScheduleItemById);

// FILTROS E BUSCA
// (Caminho novo: GET /api/schedule/filter/date)
router.get('/filter/date', scheduleController.getScheduleByDate);
// (Caminho novo: GET /api/schedule/filter/type)
router.get('/filter/type', scheduleController.getScheduleByType);
// (Caminho novo: GET /api/schedule/filter/status)
router.get('/filter/status', scheduleController.getScheduleByStatus);

// AÇÕES NA AGENDA
// (Caminho novo: POST /api/schedule)
router.post('/', scheduleController.createScheduleItem);
// (Caminho novo: PUT /api/schedule/:id)
router.put('/:id', scheduleController.updateScheduleItem);
// (Caminho novo: PUT /api/schedule/:id/status)
router.put('/:id/status', scheduleController.updateScheduleItemStatus);
// (Caminho novo: DELETE /api/schedule/:id)
router.delete('/:id', scheduleController.deleteScheduleItem);

// CONFLITOS DE AGENDA
// (Caminho novo: GET /api/schedule/:id/conflicts)
router.get('/:id/conflicts', scheduleController.checkScheduleConflicts);


module.exports = router;