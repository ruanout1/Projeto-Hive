const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('scheduled_services', {
    scheduled_service_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    service_number: {
      type: DataTypes.STRING(80),
      allowNull: true,
      unique: "service_number"
    },
    service_order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_orders',
        key: 'service_order_id'
      }
    },
    service_catalog_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'service_catalog',
        key: 'service_catalog_id'
      }
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'company_id'
      }
    },
    branch_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'client_branches',
        key: 'branch_id'
      }
    },
    area_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'areas',
        key: 'area_id'
      }
    },
    assigned_manager_area_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    status_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "scheduled",
      references: {
        model: 'service_statuses',
        key: 'status_key'
      }
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requires_photos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completion_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    client_visible_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'scheduled_services',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "scheduled_service_id" },
        ]
      },
      {
        name: "service_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "service_number" },
        ]
      },
      {
        name: "fk_ss_order",
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
      {
        name: "fk_ss_catalog",
        using: "BTREE",
        fields: [
          { name: "service_catalog_id" },
        ]
      },
      {
        name: "fk_ss_branch",
        using: "BTREE",
        fields: [
          { name: "branch_id" },
        ]
      },
      {
        name: "fk_ss_area",
        using: "BTREE",
        fields: [
          { name: "area_id" },
        ]
      },
      {
        name: "fk_ss_collab",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
        ]
      },
      {
        name: "fk_ss_team",
        using: "BTREE",
        fields: [
          { name: "team_id" },
        ]
      },
      {
        name: "idx_ss_company_date",
        using: "BTREE",
        fields: [
          { name: "company_id" },
          { name: "scheduled_date" },
        ]
      },
      {
        name: "idx_ss_status_date",
        using: "BTREE",
        fields: [
          { name: "status_key" },
          { name: "scheduled_date" },
        ]
      },
    ]
  });
};
