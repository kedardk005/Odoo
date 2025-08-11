const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'product_categories',
      key: 'category_id'
    }
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sku_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  is_rentable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  // Rental-specific fields
  rental_units: {
    type: DataTypes.ENUM('hour', 'day', 'week', 'month', 'year'),
    defaultValue: 'day',
    comment: 'Units for rental pricing (per hour, day, week, etc.)'
  },
  min_rental_period: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Minimum rental duration in the specified units'
  },
  max_rental_period: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum rental duration in the specified units'
  },
  rental_price_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Price per rental unit (hour/day/week/month)'
  },
  requires_deposit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this product requires a security deposit'
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Security deposit amount if required'
  },
  late_fee_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Late fee charged per day for overdue returns'
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
  tableName: 'products',
  timestamps: false
});

module.exports = Product;