const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('photo_review_status', {
    review_key: {
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
    tableName: 'photo_review_status',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "review_key" },
        ]
      },
    ]
  });
};
