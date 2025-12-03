const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('performance_reports', {
    performance_report_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    report_scope: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    period_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    period_end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_services: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completed_services: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cancelled_services: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_hours: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0.00
    },
    average_rating: {
      type: DataTypes.DECIMAL(4,2),
      allowNull: true
    },
    efficiency_score: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true
    },
    generated_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    admin_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    admin_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "draft"
    }
  }, {
    sequelize,
    tableName: 'performance_reports',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "performance_report_id" },
        ]
      },
      {
        name: "fk_pr_generated_by",
        using: "BTREE",
        fields: [
          { name: "generated_by_user_id" },
        ]
      },
      {
        name: "fk_pr_admin_user",
        using: "BTREE",
        fields: [
          { name: "admin_user_id" },
        ]
      },
    ]
  });
};
