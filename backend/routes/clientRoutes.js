const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController'); // Controller NOVO
const { protect } = require('../middleware/authMiddleware');
// const { checkRole } = require('../middleware/authorizationMiddleware'); // Use se precisar restringir acesso

// ===================================
// ROTAS DE CLIENTES (EMPRESAS)
// ===================================

// Proteção global: Usuário precisa estar logado
router.use(protect);

// --- ROTAS DE LEITURA ---

// GET /api/clients
// Lista clientes com paginação e filtros
if (ClientController.getClients) {
    router.get('/', ClientController.getClients);
}

// GET /api/clients/:id
// Detalhes de um cliente específico + Filiais + Contatos
if (ClientController.getClientById) {
    router.get('/:id', ClientController.getClientById);
}

// --- ROTAS DE ESCRITA ---

// POST /api/clients
// Cria novo cliente (Empresa + Filial Matriz)
if (ClientController.createClient) {
    router.post('/', ClientController.createClient);
}

// PUT /api/clients/:id
// Atualiza dados básicos da empresa
if (ClientController.updateClient) {
    router.put('/:id', ClientController.updateClient);
}

// --- GESTÃO DE FILIAIS (LOCATIONS) ---

// POST /api/clients/:id/locations
// Adiciona nova filial
if (ClientController.addClientLocation) {
    router.post('/:id/locations', ClientController.addClientLocation);
}

// DELETE /api/clients/:id/locations/:locationId
// Remove uma filial (exceto matriz)
if (ClientController.removeClientLocation) {
    router.delete('/:id/locations/:locationId', ClientController.removeClientLocation);
}

router.delete('/:id', ClientController.deleteClient);
router.patch('/:id/toggle-status', ClientController.toggleClientStatus);
// --- ROTAS ANTIGAS (COMENTADAS PARA NÃO QUEBRAR) ---
// Estas funções ainda não foram migradas para o controller novo.
// router.get('/stats', ClientController.getClientsStats); 
// router.get('/list/my-area', ClientController.getManagerClientsList);
// router.patch('/:id/toggle-status', ClientController.toggleClientStatus);

module.exports = router;