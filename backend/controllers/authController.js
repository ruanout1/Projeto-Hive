const { User, ClientUser } = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // 'um-salvador-puro-eterno-glorioso-sempre-reinara-&&&@!@!@***§§§';//


// =======================================
// Função para gerar token JWT
// =======================================
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// =======================================
// POST /api/auth/login
// =======================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Por favor, forneça e-mail e senha." });
    }

    // 1. Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "E-mail ou senha inválidos." });
    }

    // 2. Comparar senha com bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "E-mail ou senha inválidos." });
    }

    // 3. Verificar se o usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({ message: "Esta conta está desativada." });
    }

    // 4. Buscar client_user_id se o usuário for cliente
    let client_id = null;

    if (user.role_key === "client") {
      const clientRecord = await ClientUser.findOne({
        where: { user_id: user.user_id }
      });
      client_id = clientRecord ? clientRecord.client_user_id : null;
    }

    // 5. Gerar token JWT
    const token = generateToken({
      id: user.user_id,
      role_key: user.role_key,
      client_id: client_id
    });

    // 6. Resposta
    return res.status(200).json({
      token,
      user: {
        id: user.user_id,
        client_id: client_id,
        name: user.full_name,
        email: user.email,
        type: user.role_key, // Mantém 'type' no response para compatibilidade com frontend
        avatar_url: user.avatar_url || null,
      }
    });

  } catch (err) {
    console.error("erro no login:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// =======================================
// POST /api/auth/forgot-password
// =======================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // nunca revelar se o email existe ou não
    if (user) {
      const resetToken = crypto.randomBytes(20).toString("hex");

      console.log("=== RESET PASSWORD SIMULADO ===");
      console.log(`Usuário: ${email}`);
      console.log(`Token (simulado): ${resetToken}`);
      console.log("===============================");
    }

    return res.status(200).json({
      message: "Se este e-mail estiver cadastrado, você receberá instruções."
    });

  } catch (err) {
    console.error("Erro em forgot-password:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// =======================================
// GET /api/auth/me
// =======================================
exports.getMe = async (req, res) => {
  return res.status(200).json(req.user);
};
