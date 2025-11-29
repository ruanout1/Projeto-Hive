const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_order_photos', {
    photo_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    service_order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_orders',
        key: 'service_order_id'
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
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'company_id'
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
    branch_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'client_branches',
        key: 'branch_id'
      }
    },
    photo_type: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    photo_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    taken_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    review_status_key: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      references: {
        model: 'photo_review_status',
        key: 'review_key'
      }
    },
    reviewed_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_visible_to_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'service_order_photos',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "photo_id" },
        ]
      },
      {
        name: "fk_sop_company",
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
      {
        name: "fk_sop_collab",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
        ]
      },
      {
        name: "fk_sop_branch",
        using: "BTREE",
        fields: [
          { name: "branch_id" },
        ]
      },
      {
        name: "fk_sop_review_status",
        using: "BTREE",
        fields: [
          { name: "review_status_key" },
        ]
      },
      {
        name: "idx_photos_scheduled",
        using: "BTREE",
        fields: [
          { name: "scheduled_service_id" },
        ]
      },
      {
        name: "idx_photos_order",
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
    ]
  });
};
