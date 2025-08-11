const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'confirmed', 'in_progress', 'delivered', 'returned', 'completed', 'cancelled'),
    defaultValue: 'draft',
  },
  rentalStartDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rentalEndDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  actualStartDate: {
    type: DataTypes.DATE,
  },
  actualEndDate: {
    type: DataTypes.DATE,
  },
  totalDuration: {
    type: DataTypes.INTEGER, // in hours
  },
  actualDuration: {
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
  lateFee: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  finalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
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
  notes: {
    type: DataTypes.TEXT,
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
  paymentDueDate: {
    type: DataTypes.DATE,
  },
  isOverdue: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  overdueDate: {
    type: DataTypes.DATE,
  },
  damagedItems: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  damageCharges: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

const OrderItem = sequelize.define('OrderItem', {
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
  deliveredQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  returnedQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
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
  actualDuration: {
    type: DataTypes.INTEGER, // in hours
  },
  rentalUnit: {
    type: DataTypes.ENUM('hour', 'day', 'week', 'month', 'year'),
    defaultValue: 'day',
  },
  status: {
    type: DataTypes.ENUM('reserved', 'delivered', 'returned', 'damaged', 'lost'),
    defaultValue: 'reserved',
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'excellent',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = { Order, OrderItem };