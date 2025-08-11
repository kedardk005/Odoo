const express = require('express');
require('dotenv').config();

const app = express();

console.log('Testing routes one by one...');

try {
  console.log('Testing auth routes...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes OK');
} catch (error) {
  console.error('✗ Auth routes error:', error.message);
}

try {
  console.log('Testing product routes...');
  const productRoutes = require('./src/routes/products');
  app.use('/api/products', productRoutes);
  console.log('✓ Product routes OK');
} catch (error) {
  console.error('✗ Product routes error:', error.message);
}

try {
  console.log('Testing customer routes...');
  const customerRoutes = require('./src/routes/customers');
  app.use('/api/customers', customerRoutes);
  console.log('✓ Customer routes OK');
} catch (error) {
  console.error('✗ Customer routes error:', error.message);
}

try {
  console.log('Testing rental routes...');
  const rentalRoutes = require('./src/routes/rentals');
  app.use('/api/rentals', rentalRoutes);
  console.log('✓ Rental routes OK');
} catch (error) {
  console.error('✗ Rental routes error:', error.message);
}

try {
  console.log('Testing quotation routes...');
  const quotationRoutes = require('./src/routes/quotations');
  app.use('/api/quotations', quotationRoutes);
  console.log('✓ Quotation routes OK');
} catch (error) {
  console.error('✗ Quotation routes error:', error.message);
}

try {
  console.log('Testing order routes...');
  const orderRoutes = require('./src/routes/orders');
  app.use('/api/orders', orderRoutes);
  console.log('✓ Order routes OK');
} catch (error) {
  console.error('✗ Order routes error:', error.message);
}

try {
  console.log('Testing delivery routes...');
  const deliveryRoutes = require('./src/routes/delivery');
  app.use('/api/delivery', deliveryRoutes);
  console.log('✓ Delivery routes OK');
} catch (error) {
  console.error('✗ Delivery routes error:', error.message);
}

try {
  console.log('Testing invoice routes...');
  const invoiceRoutes = require('./src/routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('✓ Invoice routes OK');
} catch (error) {
  console.error('✗ Invoice routes error:', error.message);
}

try {
  console.log('Testing pricelist routes...');
  const pricelistRoutes = require('./src/routes/pricelists');
  app.use('/api/pricelists', pricelistRoutes);
  console.log('✓ Pricelist routes OK');
} catch (error) {
  console.error('✗ Pricelist routes error:', error.message);
}

try {
  console.log('Testing report routes...');
  const reportRoutes = require('./src/routes/reports');
  app.use('/api/reports', reportRoutes);
  console.log('✓ Report routes OK');
} catch (error) {
  console.error('✗ Report routes error:', error.message);
}

try {
  console.log('Testing notification routes...');
  const notificationRoutes = require('./src/routes/notifications');
  app.use('/api/notifications', notificationRoutes);
  console.log('✓ Notification routes OK');
} catch (error) {
  console.error('✗ Notification routes error:', error.message);
}

console.log('Route testing complete!');