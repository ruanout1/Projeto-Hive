const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
  console.log('⚙️ [ServiceCatalog Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

// const ServiceCategory = require('./ServiceCategory'); // Removido para evitar loop

const ServiceCatalog = sequelize.define('ServiceCatalog', {
  service_catalog_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
    // FK definida no server.js
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  duration_value: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  duration_type: {
    type: DataTypes.ENUM('diaria', 'semanal', 'quinzenal', 'mensal', 'anual', 'horas'),
    allowNull: true, // Permitir nulo se não aplicável
    defaultValue: 'horas'
  },
  // --- CORREÇÃO AQUI ---
  // A coluna no BD não é mais 'is_active' (BOOLEAN)
  // Agora ela se chama 'status' (ENUM)
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    field: 'status' // O nome da coluna no banco de dados
  }
  // --- FIM DA CORREÇÃO ---
}, {
  tableName: 'service_catalog',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// A função setupAssociations() foi removida daqui

module.exports = ServiceCatalog;