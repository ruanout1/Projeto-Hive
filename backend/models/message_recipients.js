const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('message_recipients', {
    message_recipient_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'message_id'
      }
    },
    recipient_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'message_recipients',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "message_recipient_id" },
        ]
      },
      {
        name: "ux_message_recipient",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "message_id" },
          { name: "recipient_user_id" },
        ]
      },
      {
        name: "fk_mr_recipient",
        using: "BTREE",
        fields: [
          { name: "recipient_user_id" },
        ]
      },
    ]
  });
};
