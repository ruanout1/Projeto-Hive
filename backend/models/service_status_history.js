const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_status_history', {
    history_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    scheduled_service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'scheduled_services',
        key: 'scheduled_service_id'
      }
    },
    old_status_key: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'service_statuses',
        key: 'status_key'
      }
    },
    new_status_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'service_statuses',
        key: 'status_key'
      }
    },
    changed_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    change_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'service_status_history',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "history_id" },
        ]
      },
      {
        name: "fk_ssh_changed_by",
        using: "BTREE",
        fields: [
          { name: "changed_by_user_id" },
        ]
      },
      {
        name: "fk_ssh_old_status",
        using: "BTREE",
        fields: [
          { name: "old_status_key" },
        ]
      },
      {
        name: "fk_ssh_new_status",
        using: "BTREE",
        fields: [
          { name: "new_status_key" },
        ]
      },
      {
        name: "idx_ssh_scheduled",
        using: "BTREE",
        fields: [
          { name: "scheduled_service_id" },
          { name: "changed_at" },
        ]
      },
    ]
  });
};
