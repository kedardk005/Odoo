const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RentalOrderItem = sequelize.define('RentalOrderItem', {
  order_item_id: {
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
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id'
    }
  },
  unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'product_units',
      key: 'unit_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  late_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  // Rental duration fields
  rental_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Number of rental periods (e.g., 3 for 3 days)'
  },
  rental_period_type: {
    type: DataTypes.ENUM('hour', 'day', 'week', 'month', 'year'),
    defaultValue: 'day',
    comment: 'Type of rental period (hour, day, week, month, year)'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the rental period starts for this item'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the rental period ends for this item'
  },
  actual_return_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Actual date when item was returned'
  },
  damage_charges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Any damage charges applied to this item'
  }
}, {
  tableName: 'rental_order_items',
  timestamps: false
});

module.exports = RentalOrderItem;