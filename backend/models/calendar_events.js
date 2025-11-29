const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('calendar_events', {
    event_id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    event_type: {
      type: DataTypes.ENUM('meeting','personal','reminder','holiday'),
      allowNull: false,
      defaultValue: "meeting"
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_all_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    meeting_link: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: "#8E44AD"
    }
  }, {
    sequelize,
    tableName: 'calendar_events',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "event_id" },
        ]
      },
      {
        name: "fk_event_creator",
        using: "BTREE",
        fields: [
          { name: "created_by_user_id" },
        ]
      },
    ]
  });
};
