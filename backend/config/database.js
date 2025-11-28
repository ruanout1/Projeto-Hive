const { Sequelize } = require('sequelize');
require('dotenv').config();

// Verifica se o banco deve ser ativado
if (process.env.USE_DB === 'false') {
  console.log('⚙️ Banco de dados desativado (modo mock). Nenhuma conexão MySQL será feita.');
  module.exports = null;
  return;
}

// Cria instância do Sequelize com variáveis do .env
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

// Tenta autenticar
sequelize
  .authenticate()
  .then(() => console.log(' Conexão com o banco de dados estabelecida!'))
  .catch((err) => console.error(' Erro ao conectar no banco:', err));

module.exports = sequelize;
