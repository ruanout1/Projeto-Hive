const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('performance_report_feedback', {
    feedback_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    performance_report_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'performance_reports',
        key: 'performance_report_id'
      }
    },
    sender_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'performance_report_feedback',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "feedback_id" },
        ]
      },
      {
        name: "fk_prf_report",
        using: "BTREE",
        fields: [
          { name: "performance_report_id" },
        ]
      },
      {
        name: "fk_prf_sender",
        using: "BTREE",
        fields: [
          { name: "sender_user_id" },
        ]
      },
      {
        name: "fk_prf_recipient",
        using: "BTREE",
        fields: [
          { name: "recipient_user_id" },
        ]
      },
    ]
  });
};
