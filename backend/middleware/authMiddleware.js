const jwt = require('jsonwebtoken');
const { models } = require('../config/database'); // <--- AQUI MUDOU (Usa a conexão central)

exports.protect = async (req, res, next) => {
  let token;

  // 1. Verifica se o header Authorization existe e começa com Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pega o token
      token = req.headers.authorization.split(' ')[1];

      // Decodifica
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // 2. Busca o usuário no banco NOVO (usando models.users)
      // O 'findByPk' é o jeito do Sequelize buscar por ID
      const user = await models.users.findByPk(decoded.id, {
        attributes: ['user_id', 'full_name', 'email', 'role_key', 'is_active']
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado com este token' });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: 'Usuário desativado' });
      }

      // 3. Anexa o usuário na requisição para as próximas rotas usarem
      req.user = {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role_key, // Atenção: no banco novo chama role_key
        is_active: user.is_active
      };

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Não autorizado, token falhou' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};