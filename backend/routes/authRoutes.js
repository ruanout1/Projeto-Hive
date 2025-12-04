const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ===================================
// ROTAS DE AUTENTICAÇÃO
// ===================================

// Rota de Login (Pública)
// Verifica se authController.login existe antes de passar
if (authController.login) {
    router.post('/login', authController.login);
} else {
    console.error("❌ ERRO: Função 'login' não encontrada no authController");
}

// Rota de Esqueci a Senha (Pública)
// Se você manteve a função forgotPassword no controller, descomente abaixo:
if (authController.forgotPassword) {
    router.post('/forgot-password', authController.forgotPassword);
}

// Rota "Quem sou eu" (Protegida)
// Retorna os dados do usuário logado baseado no token
if (authController.getMe) {
    router.get('/me', protect, authController.getMe);
} else {
    console.error("❌ ERRO: Função 'getMe' não encontrada no authController");
}

module.exports = router;