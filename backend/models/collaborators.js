const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('collaborators', {
    collaborator_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      unique: "fk_collaborators_user"
    },
    registration: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: "cpf"
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    termination_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'collaborators',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "collaborator_id" },
        ]
      },
      {
        name: "user_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "cpf",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cpf" },
        ]
      },
      {
        name: "idx_collaborators_user",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
