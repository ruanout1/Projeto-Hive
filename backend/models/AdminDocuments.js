const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const AdminDocuments = sequelize.define('AdminDocuments', {
  document_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  document_number: {
    type: DataTypes.STRING(80),
    allowNull: true,
    unique: true
  },
  document_type_id: { // ✅ BIGINT, não ENUM
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'document_types',
      key: 'document_type_id'
    }
  },
  company_id: { // ✅ company_id, não client_id
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
    defaultValue: false
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
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'documents',
  timestamps: false
});

// ============================================================================
// MÉTODOS ESTÁTICOS
// ============================================================================

AdminDocuments.generateDocumentNumber = async function() {
  const year = new Date().getFullYear();
  const count = await AdminDocuments.count({
    where: {
      uploaded_at: {
        [sequelize.Sequelize.Op.gte]: new Date(`${year}-01-01`),
        [sequelize.Sequelize.Op.lte]: new Date(`${year}-12-31`)
      }
    }
  });
  const number = String(count + 1).padStart(4, '0');
  return `DOC-${year}-${number}`;
};

AdminDocuments.findAllWithDetails = async function(filters = {}, searchFilter = null) {
  const Company = sequelize.models.Company;
  const DocumentType = sequelize.models.DocumentType;
  const User = sequelize.models.User;

  const whereCondition = { ...filters };
  if (searchFilter) {
    Object.assign(whereCondition, searchFilter);
  }

  return await AdminDocuments.findAll({
    where: whereCondition,
    include: [
      {
        model: Company,
        as: 'company',
        required: false,
        attributes: ['company_id', 'name', 'legal_name']
      },
      {
        model: DocumentType,
        as: 'documentType',
        required: false,
        attributes: ['document_type_id', 'key_name', 'label']
      },
      {
        model: User,
        as: 'uploadedBy',
        attributes: ['user_id', 'full_name'],
        required: false
      }
    ],
    order: [['uploaded_at', 'DESC']]
  });
};

AdminDocuments.getStats = async function() {
  const total = await AdminDocuments.count();
  const visible = await AdminDocuments.count({ where: { is_available_to_client: true } });
  const hidden = await AdminDocuments.count({ where: { is_available_to_client: false } });

  return {
    total,
    visible,
    hidden
  };
};

AdminDocuments.toggleVisibility = async function(documentId) {
  const document = await AdminDocuments.findByPk(documentId);
  
  if (!document) {
    return {
      success: false,
      message: 'Documento não encontrado'
    };
  }

  document.is_available_to_client = !document.is_available_to_client;
  document.updated_at = new Date();
  await document.save();

  return {
    success: true,
    message: `Documento ${document.is_available_to_client ? 'visível' : 'oculto'} para o cliente`,
    document
  };
};

module.exports = AdminDocuments;