const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models'); // Importa o carregador gerado
require('dotenv').config();

// Verifica se o banco deve ser ativado
if (process.env.USE_DB === 'false') {
  console.log('⚙️ Banco de dados desativado (modo mock).');
  module.exports = { sequelize: null, models: null };
  return;
}

// Configuração da conexão
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true, // Importante para o seu banco snake_case
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
);

// Carrega todos os modelos e associações
const models = initModels(sequelize);

// Teste de conexão
sequelize
  .authenticate()
  .then(() => console.log('✅ Conexão com o banco de dados estabelecida!'))
  .catch((err) => console.error('❌ Erro ao conectar no banco:', err));

// Exportamos a instância e os models
module.exports = { sequelize, models };