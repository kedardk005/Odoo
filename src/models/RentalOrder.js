const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RentalOrder = sequelize.define('RentalOrder', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quotation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'rental_quotations',
      key: 'quotation_id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'confirmed',
    validate: {
      isIn: [['confirmed', 'in_progress', 'completed', 'cancelled']]
    }
  },
  pickup_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  return_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rental_orders',
  timestamps: false
});

module.exports = RentalOrder;