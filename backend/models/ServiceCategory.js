const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
  console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const ServiceCategory = sequelize.define('ServiceCategory', {
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Garante que não hajam categorias com mesmo nome
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Coluna de cor que adicionamos com o script SQL
  color: {
    type: DataTypes.STRING(10), // ex: '#FF0000'
    allowNull: false,
    defaultValue: '#6400A4'
  }
}, {
  tableName: 'service_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// A função setupAssociations() foi removida daqui

module.exports = ServiceCategory;