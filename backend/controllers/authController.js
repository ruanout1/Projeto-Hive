const User = require('../models/User'); // <<< ALTERAÇÃO REVERTIDA
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id, user_type) => {
  const secret = process.env.JWT_SECRET || 'um-salvador-puro-eterno-glorioso-sempre-reinara-&&&@!@!@***§§§';
  return jwt.sign(
    { id, user_type },
    secret,
    { expiresIn: '1d' }
  );
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça e-mail e senha' });
    }
    
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ message: 'Esta conta está desativada.' });
    }

    const token = generateToken(user.user_id, user.user_type);

    res.status(200).json({
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        type: user.user_type,
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      console.log('====================================');
      console.log('📧 SIMULANDO ENVIO DE E-MAIL 📧');
      console.log(`Para: ${user.email}`);
      console.log(`Link de reset (simulado): /reset-password?token=${resetToken}`);
      console.log('====================================');
    }
    
    res.status(200).json({ 
      message: 'Se este e-mail estiver em nosso sistema, um link de redefinição foi enviado.' 
    });

  } catch (error) {
    console.error('Erro no forgotPassword:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json(req.user);
};