const { models } = require('../database/connection'); // Aponta para o seu arquivo central
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role_key) => {
  return jwt.sign({ id, role_key }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

// Note o 'exports.login =' (é isso que o routes procura)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: 'Dados incompletos' });

    const user = await models.users.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    if (!user.is_active) return res.status(403).json({ message: 'Conta inativa' });

    // Atualiza login
    await user.update({ last_login: new Date() });

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

// Note o 'exports.getMe ='
exports.getMe = async (req, res) => {
  try {
      if(!req.user) return res.status(401).json({message: 'Não autenticado'});
      const user = await models.users.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};