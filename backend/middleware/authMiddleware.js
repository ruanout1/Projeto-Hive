const jwt = require('jsonwebtoken');
// Importa do seu arquivo central de conexão
const { models } = require('../database/connection'); 

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const user = await models.users.findByPk(decoded.id, {
        attributes: ['user_id', 'full_name', 'email', 'role_key', 'is_active']
      });

      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'Não autorizado ou usuário inativo' });
      }

      req.user = {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role_key: user.role_key,
        role: user.role_key // Alias
      };

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  } else {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
};

// A FUNÇÃO QUE FALTAVA
exports.authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = (req.user.role_key || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acesso negado. Perfil '${userRole}' não tem permissão.` 
      });
    }
    next();
  };
};