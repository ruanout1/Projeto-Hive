const express = require('express');
const router = express.Router();
const { getMySchedule } = require('../controllers/collaboratorScheduleController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// Protege todas as rotas, permitindo acesso apenas a colaboradores logados.
router.use(protect, checkRole(['colaborador']));

// Rota para buscar a agenda pessoal do colaborador
router.get('/my-schedule', getMySchedule);

module.exports = router;