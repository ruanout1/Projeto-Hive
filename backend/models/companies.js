const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('companies', {
    company_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    legal_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: true,
      unique: "cnpj"
    },
    main_area: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    main_phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    main_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1
    },
    // --- ADICIONADO MANUALMENTE PARA GARANTIR A LEITURA ---
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
    // ------------------------------------------------------
  }, {
    sequelize,
    tableName: 'companies',
    timestamps: false, // Desligamos o automático para usar nossa definição manual acima
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
      {
        name: "cnpj",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cnpj" },
        ]
      },
      {
        name: "idx_name",
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
};