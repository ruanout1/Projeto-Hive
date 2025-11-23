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

// ==========================================
// ROTAS AUXILIARES (já existentes)
// ==========================================

// GET /api/users/managers (Lista gestores para formulários)
router.get('/managers', userController.getAvailableManagers);

// GET /api/users/staff (Lista colaboradores para formulários)
router.get('/staff', userController.getAvailableStaff);

// ==========================================
// ROTAS DE CRUD (NOVAS)
// ==========================================

// GET /api/users - Listar todos os usuários (gestores e colaboradores)
router.get('/', userController.getAllUsers);

// POST /api/users - Criar novo usuário
router.post('/', userController.createUser);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Deletar usuário
router.delete('/:id', userController.deleteUser);

// PATCH /api/users/:id/toggle-status - Ativar/Desativar usuário
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;