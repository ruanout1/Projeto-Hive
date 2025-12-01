const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vw_user_agenda', {
    item_type: {
      type: DataTypes.STRING(10), // Aumentei um pouco por segurança (service/event)
      allowNull: false,
      primaryKey: true
    },
    source_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Corrigido para aceitar o retorno da View (Geralmente TinyInt ou Int)
    is_all_day: {
      type: DataTypes.INTEGER, 
      allowNull: true,
      defaultValue: 0
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    // --- NOVAS COLUNAS ADICIONADAS ---
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    meeting_link: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reminder: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vw_user_agenda',
    timestamps: false, // Views não têm timestamps gerenciáveis
    freezeTableName: true // Impede o Sequelize de tentar pluralizar o nome da view
  });
};