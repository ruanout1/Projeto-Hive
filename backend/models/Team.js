const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

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

// A função setupAssociations() foi removida daqui

module.exports = Team;

