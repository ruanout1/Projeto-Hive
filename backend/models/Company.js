const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Company = sequelize.define('Company', {
  company_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  legal_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true,
    unique: true
  },
  main_phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  main_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'companies',
  timestamps: false
});

module.exports = Company;