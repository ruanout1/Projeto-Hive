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
          'user_type',
          'full_name',
          'is_active',
          // 'area' // Tente adicionar 'area' se estiver no seu model User
        ],
        // Se 'area' não estiver no User, você precisa buscá-la. Ex:
        // include: [{ model: ManagerArea, attributes: ['area_id'] }]
      });
      
      if (!user || !user.is_active) {
         return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
      }

      // 4. Anexa o usuário ao req
      // TODO: Simples hack para 'area'. Ajuste com sua lógica real.
      // Se 'area' vem de outra tabela, você precisa buscá-la.
      // Por enquanto, vamos mockar se não vier.
      req.user = user.toJSON();
      if (req.user.user_type === 'manager' && !req.user.area) {
        req.user.area = 'area_gestor_mock'; // Substitua isso pela busca real
      }
      
      next();

    } catch (error) {
      console.error('Erro de autenticação:', error.message);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

module.exports = { protect };