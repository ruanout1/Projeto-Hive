const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const TeamMember = sequelize.define('TeamMember', {
  team_member_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  team_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'collaborator_user_id',
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'colaborador'
  }
}, {
  tableName: 'team_members',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false, 
  deletedAt: 'left_at'
});

module.exports = TeamMember;
