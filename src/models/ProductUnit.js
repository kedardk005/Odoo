const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductUnit = sequelize.define('ProductUnit', {
  unit_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unit_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['hour', 'day', 'week', 'month', 'year']]
    }
  }
}, {
  tableName: 'product_units',
  timestamps: false
});

module.exports = ProductUnit;