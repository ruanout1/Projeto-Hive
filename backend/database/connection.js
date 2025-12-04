const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models'); // Caminho para o init-models
require('dotenv').config();

// Configuração da conexão
const sequelize = new Sequelize(
  process.env.DB_NAME || 'hive',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    }
  }
);

// Inicializa os modelos
var models = {};
try {
    models = initModels(sequelize);
    console.log("✅ Modelos inicializados no connection.js");
} catch (error) {
    console.error("❌ Erro ao inicializar modelos:", error);
}

// Teste de conexão (Opcional, mas bom para debug)
sequelize.authenticate()
  .then(() => console.log('🔌 Conexão MySQL estabelecida.'))
  .catch(err => console.error('❌ Falha na conexão MySQL:', err));

// Exporta para os Controllers usarem: const { models } = require('../database/connection');
module.exports = { sequelize, models };