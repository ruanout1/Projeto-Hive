const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

// Este arquivo define APENAS o modelo ServiceRequest.
// Nenhuma outra dependência de modelo é importada aqui.

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
    allowNull: true
  },
  requester_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  requester_type: {
    type: DataTypes.ENUM('client', 'manager'),
    allowNull: false
  },
  address_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  service_catalog_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
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
  }
}, {
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Todas as associações (belongsTo, hasMany, etc.) para este modelo
// são definidas centralmente em /database/associations.js.

module.exports = ServiceRequest;
