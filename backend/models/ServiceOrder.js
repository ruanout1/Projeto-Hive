const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ServiceOrder = sequelize.define('ServiceOrder', {
  service_order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true
  },
  company_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'company_id'
    }
  },
  service_request_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'service_requests',
      key: 'service_request_id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  period_start: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  period_end: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  total_value: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  payment_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'draft'
  },
  created_by_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  created_at: {
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
  tableName: 'service_orders',
  timestamps: false
});

// Método estático para gerar número da ordem
ServiceOrder.generateOrderNumber = async function() {
  const year = new Date().getFullYear();
  const count = await ServiceOrder.count({
    where: {
      created_at: {
        [sequelize.Sequelize.Op.gte]: new Date(`${year}-01-01`),
        [sequelize.Sequelize.Op.lte]: new Date(`${year}-12-31`)
      }
    }
  });
  const number = String(count + 1).padStart(3, '0');
  return `OS-${year}-${number}`;
};

module.exports = ServiceOrder;