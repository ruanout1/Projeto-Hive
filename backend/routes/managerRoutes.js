const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

// =====================
// ROTAS DO DASHBOARD
// =====================
// GET /api/manager/dashboard/stats
router.get('/dashboard/stats', managerController.getDashboardStats);
// GET /api/manager/requests/active
router.get('/requests/active', managerController.getActiveRequests);

// =====================
// ROTAS DAS SOLICITAÇÕES DE SERVIÇO
// =====================

// ESTATÍSTICAS DO GESTOR
router.get('/service-requests/stats', managerController.getServiceRequestsStats);

// LISTAGEM DE SOLICITAÇÕES
router.get('/service-requests', managerController.getServiceRequests);
router.get('/service-requests/:id', managerController.getServiceRequestById);

// AÇÕES DO GESTOR
router.put('/service-requests/:id/accept', managerController.acceptServiceRequest);
router.put('/service-requests/:id/refuse', managerController.refuseServiceRequest);

// FILTROS E BUSCA
router.get('/service-requests/filter/area', managerController.getRequestsByArea);
router.get('/service-requests/search', managerController.searchServiceRequests);

// =====================
// ROTAS DOS CLIENTES
// =====================

// ESTATÍSTICAS DE CLIENTES
router.get('/clients/stats', managerController.getClientsStats);

// LISTAGEM DE CLIENTES
router.get('/clients', managerController.getClients);
router.get('/clients/:id', managerController.getClientById);

// CRUD DE CLIENTES (SEM EXCLUIR)
router.post('/clients', managerController.createClient);
router.put('/clients/:id', managerController.updateClient);
router.put('/clients/:id/status', managerController.toggleClientStatus);

// FILTROS E BUSCA DE CLIENTES
router.get('/clients/filter/area', managerController.getClientsByArea);
router.get('/clients/search', managerController.searchClients);

// GERENCIAMENTO DE UNIDADES/LOCALIZAÇÕES
router.post('/clients/:id/locations', managerController.addClientLocation);
router.put('/clients/:id/locations/:locationId', managerController.updateClientLocation);
router.delete('/clients/:id/locations/:locationId', managerController.removeClientLocation);

// =====================
// ROTAS DO CONTROLE DE PONTO (NOVA TELA)
// =====================

// ESTATÍSTICAS E LISTAGEM
router.get('/time-records/stats', managerController.getTimeRecordsStats);
router.get('/time-records', managerController.getTimeRecords);
router.get('/time-records/teams', managerController.getManagerTeams);

// DETALHES E AÇÕES
router.get('/time-records/:id', managerController.getTimeRecordById);
router.post('/time-records/:id/justify', managerController.justifyTimeRecord);

// RELATÓRIOS E EXPORTAÇÃO
router.post('/time-records/export', managerController.exportTimeRecords);
router.post('/time-records/export/preview', managerController.previewTimeRecordsExport);

module.exports = router;