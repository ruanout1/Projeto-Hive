const express = require('express');
const router = express.Router();
const ServiceCatalogController = require('../controllers/serviceCatalogController');
const { protect } = require('../middleware/authMiddleware');
// const { checkRole } = require('../middleware/authorizationMiddleware'); // Use se quiser restringir a Admin

// Proteção Global
router.use(protect);

// --- CATEGORIAS ---
router.get('/categories', ServiceCatalogController.getAllCategories);
router.post('/categories', ServiceCatalogController.createCategory);
router.put('/categories/:id', ServiceCatalogController.updateCategory);
router.delete('/categories/:id', ServiceCatalogController.deleteCategory);

// --- SERVIÇOS ---
router.get('/', ServiceCatalogController.getAllCatalogServices);
router.post('/', ServiceCatalogController.createCatalogService);
router.put('/:id', ServiceCatalogController.updateCatalogService);
router.put('/:id/status', ServiceCatalogController.updateCatalogServiceStatus);
router.delete('/:id', ServiceCatalogController.deleteCatalogService);

module.exports = router;