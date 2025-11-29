const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_requests', {
    service_request_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    request_number: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "request_number"
    },
    requester_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    requester_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
    address_reference: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    service_catalog_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_catalog',
        key: 'service_catalog_id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    desired_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    desired_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    priority_key: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "medium",
      references: {
        model: 'priority_levels',
        key: 'priority_key'
      }
    },
    status_key: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "pending",
      references: {
        model: 'service_statuses',
        key: 'status_key'
      }
    },
    assigned_manager_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    assigned_team_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    assigned_collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'service_requests',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "service_request_id" },
        ]
      },
      {
        name: "request_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "request_number" },
        ]
      },
      {
        name: "fk_sr_requester",
        using: "BTREE",
        fields: [
          { name: "requester_user_id" },
        ]
      },
      {
        name: "fk_sr_branch",
        using: "BTREE",
        fields: [
          { name: "branch_id" },
        ]
      },
      {
        name: "fk_sr_service_catalog",
        using: "BTREE",
        fields: [
          { name: "service_catalog_id" },
        ]
      },
      {
        name: "fk_sr_priority",
        using: "BTREE",
        fields: [
          { name: "priority_key" },
        ]
      },
      {
        name: "fk_sr_status",
        using: "BTREE",
        fields: [
          { name: "status_key" },
        ]
      },
      {
        name: "idx_sr_company_date",
        using: "BTREE",
        fields: [
          { name: "company_id" },
          { name: "desired_date" },
        ]
      },
    ]
  });
};
