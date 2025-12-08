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
    references: {
      model: 'teams',
      key: 'team_id'
    }
  },
  user_id: { // ✅ CORRETO: sem mapeamento, usa user_id direto
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  left_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'team_members',
  timestamps: false // ✅ Sem timestamps automáticos
});

module.exports = TeamMember;