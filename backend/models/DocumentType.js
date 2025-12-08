const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const DocumentType = sequelize.define('DocumentType', {
  document_type_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  key_name: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true
  },
  label: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'document_types',
  timestamps: false
});

module.exports = DocumentType;