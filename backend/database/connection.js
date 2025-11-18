// const { Sequelize } = require('sequelize');

// // 1. CARREGA AS VARIÁVEIS DE AMBIENTE (DO ARQUIVO .env)
// require('dotenv').config();

// // 2. USA AS VARIÁVEIS
// const sequelize = new Sequelize(
//   process.env.DB_NAME, // <-- Puxa 'hive_db' do .env
//   process.env.DB_USER, // <-- Puxa 'root' do .env
//   process.env.DB_PASS, // <-- Puxa sua senha do .env
//   {
//     host: process.env.DB_HOST, // <-- Puxa 'localhost' do .env
//     dialect: 'mysql',
//     logging: false, // Desliga os logs do SQL no console
//   }
// );

// // 3. Tenta autenticar
// sequelize.authenticate()
//   .then(() => console.log('✅ Conexão com o banco de dados estabelecida!'))
//   .catch(err => console.error('❌ Erro ao conectar no banco:', err));

// // --- REMOVEMOS O BLOCO DE ASSOCIAÇÕES DAQUI ---

// // 4. Exporta APENAS a conexão
// module.exports = sequelize;

// backend/config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const USE_DB = process.env.USE_DB === 'true';

if (!USE_DB) {
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
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conexão com o banco de dados estabelecida!'))
  .catch(err => console.error('❌ Erro ao conectar no banco:', err));

module.exports = sequelize;
