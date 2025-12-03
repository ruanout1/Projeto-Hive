const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('system_settings', {
    system_setting_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    setting_key: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "setting_key"
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updated_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'system_settings',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "system_setting_id" },
        ]
      },
      {
        name: "setting_key",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "setting_key" },
        ]
      },
      {
        name: "fk_settings_updated_by",
        using: "BTREE",
        fields: [
          { name: "updated_by_user_id" },
        ]
      },
    ]
  });
};
