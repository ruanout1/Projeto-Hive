const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ScheduledService = sequelize.define('ScheduledService', {
  scheduled_service_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },

  service_number: {
    type: DataTypes.STRING(60),
    allowNull: true
  },

  service_order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },

  service_catalog_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },

  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },

  client_area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },

  collaborator_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },

  team_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },

  scheduled_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },

  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled'
  },

  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'scheduled_services',
  timestamps: false
});

module.exports = ScheduledService;
