const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
    message_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    sender_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority_key: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "normal"
    },
    parent_message_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'message_id'
      }
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    conversation_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "message_id" },
        ]
      },
      {
        name: "fk_msg_sender",
        using: "BTREE",
        fields: [
          { name: "sender_user_id" },
        ]
      },
      {
        name: "fk_msg_parent",
        using: "BTREE",
        fields: [
          { name: "parent_message_id" },
        ]
      },
    ]
  });
};
