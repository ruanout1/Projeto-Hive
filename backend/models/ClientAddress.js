const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
  console.log('⚙️ [ClientAddress Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const ClientAddress = sequelize.define('ClientAddress', {
  address_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // ... (outros campos de endereço)
  area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'client_addresses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ClientAddress;