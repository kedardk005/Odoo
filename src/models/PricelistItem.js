const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PricelistItem = sequelize.define('PricelistItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pricelist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pricelists',
      key: 'pricelist_id'
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
    allowNull: true,
    references: {
      model: 'product_units',
      key: 'unit_id'
    }
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  max_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: 'pricelist_items',
  timestamps: false
});

module.exports = PricelistItem;
