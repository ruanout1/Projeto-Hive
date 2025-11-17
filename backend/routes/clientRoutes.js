const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController'); 
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// 2. APLIQUE OS MIDDLEWARES AQUI
// Isso garante que *todas* as rotas abaixo:
// 1. Exigem que o usuário esteja logado (protect)
// 2. Exigem que o usuário seja 'admin' OU 'manager' (checkRole)
router.use(protect, checkRole(['admin', 'manager']));

// =====================
// ROTAS DOS CLIENTES
// =====================

// 3. Limpe os prefixos das rotas (agora o prefixo /clients vai ficar no app.js)
// (GET /api/clients/stats)
router.get('/stats', clientController.getClientsStats);

// (GET /api/clients)
router.get('/', clientController.getClients);

// (GET /api/clients/:id)
router.get('/:id', clientController.getClientById);

// (POST /api/clients)
router.post('/', clientController.createClient);

// (PUT /api/clients/:id)
router.put('/:id', clientController.updateClient);

// (PUT /api/clients/:id/status)
router.put('/:id/status', clientController.toggleClientStatus);

// (GET /api/clients/filter/area) - Esta rota pode ser removida ou simplificada, já que getClients fará o filtro
// router.get('/filter/area', clientController.getClientsByArea);

// (GET /api/clients/search) - Também pode ser removida se a rota principal (/) aceitar query params
// router.get('/search', clientController.searchClients);

// (POST /api/clients/:id/locations)
router.post('/:id/locations', clientController.addClientLocation);

// (PUT /api/clients/:id/locations/:locationId)
router.put('/:id/locations/:locationId', clientController.updateClientLocation);

// (DELETE /api/clients/:id/locations/:locationId)
router.delete('/:id/locations/:locationId', clientController.removeClientLocation);

// =====================
// ROTA AUXILIAR PARA FORMULÁRIOS
// =====================
// (GET /api/clients/list/my-area)
router.get(
  '/list/my-area', 
  protect, 
  checkRole(['manager']), // Apenas gestores usam esta
  clientController.getManagerClientsList
);


module.exports = router;


