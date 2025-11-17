const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// =====================
// ROTAS DE AUTENTICAÇÃO
// =====================

// (POST /api/auth/login)
// Rota pública para o usuário enviar e-mail/senha e receber o token.
router.post('/login', authController.login);

// (POST /api/auth/forgot-password)
// Rota pública para solicitar a redefinição de senha.
router.post('/forgot-password', authController.forgotPassword);

// (GET /api/auth/me)
// Rota privada. O frontend usa isso para verificar se o token
// salvo no localStorage ainda é válido (ex: ao recarregar a página).
// O 'protect' é o "segurança" que verifica o crachá (token).
router.get('/me', protect, authController.getMe);

module.exports = router;