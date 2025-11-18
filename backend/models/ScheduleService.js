const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ScheduleService = sequelize.define('ScheduleService', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  serviceRequestId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  teamId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  scheduledTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'in-progress', 'completed'),
    allowNull: false,
    defaultValue: 'upcoming',
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'scheduled_services',
  timestamps: true,
  underscored: true, // Mapeia camelCase (ex: serviceRequestId) para snake_case (ex: service_request_id) no DB
});

module.exports = ScheduleService;