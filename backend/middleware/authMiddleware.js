const jwt = require('jsonwebtoken');

// CORREÇÃO: Importando do arquivo que acabamos de editar (connection.js)
const { models } = require('../database/connection'); 

exports.protect = async (req, res, next) => {
  let token;

  // Verifica se os models carregaram (Debug)
  if (!models || !models.users) {
      console.error("❌ [AuthMiddleware] Erro Crítico: 'models.users' não está definido. Verifique database/connection.js");
      return res.status(500).json({ message: 'Erro interno de configuração do servidor.' });
  }

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Busca o usuário
      const user = await models.users.findByPk(decoded.id, {
        attributes: ['user_id', 'full_name', 'email', 'role_key', 'is_active']
      });

      if (!user) {
        return res.status(401).json({ message: 'Token válido, mas usuário não encontrado.' });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: 'Usuário desativado.' });
      }

      // Injeta o usuário na requisição
      req.user = {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role_key: user.role_key, 
        role: user.role_key, // Alias para compatibilidade
        is_active: user.is_active
      };

      next();
    } catch (error) {
      console.error("Erro de Token:", error.message);
      return res.status(401).json({ message: 'Não autorizado, token inválido.' });
    }
  } else {
    return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
  }
};

// Função de permissão por cargo
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = (req.user.role_key || req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acesso negado. Perfil '${userRole}' não tem permissão.` 
      });
    }
    next();
  };
};