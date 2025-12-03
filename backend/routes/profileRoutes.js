const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// =============================================
// ROTAS DE PERFIL DO USUÁRIO
// Todas protegidas (requer autenticação)
// =============================================

// Buscar meu perfil
router.get('/', protect, profileController.getMyProfile);

// Atualizar meu perfil
router.put('/', protect, profileController.updateMyProfile);

// Alterar minha senha
router.put('/password', protect, profileController.changePassword);

// Atualizar minha foto
router.put('/avatar', protect, profileController.updateAvatar);

module.exports = router;