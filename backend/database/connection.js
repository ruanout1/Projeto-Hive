const { Sequelize } = require('sequelize');
const initModels = require('../models/init-models'); 
require('dotenv').config();

// 1. Configuração da Conexão
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

// 2. Inicialização dos Modelos (A parte mais importante!)
let models = {};
try {
    models = initModels(sequelize);
    console.log("✅ [Database] Modelos e associações carregados com sucesso.");
} catch (error) {
    console.error("❌ [Database] Erro fatal ao carregar modelos:", error);
}

// 3. Teste de Conexão
sequelize.authenticate()
  .then(() => console.log('🔌 [Database] Conexão MySQL estabelecida.'))
  .catch(err => console.error('❌ [Database] Falha na conexão:', err.message));

// 4. Exportação (Objeto com tudo que o sistema precisa)
module.exports = { sequelize, models };