const { models } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });

    // Busca usuário pelo email (Sequelize V6 syntax)
    const user = await models.users.findOne({ where: { email } });

    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Verifica senha
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Credenciais inválidas' });

    // Verifica status ativo
    if (!user.is_active) return res.status(403).json({ message: 'Conta desativada' });

    // Atualiza ultimo login
    await user.update({ last_login: new Date() });

    const token = generateToken(user.user_id, user.role_key);

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role_key, // role_key no lugar de user_type
        avatar: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.getMe = async (req, res) => {
  // O middleware de auth deve colocar req.user
  if(!req.user) return res.status(401).json({message: 'Não autenticado'});
  
  const user = await models.users.findByPk(req.user.id, {
    attributes: ['user_id', 'full_name', 'email', 'role_key']
  });
  
  res.json(user);
};