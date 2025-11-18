// ==============================================
// 📡 Comunicação Controller (modo mock / híbrido)
// ==============================================

console.log("⚙️ [Communication Controller] Ativado (modo mock).");

// Armazena as conversas e mensagens na memória (simulação)
let conversations = [
  {
    id: 1,
    participants: [1, 2], // Exemplo: cliente 1 e gestor 2
    lastMessage: "Olá, como posso ajudar?",
    updatedAt: new Date(),
  }
];

let messages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    receiverId: 1,
    content: "Olá, como posso ajudar?",
    createdAt: new Date(),
  }
];

// ==============================================
// 🔹 Obter todas as conversas de um usuário
// GET /api/communication/conversations/:userId
// ==============================================
exports.getUserConversations = (req, res) => {
  const userId = parseInt(req.params.userId);
  const userConversations = conversations.filter(conv =>
    conv.participants.includes(userId)
  );

  res.status(200).json(userConversations);
};

// ==============================================
// 🔹 Obter mensagens de uma conversa
// GET /api/communication/messages/:conversationId
// ==============================================
exports.getConversationMessages = (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  const conversationMessages = messages.filter(
    msg => msg.conversationId === conversationId
  );

  res.status(200).json(conversationMessages);
};

// ==============================================
// 🔹 Enviar nova mensagem
// POST /api/communication/messages
// ==============================================
exports.sendMessage = (req, res) => {
  console.log("📩 Requisição recebida:", req.body);
  const { conversationId, senderId, receiverId, content } = req.body;

  if (!content || !senderId || !receiverId) {
    return res.status(400).json({ message: "Campos obrigatórios ausentes." });
  }

  // Se a conversa não existe, cria uma nova
  let conversation = conversations.find(conv => conv.id === conversationId);
  if (!conversation) {
    conversation = {
      id: conversations.length + 1,
      participants: [senderId, receiverId],
      lastMessage: content,
      updatedAt: new Date(),
    };
    conversations.push(conversation);
  } else {
    conversation.lastMessage = content;
    conversation.updatedAt = new Date();
  }

  // Cria e adiciona a nova mensagem
  const newMessage = {
    id: messages.length + 1,
    conversationId: conversation.id,
    senderId,
    receiverId,
    content,
    createdAt: new Date(),
  };

  messages.push(newMessage);

  res.status(201).json({
    message: "Mensagem enviada com sucesso!",
    data: newMessage
  });
};

// ==============================================
// 🔹 Resetar dados (para testes de integração)
// ==============================================
exports.resetMockData = (req, res) => {
  conversations = [];
  messages = [];
  res.json({ message: "Mocks resetados." });
};


