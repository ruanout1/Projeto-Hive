const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_orders', {
    service_order_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    order_number: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "order_number"
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'company_id'
      }
    },
    service_request_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_requests',
        key: 'service_request_id'
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
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    total_value: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: true
    },
    payment_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "pending"
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "draft"
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'service_orders',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
      {
        name: "order_number",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "order_number" },
        ]
      },
      {
        name: "fk_so_request",
        using: "BTREE",
        fields: [
          { name: "service_request_id" },
        ]
      },
      {
        name: "fk_so_created_by",
        using: "BTREE",
        fields: [
          { name: "created_by_user_id" },
        ]
      },
      {
        name: "idx_service_orders_company",
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
    ]
  });
};
