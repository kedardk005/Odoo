const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserNotificationPreference = sequelize.define('UserNotificationPreference', {
  preference_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  email_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sms_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  push_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order_updates: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  payment_reminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  promotional_emails: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'user_notification_preferences',
  timestamps: false
});

module.exports = UserNotificationPreference;
