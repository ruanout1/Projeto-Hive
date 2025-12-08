// backend\routes\clientRoutes.js - VERSÃO ATUALIZADA

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const { protect } = require('../middleware/authMiddleware');

// Proteção global
router.use(protect);

// ROTAS PÚBLICAS (para cliente logado)
router.get('/my-branches', ClientController.getMyBranches);

// ROTAS DE LEITURA
router.get('/', ClientController.getClients);
router.get('/:id', ClientController.getClientById);

// ROTAS DE ESCRITA (CRUD completo)
router.post('/', ClientController.createClient);
router.put('/:id', ClientController.updateClient);
router.delete('/:id', ClientController.deleteClient);
router.patch('/:id/toggle-status', ClientController.toggleClientStatus);

// ROTAS DE FILIAIS
router.post('/:id/locations', ClientController.addClientLocation);
router.put('/:id/locations/:locationId', ClientController.updateClientLocation);
router.delete('/:id/locations/:locationId', ClientController.removeClientLocation);

module.exports = router;