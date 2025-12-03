const express = require('express');
const router = express.Router();

// CORREÇÃO 1: Caminho correto para voltar apenas uma pasta
const ServiceRequestController = require('../controllers/ServiceRequestController');
const { protect } = require('../middleware/authMiddleware');

// Proteção Global (Login obrigatório)
router.use(protect);

// Rotas

// 1. Listar (A inteligência de filtrar se é Cliente ou Gestor está dentro do Controller)
router.get('/', ServiceRequestController.listRequests);

// 2. Criar
router.post('/', ServiceRequestController.createRequest);

// 3. Atualizar Status
router.put('/:id/status', ServiceRequestController.updateStatus);

// 4. Deletar
router.delete('/:id', ServiceRequestController.deleteRequest);

module.exports = router;