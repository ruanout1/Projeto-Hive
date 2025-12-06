const express = require('express');
const router = express.Router();
const PhotoReviewController = require('../controllers/PhotoReviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
// Admin e Gestor podem acessar
router.use(authorize('admin', 'manager'));

router.get('/', PhotoReviewController.listSubmissions);
router.put('/:id/send', PhotoReviewController.sendToClient);
router.post('/photo/delete', PhotoReviewController.deletePhoto); // POST para enviar body com URL

module.exports = router;