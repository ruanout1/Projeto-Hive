const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('document_types', {
    document_type_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    key_name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: "key_name"
    },
    label: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'document_types',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "document_type_id" },
        ]
      },
      {
        name: "key_name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "key_name" },
        ]
      },
    ]
  });
};
