/**
 * Middleware de autorização por role
 * Verifica se o usuário autenticado possui uma das roles permitidas
 *
 * @param {Array<string>} roles - Array de roles permitidas (ex: ['admin', 'manager', 'client'])
 * @returns {Function} Middleware function
 *
 * Roles disponíveis no sistema:
 * - 'admin': Administrador do sistema
 * - 'manager': Gestor de área/equipe
 * - 'client': Cliente (usuário de empresa cliente)
 * - 'collaborator': Colaborador (técnico de campo)
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    const role = req.user?.role_key;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        message: 'Acesso negado. Você não tem permissão para executar esta ação.'
      });
    }

    next();
  };
};

module.exports = { checkRole };