const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
  console.log('⚙️ [ManagerArea Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const ManagerArea = sequelize.define('ManagerArea', {
  manager_area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  manager_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'manager_areas',
  timestamps: true,
  createdAt: 'assigned_at',
  updatedAt: false
});

module.exports = ManagerArea;