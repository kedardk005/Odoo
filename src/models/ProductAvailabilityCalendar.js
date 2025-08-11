const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductAvailabilityCalendar = sequelize.define('ProductAvailabilityCalendar', {
  availability_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date for which availability is tracked'
  },
  total_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Total quantity available for this product'
  },
  reserved_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity reserved for confirmed orders'
  },
  available_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity available for new reservations'
  },
  status: {
    type: DataTypes.ENUM('available', 'limited', 'fully_booked', 'maintenance'),
    defaultValue: 'available',
    comment: 'Availability status for this date'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Any special notes for this date (maintenance, etc.)'
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
  tableName: 'product_availability_calendar',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'date'],
      name: 'unique_product_date'
    },
    {
      fields: ['date'],
      name: 'idx_availability_date'
    },
    {
      fields: ['product_id'],
      name: 'idx_availability_product'
    }
  ]
});

module.exports = ProductAvailabilityCalendar;