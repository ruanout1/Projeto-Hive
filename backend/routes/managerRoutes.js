const express = require('express');
const router = express.Router();

// Importando os controllers
const scheduleController = require('../controllers/scheduleController');
const serviceRequestController = require('../controllers/serviceRequestController');
const clientController = require('../controllers/clientController');
const timeClockController = require('../controllers/timeClockController');
const dashboardController = require('../controllers/dashboardController');
const teamController = require('../controllers/teamController');

// CORREÇÃO CRÍTICA: Importando os middlewares do local correto
const { protect, restrictTo } = require('../middleware/authMiddleware');

// =========================================================================
// APLICAÇÃO GLOBAL DE MIDDLEWARES
// Todas as rotas definidas abaixo serão protegidas e restritas a 'manager'
// =========================================================================
router.use(protect);
router.use(restrictTo('manager'));

// =====================
// ROTAS DO DASHBOARD
// =====================
// A rota /manager/dashboard/stats será tratada pelo controller do dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/requests/active', serviceRequestController.getActiveRequests);
router.get('/teams', teamController.getManagerTeams); 

// =====================
// ROTAS DA AGENDA PESSOAL
// =====================
router.get('/schedule/stats', scheduleController.getScheduleStats);
router.get('/schedule', scheduleController.getSchedule);
router.get('/schedule/:id', scheduleController.getScheduleItemById);
router.get('/schedule/filter/date', scheduleController.getScheduleByDate);
router.get('/schedule/filter/type', scheduleController.getScheduleByType);
router.get('/schedule/filter/status', scheduleController.getScheduleByStatus);
router.post('/schedule', scheduleController.createScheduleItem);
router.put('/schedule/:id', scheduleController.updateScheduleItem);
router.put('/schedule/:id/status', scheduleController.updateScheduleItemStatus);
router.delete('/schedule/:id', scheduleController.deleteScheduleItem);
router.get('/schedule/:id/conflicts', scheduleController.checkScheduleConflicts);

// =====================
// ROTAS DAS SOLICITAÇÕES DE SERVIÇO
// =====================
router.get('/service-requests/stats', serviceRequestController.getServiceRequestsStats);
router.get('/service-requests', serviceRequestController.getServiceRequests);
router.get('/service-requests/:id', serviceRequestController.getServiceRequestById);
router.put('/service-requests/:id/accept', serviceRequestController.acceptServiceRequest);
router.put('/service-requests/:id/refuse', serviceRequestController.refuseServiceRequest);
router.get('/service-requests/filter/area', serviceRequestController.getRequestsByArea);
router.get('/service-requests/search', serviceRequestController.searchServiceRequests);

// =====================
// ROTAS DOS CLIENTES
// =====================
router.get('/clients/stats', clientController.getClientsStats);
router.get('/clients', clientController.getClients);
router.get('/clients/:id', clientController.getClientById);
router.post('/clients', clientController.createClient);
router.put('/clients/:id', clientController.updateClient);
router.put('/clients/:id/status', clientController.toggleClientStatus);
router.post('/clients/:id/locations', clientController.addClientLocation);
router.put('/clients/:id/locations/:locationId', clientController.updateClientLocation);
router.delete('/clients/:id/locations/:locationId', clientController.removeClientLocation);

// =====================
// ROTAS DO CONTROLE DE PONTO
// =====================
router.get('/time-records/stats', timeClockController.getTimeRecordsStats);
router.get('/time-records', timeClockController.getTimeRecords);
router.get('/time-records/teams', timeClockController.getManagableTeams);
router.get('/time-records/:id', timeClockController.getTimeRecordById);
router.post('/time-records/:id/justify', timeClockController.justifyTimeRecord);
router.post('/time-records/export', timeClockController.exportTimeRecords);
router.post('/time-records/export/preview', timeClockController.previewTimeRecordsExport);

module.exports = router;
