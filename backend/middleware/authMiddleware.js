const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Client = require("../models/Client");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// ======================================================
// 🔐 Middleware de proteção
// ======================================================
exports.protect = async (req, res, next) => {
  let token;

  // 1. Check Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Não autorizado. Token ausente." });
  }

  try {
    // 2. Decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded contém:
    // { id, user_type, client_id }

    // 3. Busca o usuário no banco (garante active e dados atualizados)
    const user = await User.findByPk(decoded.id, {
      attributes: [
        "user_id",
        "full_name",
        "email",
        "avatar_url",
        "user_type",
        "is_active",
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "Usuário desativado. Contate o suporte." });
    }

    // 4. ✅ NOVO: Se for cliente, buscar o client_id automaticamente
    let client_id = decoded.client_id || null;
    
    if (user.user_type === 'client' && !client_id) {
      const client = await Client.findOne({ 
        where: { user_id: user.user_id },
        attributes: ['client_id']
      });
      
      if (client) {
        client_id = client.client_id;
      }
    }

    // 5. Reconstrói req.user com dados completos
    req.user = {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url || null,
      user_type: user.user_type,
      client_id: client_id, // ✅ Agora sempre terá valor para clientes
    };

    return next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};