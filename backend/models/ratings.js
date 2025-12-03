const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ratings', {
    rating_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'company_id'
      }
    },
    scheduled_service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'scheduled_services',
        key: 'scheduled_service_id'
      }
    },
    collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
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
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "rating_id" },
        ]
      },
      {
        name: "fk_ratings_scheduled",
        using: "BTREE",
        fields: [
          { name: "scheduled_service_id" },
        ]
      },
      {
        name: "fk_ratings_collab",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
        ]
      },
      {
        name: "fk_ratings_order",
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
      {
        name: "idx_ratings_company",
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
    ]
  });
};
