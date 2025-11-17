const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const CollaboratorAllocation = sequelize.define('CollaboratorAllocation', {
  allocation_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  allocation_number: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  collaborator_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  service_catalog_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // COLUNAS QUE ADICIONAMOS (SQL)
  work_days: {
    type: DataTypes.JSON,
    allowNull: true
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  // FIM DAS NOVAS COLUNAS
  shift: {
    type: DataTypes.ENUM('morning', 'afternoon', 'night', 'full_day'),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  approved_by_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'collaborator_allocations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CollaboratorAllocation;