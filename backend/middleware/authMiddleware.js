const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importe seu model User
// const ManagerArea = require('../models/ManagerArea'); // Descomente se tiver um model separado para areas
// const db = require('../db/connection'); // Ou use a conexão direta

/*
 * Middleware 'protect'
 * 1. Verifica se o token JWT existe e é válido.
 * 2. Busca o usuário no banco.
 * 3. Anexa o usuário ao 'req.user' para ser usado nas próximas rotas.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Pega o token do header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifica o token
      // Lembre-se de criar uma JWT_SECRET no seu .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'um-salvador-puro-eterno-glorioso-sempre-reinara-&&&@!@!@***§§§');

      // 3. Busca o usuário no banco
      // IMPORTANTE: Inclua os campos que você usa para permissão
      const user = await User.findByPk(decoded.id, {
        attributes: [
          'user_id',
          'role_key', // ✅ MUDANÇA: user_type → role_key
          'full_name',
          'email', // ✅ ADICIONADO: útil para logs
          'phone', // ✅ ADICIONADO: pode ser útil
          'avatar_url', // ✅ ADICIONADO: para exibir foto
          'is_active',
          'last_login' // ✅ ADICIONADO: útil para auditoria
        ],
        // Se 'area' não estiver no User, você precisa buscá-la. Ex:
        // include: [{ model: ManagerArea, attributes: ['area_id'] }]
      });
      
      if (!user || !user.is_active) {
         return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
      }

      // 4. Anexa o usuário ao req
      req.user = user.toJSON();
      
      // ✅ AJUSTE: Verificar role_key em vez de user_type
      if (req.user.role_key === 'manager' && !req.user.area) {
        // TODO: Buscar área real do gestor da tabela manager_areas
        // const managerAreas = await ManagerArea.findAll({
        //   where: { manager_user_id: req.user.user_id },
        //   include: [{ model: Area, attributes: ['name'] }]
        // });
        // req.user.areas = managerAreas.map(ma => ma.area.name);
        req.user.area = 'area_gestor_mock'; // Substituir pela busca real
      }
      
      next();

    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      
      // ✅ MELHORIA: Tratar diferentes tipos de erro do JWT
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado.' });
      }
      
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  } else {
    // ✅ FIX: Mover para else para evitar enviar resposta duas vezes
    return res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

module.exports = { protect };