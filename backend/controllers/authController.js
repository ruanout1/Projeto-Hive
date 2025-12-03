const { models } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// CORREÇÃO AQUI: Mudamos a chave do objeto para 'role_key'
const generateToken = (id, role_key) => {
  return jwt.sign({ id, role_key }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });

    // Busca usuário
    const user = await models.users.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Verifica senha
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Verifica status
    if (!user.is_active) return res.status(403).json({ message: 'Conta desativada' });

    // Atualiza ultimo login
    await user.update({ last_login: new Date() });

    // Gera o token com o nome correto da chave
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
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.getMe = async (req, res) => {
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