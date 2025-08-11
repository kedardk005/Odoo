const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
  template_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('email', 'sms', 'push'),
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  html_template: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  text_template: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  variables: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notification_templates',
  timestamps: false
});

module.exports = NotificationTemplate;
