const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('manager_areas', {
    manager_area_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    manager_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    area_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'areas',
        key: 'area_id'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'manager_areas',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "manager_area_id" },
        ]
      },
      {
        name: "ux_manager_area",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "manager_user_id" },
          { name: "area_id" },
        ]
      },
      {
        name: "fk_manager_areas_area",
        using: "BTREE",
        fields: [
          { name: "area_id" },
        ]
      },
    ]
  });
};
