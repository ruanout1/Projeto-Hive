const jwt = require('jsonwebtoken');
// Importando os modelos diretamente, como no padrão original do projeto
const User = require('../models/User');
const ManagerArea = require('../models/ManagerArea');
const Area = require('../models/Area');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'um-salvador-puro-eterno-glorioso-sempre-reinara-&&&@!@!@***§§§');

      // A consulta com 'include' agora funciona porque as associações são carregadas no server.js
      const user = await User.findByPk(decoded.id, {
        attributes: ['user_id', 'user_type', 'full_name', 'is_active'],
        // Usando os apelidos definidos em 'database/associations.js'
        include: {
          model: ManagerArea,
          as: 'managerAreas', // Apelido da associação User -> ManagerArea
          required: false,
          include: {
            model: Area,
            as: 'area', // Apelido da associação ManagerArea -> Area
            attributes: ['name'], 
          },
        },
      });

      if (!user || !user.is_active) {
        return res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
      }

      const userJson = user.toJSON();

      if (userJson.user_type === 'manager') {
        // O resultado vem como um array 'managerAreas'
        if (userJson.managerAreas && userJson.managerAreas.length > 0 && userJson.managerAreas[0].area) {
          userJson.area = userJson.managerAreas[0].area.name;
        } else {
          console.error(`O gestor ${userJson.user_id} não possui uma área associada.`);
          return res.status(401).json({ message: 'Acesso negado: o gestor não tem uma área designada.' });
        }
      }
      
      // Limpa o objeto aninhado
      delete userJson.managerAreas;

      req.user = userJson;
      next();

    } catch (error) {
      console.error('Erro de autenticação:', error);
      res.status(500).json({ message: 'Erro interno no servidor durante a autenticação.', details: error.message });
    }
    return;
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

module.exports = { protect };
