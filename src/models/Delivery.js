const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  deliveryNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('pickup', 'return'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'in_transit', 'delivered', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  scheduledTimeSlot: {
    type: DataTypes.STRING,
  },
  actualDate: {
    type: DataTypes.DATE,
  },
  pickupLocation: {
    type: DataTypes.TEXT,
  },
  deliveryLocation: {
    type: DataTypes.TEXT,
  },
  contactPerson: {
    type: DataTypes.STRING,
  },
  contactPhone: {
    type: DataTypes.STRING,
  },
  instructions: {
    type: DataTypes.TEXT,
  },
  driverName: {
    type: DataTypes.STRING,
  },
  driverPhone: {
    type: DataTypes.STRING,
  },
  vehicleNumber: {
    type: DataTypes.STRING,
  },
  estimatedDistance: {
    type: DataTypes.DECIMAL(8, 2), // in KM
  },
  actualDistance: {
    type: DataTypes.DECIMAL(8, 2), // in KM
  },
  deliveryCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  additionalCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  totalCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  signatureImage: {
    type: DataTypes.STRING,
  },
  deliveryImages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
  failureReason: {
    type: DataTypes.TEXT,
  },
  rescheduleCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

const DeliveryItem = sequelize.define('DeliveryItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deliveredQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'excellent',
  },
  serialNumbers: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = { Delivery, DeliveryItem };