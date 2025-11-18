const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
// const User = require('./User'); // Removido para evitar loop
// const Team = require('./Team'); // Removido para evitar loop

if (!sequelize) {
    console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
    module.exports = {};
    return;
  }

const TeamMember = sequelize.define('TeamMember', {
  team_member_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  team_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    // A referência (FK) será definida no server.js
  },
  // No banco, a coluna é 'collaborator_user_id',
  // mas o Sequelize vai mapear 'user_id' para ela
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'collaborator_user_id', // Mapeia este 'user_id' para a coluna 'collaborator_user_id'
    // A referência (FK) será definida no server.js
  },
  role: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'colaborador' // Um valor padrão
  }
}, {
  tableName: 'team_members',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false, // O banco não tem 'updated_at' para esta tabela
  deletedAt: 'left_at' // Usar 'left_at' como 'deletedAt' (soft delete)
});

// A função setupAssociations() foi removida daqui

module.exports = TeamMember;


