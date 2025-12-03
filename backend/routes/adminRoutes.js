const express = require('express');
const router = express.Router();
const administratorController = require('../controllers/administratorController');
// const { Servico } = require('../database/db'); // Remover se não for usado

// =====================
// ROTAS DO CATÁLOGO DE SERVIÇOS
// =====================

// CATEGORIAS
router.get('/categories', administratorController.getAllCategories);
router.post('/categories', administratorController.createCategory);
router.put('/categories/:id', administratorController.updateCategory);
router.delete('/categories/:id', administratorController.deleteCategory);

// CATÁLOGO DE SERVIÇOS
router.get('/catalog', administratorController.getAllCatalogServices);
router.post('/catalog', administratorController.createCatalogService);
router.put('/catalog/:id', administratorController.updateCatalogService);
router.put('/catalog/:id/status', administratorController.updateCatalogServiceStatus);
router.delete('/catalog/:id', administratorController.deleteCatalogService);

// ==========================================================
// GERENCIAMENTO DE EQUIPES (TeamManagement)
// ==========================================================

// --- Usuários (para preencher seletores) ---
router.get('/users/managers', administratorController.getAvailableManagers);
router.get('/users/staff', administratorController.getAvailableStaff);

// --- Equipes (CRUD completo) ---
router.get('/teams', administratorController.getAllTeams);
router.post('/teams', administratorController.createTeam);
router.put('/teams/:id', administratorController.updateTeam);
router.put('/teams/:id/status', administratorController.updateTeamStatus);
router.delete('/teams/:id', administratorController.deleteTeam);

// =====================
// ROTAS DAS SOLICITAÇÕES DE SERVIÇO (NOVA TELA - ADMIN)
// =====================

// ESTATÍSTICAS GERAIS
//router.get('/service-requests/stats', administratorController.getServiceRequestsStats);

// LISTAGEM COMPLETA
//router.get('/service-requests', administratorController.getAllServiceRequests);
//router.get('/service-requests/:id', administratorController.getServiceRequestDetails);

// AÇÕES DE DELEGAÇÃO
//router.put('/service-requests/:id/delegate', administratorController.delegateToManager);
//router.put('/service-requests/:id/mark-urgent', administratorController.markAsUrgent);

// GERENCIAMENTO DE NOTAS FISCAIS
//router.post('/service-requests/:id/invoice', administratorController.addInvoice);
//router.put('/service-requests/:id/invoice', administratorController.updateInvoice);
//router.delete('/service-requests/:id/invoice', administratorController.deleteInvoice);
//router.put('/service-requests/:id/invoice/visibility', administratorController.toggleInvoiceVisibility);

// DATAS DISPONÍVEIS
//router.post('/service-requests/:id/available-dates', administratorController.addAvailableDate);
//router.delete('/service-requests/:id/available-dates', administratorController.removeAvailableDate);

// STATUS E AÇÕES GERAIS
//router.put('/service-requests/:id/status', administratorController.updateRequestStatus);
//router.put('/service-requests/:id/reassign', administratorController.reassignRequest);

// FILTROS E RELATÓRIOS
//router.get('/service-requests/filter/status', administratorController.getRequestsByStatus);
//router.get('/service-requests/filter/area', administratorController.getRequestsByManagerArea);
//router.get('/service-requests/search/advanced', administratorController.advancedSearch);

module.exports = router;
