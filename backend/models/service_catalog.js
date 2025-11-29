const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_catalog', {
    service_catalog_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_categories',
        key: 'category_id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    requires_photos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "active"
    },
    duration_value: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 1.00
    },
    duration_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "hours"
    },
    event_color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: "#35BAE6"
    },
    event_icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'service_catalog',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "service_catalog_id" },
        ]
      },
      {
        name: "idx_service_catalog_category",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });
};
