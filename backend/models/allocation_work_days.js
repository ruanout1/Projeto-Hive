const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('allocation_work_days', {
    allocation_work_day_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    allocation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'collaborator_allocations',
        key: 'allocation_id'
      }
    },
    week_day: {
      type: DataTypes.STRING(20),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'allocation_work_days',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "allocation_work_day_id" },
        ]
      },
      {
        name: "ux_allocation_weekday",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "allocation_id" },
          { name: "week_day" },
        ]
      },
    ]
  });
};
