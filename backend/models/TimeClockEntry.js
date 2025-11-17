const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const TimeClockEntry = sequelize.define('TimeClockEntry', {
  time_clock_entry_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  collaborator_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  entry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  clock_in: {
    type: DataTypes.TIME,
    allowNull: true
  },
  clock_out: {
    type: DataTypes.TIME,
    allowNull: true
  },
  lunch_start: {
    type: DataTypes.TIME,
    allowNull: true
  },
  lunch_end: {
    type: DataTypes.TIME,
    allowNull: true
  },
  total_hours: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  validated_by_manager: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  digital_signature: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'overtime'),
    defaultValue: 'present'
  },
  approved_by_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'time_clock_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TimeClockEntry;