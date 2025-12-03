const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('priority_levels', {
    priority_key: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'priority_levels',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "priority_key" },
        ]
      },
    ]
  });
};
