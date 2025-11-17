const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// =====================
// ROTAS DE USUÁRIOS
// =====================

// Proteger TODAS as rotas de gerenciamento de usuários.
// Apenas Admins podem gerenciar usuários.
router.use(protect, checkRole(['admin']));

// GET /api/users/managers (Lista gestores para formulários)
router.get('/managers', userController.getAvailableManagers);

// GET /api/users/staff (Lista colaboradores para formulários)
router.get('/staff', userController.getAvailableStaff);

// TODO: Adicione as rotas de CRUD de Usuários
// router.get('/', userController.getAllUsers);
// router.post('/', userController.createUser);
// router.put('/:id', userController.updateUser);

module.exports = router;