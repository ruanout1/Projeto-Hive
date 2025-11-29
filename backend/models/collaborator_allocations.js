const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('collaborator_allocations', {
    allocation_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    allocation_number: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "allocation_number"
    },
    collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
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
    service_catalog_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_catalog',
        key: 'service_catalog_id'
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
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    shift: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "full_day"
    },
    status_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
      references: {
        model: 'assignment_statuses',
        key: 'status_key'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    approved_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'collaborator_allocations',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "allocation_id" },
        ]
      },
      {
        name: "allocation_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "allocation_number" },
        ]
      },
      {
        name: "fk_alloc_company",
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
      {
        name: "fk_alloc_catalog",
        using: "BTREE",
        fields: [
          { name: "service_catalog_id" },
        ]
      },
      {
        name: "fk_alloc_area",
        using: "BTREE",
        fields: [
          { name: "area_id" },
        ]
      },
      {
        name: "fk_alloc_status",
        using: "BTREE",
        fields: [
          { name: "status_key" },
        ]
      },
      {
        name: "idx_alloc_collab",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
        ]
      },
    ]
  });
};
