/*
 * Middleware 'checkRole'
 * 1. Recebe uma lista de papéis (ex: ['admin', 'manager'])
 * 2. Verifica se o 'req.user' (definido pelo 'protect') tem um desses papéis.
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // `req.user` foi definido no middleware `protect`
    if (!req.user || !roles.includes(req.user.user_type)) {
      // Se o usuário não tem o papel (role) correto
      return res.status(403).json({ 
        message: 'Acesso negado. Você não tem permissão para executar esta ação.' 
      });
    }
    // Se ele tem o papel, pode continuar
    next();
  };
};

module.exports = { checkRole };