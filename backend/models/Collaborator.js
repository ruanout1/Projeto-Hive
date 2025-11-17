const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Collaborator = sequelize.define('Collaborator', {
  collaborator_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true
  },
  registration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  termination_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'collaborators',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Collaborator;