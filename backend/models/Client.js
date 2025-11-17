const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Client = sequelize.define('Client', {
  client_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true
  },
  main_company_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  main_cnpj: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  payment_day: {
    type: DataTypes.TINYINT,
    allowNull: true
  },
  contract_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  contract_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  contract_value: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Client;



