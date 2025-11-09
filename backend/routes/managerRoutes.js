const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { Servico } = require('../models/Servico'); // Verifique se este model ainda é usado ou pode ser removido

// =====================
// ROTAS DO DASHBOARD
// =====================
// GET /api/manager/dashboard/stats
router.get('/dashboard/stats', managerController.getDashboardStats);
// GET /api/manager/requests/active
router.get('/requests/active', managerController.getActiveRequests);

// =====================
// ROTAS DO CATÁLOGO DE SERVIÇOS
// =====================
// GET /api/manager/categories
router.get('/categories', managerController.getAllCategories);
// POST /api/manager/categories
router.post('/categories', managerController.createCategory);
// GET /api/manager/catalog
router.get('/catalog', managerController.getAllCatalogServices);
// POST /api/manager/catalog
router.post('/catalog', managerController.createCatalogService);
// PUT /api/manager/catalog/:id
router.put('/catalog/:id', managerController.updateCatalogService);
// PUT /api/manager/catalog/:id/status
router.put('/catalog/:id/status', managerController.updateCatalogServiceStatus);
// DELETE /api/manager/catalog/:id
router.delete('/catalog/:id', managerController.deleteCatalogService);
// =====================
// ROTAS DO CATÁLOGO DE SERVIÇOS
// =====================
// GET /api/manager/categories
router.get('/categories', managerController.getAllCategories);
// POST /api/manager/categories
router.post('/categories', managerController.createCategory);
// PUT /api/manager/categories/:id  ✅ NOVA ROTA
router.put('/categories/:id', managerController.updateCategory);
// DELETE /api/manager/categories/:id  ✅ NOVA ROTA
router.delete('/categories/:id', managerController.deleteCategory);

// GET /api/manager/catalog
router.get('/catalog', managerController.getAllCatalogServices);
// POST /api/manager/catalog
router.post('/catalog', managerController.createCatalogService);
// PUT /api/manager/catalog/:id
router.put('/catalog/:id', managerController.updateCatalogService);
// PUT /api/manager/catalog/:id/status
router.put('/catalog/:id/status', managerController.updateCatalogServiceStatus);
// DELETE /api/manager/catalog/:id
router.delete('/catalog/:id', managerController.deleteCatalogService);


// ==========================================================
// NOVAS ROTAS - GERENCIAMENTO DE EQUIPES (TeamManagement)
// ==========================================================

// --- Rotas de Usuários (para preencher os seletores) ---

// GET /api/manager/users/managers (Lista gestores disponíveis)
router.get('/users/managers', managerController.getAvailableManagers);

// GET /api/manager/users/staff (Lista colaboradores disponíveis)
router.get('/users/staff', managerController.getAvailableStaff);

// --- Rotas de Equipes (CRUD Completo) ---

// GET /api/manager/teams (Lista todas as equipes com seus gestores e membros)
router.get('/teams', managerController.getAllTeams);

// POST /api/manager/teams (Cria uma nova equipe e associa membros)
router.post('/teams', managerController.createTeam);

// PUT /api/manager/teams/:id (Atualiza uma equipe e seus membros)
router.put('/teams/:id', managerController.updateTeam);

// PUT /api/manager/teams/:id/status (Ativa/Inativa uma equipe)
router.put('/teams/:id/status', managerController.updateTeamStatus);

// DELETE /api/manager/teams/:id (Exclui uma equipe)
router.delete('/teams/:id', managerController.deleteTeam);
// ==========================================================


module.exports = router;