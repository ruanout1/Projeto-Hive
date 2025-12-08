const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255), // ✅ Especifica tamanho conforme banco
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255), // ✅ Especifica tamanho conforme banco
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255), // ✅ Especifica tamanho conforme banco
    allowNull: false
  },
  phone: { // ✅ NOVO CAMPO
    type: DataTypes.STRING(40),
    allowNull: true
  },
  avatar_url: { // ✅ NOVO CAMPO
    type: DataTypes.STRING(500),
    allowNull: true
  },
  role_key: { // ✅ MUDANÇA: user_type → role_key
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'roles', // Referencia a tabela roles
      key: 'role_key'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  last_login: { // ✅ NOVO CAMPO
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;