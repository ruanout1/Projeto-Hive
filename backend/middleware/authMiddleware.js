const jwt = require("jsonwebtoken");
const { User, ClientUser } = require("../database/db");

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
    // { id, role_key, client_id }

    // 3. Busca o usuário no banco (garante active e dados atualizados)
    const user = await User.findByPk(decoded.id, {
      attributes: [
        "user_id",
        "full_name",
        "email",
        "avatar_url",
        "role_key",
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

    // 4. Se for cliente, buscar o client_user_id automaticamente
    let client_id = decoded.client_id || null;

    if (user.role_key === 'client' && !client_id) {
      const clientUser = await ClientUser.findOne({
        where: { user_id: user.user_id },
        attributes: ['client_user_id']
      });

      if (clientUser) {
        client_id = clientUser.client_user_id;
      }
    }

    // 5. Reconstrói req.user com dados completos
    req.user = {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url || null,
      role_key: user.role_key,
      client_id: client_id, // Sempre terá valor para clientes
    };

    return next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};