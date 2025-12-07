// Importa do arquivo central de conexão (conforme você definiu que usaria connection.js)
const { models } = require('../database/connection'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- HELPER: Gerar Token ---
const generateToken = (id, role_key) => {
  // Garante que role_key seja passado, senão o dashboard quebra
  return jwt.sign({ id, role_key }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

// --- FUNÇÃO LOGIN ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }

    // Verifica se os modelos foram carregados corretamente
    if (!models || !models.users) {
        console.error("CRÍTICO: models.users não encontrado no AuthController.");
        return res.status(500).json({ message: 'Erro interno de configuração do banco.' });
    }

    // Busca usuário
    const user = await models.users.findOne({ where: { email } });

    if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verifica senha
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verifica status
    if (!user.is_active) {
        return res.status(403).json({ message: 'Conta desativada' });
    }

    // Atualiza ultimo login
    await user.update({ last_login: new Date() });

    // Gera token
    const token = generateToken(user.user_id, user.role_key);

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role_key,
        avatar: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Erro no servidor durante o login' });
  }
};

// --- FUNÇÃO GET ME ---
const getMe = async (req, res) => {
  try {
      if(!req.user) return res.status(401).json({message: 'Não autenticado'});
      
      const user = await models.users.findByPk(req.user.id, {
          attributes: ['user_id', 'full_name', 'email', 'role_key', 'avatar_url']
      });
      
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

      res.json(user);
  } catch (error) {
      console.error('GetMe Error:', error);
      res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
};

// --- EXPORTAÇÃO SEGURA ---
module.exports = {
    login,
    getMe
};