const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
// const User = require('./User'); // Removido para evitar loop

if (!sequelize) {
  console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const Client = sequelize.define('Client', {
  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true
    // FK será definida na associação no server.js
  },
  main_company_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  main_cnpj: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
  // ... (outros campos: payment_day, contract_start_date, etc.)
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// A função setupAssociations() foi removida daqui

module.exports = Client;



