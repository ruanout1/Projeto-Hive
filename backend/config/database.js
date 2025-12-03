const { Sequelize } = require('sequelize');
require('dotenv').config();

// Verifica se o banco deve ser ativado
if (process.env.USE_DB === 'false') {
  console.log('⚙️ Banco de dados desativado (modo mock). Nenhuma conexão MySQL será feita.');
  module.exports = null;
  return;
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,

    // ✅ IMPORTANTE: mapear timestamps snake_case do MySQL
    define: {
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);
module.exports = sequelize;
