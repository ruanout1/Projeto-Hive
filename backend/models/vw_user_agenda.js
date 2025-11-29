const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vw_user_agenda', {
    item_type: {
      type: DataTypes.STRING(7),
      allowNull: false,
      primaryKey: true // Truque: Dizemos que isso faz parte da chave
    },
    source_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true // Truque: Dizemos que isso faz parte da chave
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT, // mediumtext no banco vira TEXT aqui
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
    is_all_day: {
      type: DataTypes.BIGINT, // View retorna int/bigint para booleano as vezes
      allowNull: false,
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
    }
  }, {
    sequelize,
    tableName: 'vw_user_agenda',
    timestamps: false, // Views não têm created_at/updated_at gerenciável
    indexes: [] // Views não têm índices físicos diretos
  });
};