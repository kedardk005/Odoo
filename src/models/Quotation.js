const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quotationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'confirmed', 'expired', 'cancelled'),
    defaultValue: 'draft',
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rentalStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rentalEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  totalDuration: {
    type: DataTypes.INTEGER, // in hours
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  taxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
  },
  pickupLocation: {
    type: DataTypes.STRING,
  },
  deliveryLocation: {
    type: DataTypes.STRING,
  },
  pickupType: {
    type: DataTypes.ENUM('self_pickup', 'delivery'),
    defaultValue: 'self_pickup',
  },
  deliveryCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

const QuotationItem = sequelize.define('QuotationItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  discountPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  rentalDuration: {
    type: DataTypes.INTEGER, // in hours
  },
  rentalUnit: {
    type: DataTypes.ENUM('hour', 'day', 'week', 'month', 'year'),
    defaultValue: 'day',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = { Quotation, QuotationItem };