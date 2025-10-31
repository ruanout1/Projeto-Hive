const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('hive_db', 'root', 'SENHA_DO_MYSQL', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log('✅ Conexão com o banco de dados estabelecida!'))
  .catch(err => console.error('❌ Erro ao conectar no banco:', err));

module.exports = sequelize;
