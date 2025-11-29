exports.checkRole = (roles) => {
    return (req, res, next) => {
      // Se o usuário não estiver logado (erro no middleware anterior)
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
  
      // Verifica se a role_key do usuário está na lista de permitidos
      // Ex: roles pode ser ['admin', 'manager']
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Acesso negado. Sua função (${req.user.role}) não tem permissão.` 
        });
      }
  
      next();
    };
  };