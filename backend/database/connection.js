// backend/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const USE_DB = process.env.USE_DB === 'true';

let sequelize = null;

if (USE_DB) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );

  sequelize.authenticate()
    .then(() => console.log('✅ Conexão com o banco de dados estabelecida!'))
    .catch(err => console.error('❌ Erro ao conectar no banco:', err));
} else {
  console.log('⚙️ Banco de dados desativado (modo mock). Nenhuma conexão MySQL será feita.');
}

module.exports = sequelize;
