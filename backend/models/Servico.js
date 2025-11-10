const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

if (!sequelize) {
  console.log('⚙️ [User Model] Modo mock ativo - sem banco de dados.');
  module.exports = {};
  return;
}

const Servico = sequelize.define('Servico', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'pendente' },
  cliente: { type: DataTypes.STRING, allowNull: false },
  equipe: { type: DataTypes.STRING },
  dataInicio: { type: DataTypes.DATE },
  dataFim: { type: DataTypes.DATE },
}, {
  tableName: 'servicos',
  timestamps: false,
});

module.exports = Servico;
