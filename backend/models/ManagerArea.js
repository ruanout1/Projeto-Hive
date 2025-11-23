const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ManagerArea = sequelize.define('ManagerArea', {
  manager_area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  manager_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'areas',
      key: 'area_id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'manager_areas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['manager_user_id', 'area_id']
    }
  ]
});

module.exports = ManagerArea;