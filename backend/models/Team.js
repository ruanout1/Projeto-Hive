const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
    console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
    module.exports = {};
    return;
  }

const Team = sequelize.define('Team', {
  team_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  manager_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true 
  },
  // 'area_id' da sua tabela SQL
  area_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'teams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Team;

