const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');

// Conversas
router.get('/conversations/:userId', communicationController.getUserConversations);

// Mensagens
router.get('/messages/:conversationId', communicationController.getConversationMessages);
router.post('/messages', communicationController.sendMessage);

// Reset mock
router.post('/reset', communicationController.resetMockData);

module.exports = router;
