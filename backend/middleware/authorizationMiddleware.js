const checkRole = (roles) => {
  return (req, res, next) => {
    const role = req.user?.role_key || req.user?.user_type; // compat: aceita os dois

    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        message: 'Acesso negado. Você não tem permissão para executar esta ação.'
      });
    }

    next();
  };
};

module.exports = { checkRole };