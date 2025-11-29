const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('service_statuses', {
    status_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'service_statuses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "status_key" },
        ]
      },
    ]
  });
};
