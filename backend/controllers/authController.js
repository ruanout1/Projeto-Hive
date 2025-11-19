const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para o token de "esqueci a senha"
const Client = require('../models/Client');

// Função auxiliar para gerar o token (o "crachá")
const generateToken = (id, user_type) => {
  // Puxa o segredo do seu arquivo .env
  // Se não encontrar, usa um segredo temporário (NÃO FAÇA ISSO EM PRODUÇÃO)
  const secret = process.env.JWT_SECRET || 'um-salvador-puro-eterno-glorioso-sempre-reinara-&&&@!@!@***§§§';
  
  return jwt.sign(
    { id, user_type }, // O que vai dentro do "crachá"
    secret,
    { expiresIn: '1d' } // Validade do "crachá"
  );
};

// ===================================
// POST /api/auth/login
// ===================================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Achar o usuário
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, forneça e-mail e senha' });
    }
    // Procura o usuário no banco pelo e-mail
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Nota: Mesma mensagem de erro para não vazar informação
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }

    // 2. Checar a senha
    // Compara a senha digitada (password) com a hash salva no banco (user.password_hash)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos' });
    }
    
    // 3. Checar se o usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({ message: 'Esta conta está desativada.' });
    }

    // 4. Gerar o token
    const token = generateToken(user.user_id, user.user_type);

    // 5. Enviar o token e dados do usuário de volta
    res.status(200).json({
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        type: user.user_type,
        avatar_url: user.avatar_url, // Se você tiver este campo
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// ===================================
// POST /api/auth/forgot-password
// ===================================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // IMPORTANTE: Prática de Segurança
    // Nós NUNCA dizemos ao frontend se o e-mail foi encontrado ou não.
    // Se o usuário existir, nós "simulamos" o trabalho.
    if (user) {
      // 1. Gerar um token de redefinição (simples, só para o log)
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // TODO (Futuro): Salvar o HASH do token e a expiração no usuário
      // await user.update({ 
      //   reset_token_hash: crypto.createHash('sha256').update(resetToken).digest('hex'),
      //   reset_token_expires: Date.now() + 3600000 // 1 hora
      // });

      // 3. Simular o envio do e-mail (para o console do backend)
      //    Em um app real, aqui você usaria o Nodemailer
      console.log('====================================');
      console.log('📧 SIMULANDO ENVIO DE E-MAIL 📧');
      console.log(`Para: ${user.email}`);
      console.log(`Link de reset (simulado): /reset-password?token=${resetToken}`);
      console.log('====================================');
    }
    
    // 4. Sempre retorne sucesso!
    res.status(200).json({ 
      message: 'Se este e-mail estiver em nosso sistema, um link de redefinição foi enviado.' 
    });

  } catch (error) {
    console.error('Erro no forgotPassword:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// ===================================
// GET /api/auth/me
// ===================================
exports.getMe = async (req, res) => {
  // O middleware 'protect' (que está em authMiddleware.js)
  // já fez o trabalho de verificar o token e buscar o usuário.
  // Ele colocou o usuário em 'req.user'.
  // Nós apenas retornamos os dados do usuário que o 'protect' encontrou.
  res.status(200).json(req.user);
};