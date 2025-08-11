const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pricelist = sequelize.define('Pricelist', {
  pricelist_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customer_group: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'pricelists',
  timestamps: false
});

module.exports = Pricelist;