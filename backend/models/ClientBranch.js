const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ClientBranch = sequelize.define('ClientBranch', {
  branch_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  company_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  street: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  number: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  complement: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  neighborhood: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  state: {
    type: DataTypes.CHAR(2),
    allowNull: true
  },
  zip_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  area: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  is_main_branch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'client_branches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ClientBranch;