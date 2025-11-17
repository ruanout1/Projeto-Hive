const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DAS SOLICITAÇÕES DE SERVIÇO
// =====================

// Proteger TODAS as rotas.
// Apenas Admins e Gestores podem gerenciar solicitações.
router.use(protect, checkRole(['admin', 'manager']));

// ESTATÍSTICAS
// (GET /api/service-requests/stats)
router.get('/stats', serviceRequestController.getServiceRequestsStats);

// LISTAGEM DE SOLICITAÇÕES
// (GET /api/service-requests)
router.get('/', serviceRequestController.getServiceRequests);
// (GET /api/service-requests/:id)
router.get('/:id', serviceRequestController.getServiceRequestById);

// AÇÕES
// (PUT /api/service-requests/:id/accept)
router.put('/:id/accept', serviceRequestController.acceptServiceRequest);
// (PUT /api/service-requests/:id/refuse)
router.put('/:id/refuse', serviceRequestController.refuseServiceRequest);

// FILTROS E BUSCA
// (GET /api/service-requests/filter/area)
router.get('/filter/area', serviceRequestController.getRequestsByArea);
// (GET /api/service-requests/search)
router.get('/search', serviceRequestController.searchServiceRequests);

module.exports = router;