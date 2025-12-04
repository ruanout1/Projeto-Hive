require('dotenv').config();
const { Sequelize } = require('sequelize');

// Verifica se o banco deve ser ativado (opcional, mas bom manter)
if (process.env.USE_DB === 'false') {
  console.log('⚙️ Banco de dados desativado (modo mock).');
  module.exports = null;
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
      underscored: true,
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
);

// Teste rápido de conexão (apenas log)
sequelize.authenticate()
  .then(() => console.log('✅ Conexão com o banco (config) OK!'))
  .catch((err) => console.error('❌ Falha na conexão (config):', err.message));

// --- A CORREÇÃO ESTÁ AQUI EMBAIXO ---
// Exportamos DIRETAMENTE a instância, sem chaves {}
module.exports = sequelize;