const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('time_clock_entries', {
    time_clock_entry_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    collaborator_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    clock_in: {
      type: DataTypes.TIME,
      allowNull: true
    },
    clock_out: {
      type: DataTypes.TIME,
      allowNull: true
    },
    lunch_start: {
      type: DataTypes.TIME,
      allowNull: true
    },
    lunch_end: {
      type: DataTypes.TIME,
      allowNull: true
    },
    total_hours: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true
    },
    location_lat: {
      type: DataTypes.DECIMAL(10,8),
      allowNull: true
    },
    location_lng: {
      type: DataTypes.DECIMAL(11,8),
      allowNull: true
    },
    validated_by_manager: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    digital_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "present"
    },
    approved_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'time_clock_entries',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "time_clock_entry_id" },
        ]
      },
      {
        name: "fk_tce_approved_by",
        using: "BTREE",
        fields: [
          { name: "approved_by_user_id" },
        ]
      },
      {
        name: "idx_tce_collab_date",
        using: "BTREE",
        fields: [
          { name: "collaborator_user_id" },
          { name: "entry_date" },
        ]
      },
    ]
  });
};
