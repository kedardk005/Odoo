const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Return = sequelize.define('Return', {
  return_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rental_orders',
      key: 'order_id'
    }
  },
  scheduled_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'scheduled',
    validate: {
      isIn: [['scheduled', 'completed', 'late', 'missed']]
    }
  },
  assigned_staff_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'returns',
  timestamps: false
});

module.exports = Return;