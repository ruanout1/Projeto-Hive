const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('client_branches', {
    branch_id: {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // --- NOVOS CAMPOS ---
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    cnpj: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // --------------------
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    number: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    complement: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    neighborhood: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    state: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    area: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10,8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11,8),
      allowNull: true
    },
    is_main_branch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'client_branches',
    timestamps: true,
    indexes: [
      { name: "PRIMARY", unique: true, using: "BTREE", fields: [{ name: "branch_id" }] },
      { name: "idx_branches_company", using: "BTREE", fields: [{ name: "company_id" }] },
      { name: "idx_branches_city", using: "BTREE", fields: [{ name: "city" }] },
    ]
  });
};