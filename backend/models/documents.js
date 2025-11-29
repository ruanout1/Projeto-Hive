const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('documents', {
    document_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    document_number: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    document_type_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'document_types',
        key: 'document_type_id'
      }
    },
    company_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'company_id'
      }
    },
    service_order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'service_orders',
        key: 'service_order_id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_available_to_client: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    uploaded_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    uploaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'documents',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "document_id" },
        ]
      },
      {
        name: "fk_docs_type",
        using: "BTREE",
        fields: [
          { name: "document_type_id" },
        ]
      },
      {
        name: "fk_docs_uploaded_by",
        using: "BTREE",
        fields: [
          { name: "uploaded_by_user_id" },
        ]
      },
      {
        name: "idx_documents_company",
        using: "BTREE",
        fields: [
          { name: "company_id" },
        ]
      },
      {
        name: "idx_documents_order",
        using: "BTREE",
        fields: [
          { name: "service_order_id" },
        ]
      },
    ]
  });
};
