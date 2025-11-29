const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('collaborator_assignments', {
    assignment_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    assignment_number: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "assignment_number"
    },
    scheduled_service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'scheduled_services',
        key: 'scheduled_service_id'
      }
    },
    collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    team_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'teams',
        key: 'team_id'
      }
    },
    collaborator_status_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "assigned",
      references: {
        model: 'assignment_statuses',
        key: 'status_key'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    collaborator_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'collaborator_assignments',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "assignment_id" },
        ]
      },
      {
        name: "assignment_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "assignment_number" },
        ]
      },
      {
        name: "fk_ca_collab",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
        ]
      },
      {
        name: "fk_ca_team",
        using: "BTREE",
        fields: [
          { name: "team_id" },
        ]
      },
      {
        name: "fk_ca_status",
        using: "BTREE",
        fields: [
          { name: "collaborator_status_key" },
        ]
      },
      {
        name: "idx_assign_scheduled",
        using: "BTREE",
        fields: [
          { name: "scheduled_service_id" },
        ]
      },
    ]
  });
};
