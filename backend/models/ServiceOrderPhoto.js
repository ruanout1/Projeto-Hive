const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const ServiceOrderPhoto = sequelize.define('ServiceOrderPhoto', {
  photo_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  service_order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  scheduled_service_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  company_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  collaborator_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  branch_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  photo_type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  photo_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  taken_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  review_status_key: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'pending'
  },
  reviewed_by_user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_visible_to_client: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'service_order_photos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceOrderPhoto;