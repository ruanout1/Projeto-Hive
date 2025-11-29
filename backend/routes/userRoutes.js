const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/authorizationMiddleware');

// ===================================
// ROTAS DE USUÁRIOS
// ===================================

// Proteção global: Todas as rotas abaixo exigem login
router.use(protect);

// --- ROTAS IMPLEMENTADAS (ATIVAS) ---

// GET /api/users
// Lista todos os usuários (Apenas Admin e Gestor)
if (userController.getAllUsers) {
    router.get('/', checkRole(['admin', 'manager']), userController.getAllUsers);
}

// POST /api/users
// Cria um novo usuário (Apenas Admin)
if (userController.createUser) {
    router.post('/', checkRole(['admin']), userController.createUser);
}

// --- ROTAS PENDENTES (COMENTADAS PARA NÃO QUEBRAR O SERVIDOR) ---
// Descomente estas linhas conforme for implementando as funções no userController.js

/*
// PUT /api/users/:id - Atualizar
router.put('/:id', checkRole(['admin']), userController.updateUser);

// DELETE /api/users/:id - Deletar
router.delete('/:id', checkRole(['admin']), userController.deleteUser);

// PATCH /api/users/:id/toggle-status - Ativar/Desativar
router.patch('/:id/toggle-status', checkRole(['admin']), userController.toggleUserStatus);

// GET /api/users/managers - Listar Gestores
router.get('/managers', checkRole(['admin']), userController.getAvailableManagers);

// GET /api/users/staff - Listar Colaboradores
router.get('/staff', checkRole(['admin']), userController.getAvailableStaff);
*/

module.exports = router;