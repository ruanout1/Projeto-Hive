const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('expenses', {
    expense_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'company_id'
      }
    },
    service_order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_orders',
        key: 'service_order_id'
      }
    },
    category: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: false
    },
    expense_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    payment_method_key: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: "other",
      references: {
        model: 'payment_methods',
        key: 'method_key'
      }
    },
    receipt_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "pending"
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    approved_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'expenses',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "expense_id" },
        ]
      },
      {
        name: "fk_expenses_order",
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
      {
        name: "fk_expenses_payment",
        using: "BTREE",
        fields: [
          { name: "payment_method_key" },
        ]
      },
      {
        name: "fk_expenses_created_by",
        using: "BTREE",
        fields: [
          { name: "created_by_user_id" },
        ]
      },
      {
        name: "fk_expenses_approved_by",
        using: "BTREE",
        fields: [
          { name: "approved_by_user_id" },
        ]
      },
      {
        name: "idx_expenses_company_date",
        using: "BTREE",
        fields: [
          { name: "company_id" },
          { name: "expense_date" },
        ]
      },
    ]
  });
};
