const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
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
  invoice_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unpaid',
    validate: {
      isIn: [['paid', 'unpaid', 'partial']]
    }
  }
}, {
  tableName: 'invoices',
  timestamps: false
});

module.exports = Invoice;