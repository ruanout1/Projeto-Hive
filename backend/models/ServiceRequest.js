const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
// const Client = require('./Client'); // Removido para evitar loop
// const Team = require('./Team'); // Removido para evitar loop

if (!sequelize) {
  console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const ServiceRequest = sequelize.define('ServiceRequest', {
  service_request_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  request_number: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true // Pode ser nulo se o 'requester_type' for 'manager'
    // FK definida no server.js
  },
  requester_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
    // FK no server.js (se houver, para User)
  },
  requester_type: {
    type: DataTypes.ENUM('client', 'manager'),
    allowNull: false
  },
  address_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
    // FK no server.js (para client_addresses)
  },
  service_catalog_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
    // FK no server.js (para service_catalog)
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  desired_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  assigned_team_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
    // FK no server.js
  }
  // ... (outros campos do seu BD, como 'priority', 'desired_time', etc.)
}, {
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// A função setupAssociations() foi removida daqui

module.exports = ServiceRequest;


