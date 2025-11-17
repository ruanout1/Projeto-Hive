const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/serviceCatalogController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DO CATÁLOGO DE SERVIÇOS
// =====================

// Proteger TODAS as rotas. Apenas Admins podem mexer no catálogo.
router.use(protect, checkRole(['admin']));

// --- Categorias ---
// (GET /api/service-catalog/categories)
router.get('/categories', catalogController.getAllCategories);
// (POST /api/service-catalog/categories)
router.post('/categories', catalogController.createCategory);
// (PUT /api/service-catalog/categories/:id)
router.put('/categories/:id', catalogController.updateCategory);
// (DELETE /api/service-catalog/categories/:id)
router.delete('/categories/:id', catalogController.deleteCategory);

// --- Serviços do Catálogo ---
// (GET /api/service-catalog)
router.get('/', catalogController.getAllCatalogServices);
// (POST /api/service-catalog)
router.post('/', catalogController.createCatalogService);
// (PUT /api/service-catalog/:id)
router.put('/:id', catalogController.updateCatalogService);
// (PUT /api/service-catalog/:id/status)
router.put('/:id/status', catalogController.updateCatalogServiceStatus);
// (DELETE /api/service-catalog/:id)
router.delete('/:id', catalogController.deleteCatalogService);

module.exports = router;