const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database associations setup
const setupAssociations = require('./models/associations');

// Import notification scheduler
const notificationScheduler = require('./services/notificationScheduler');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const rentalRoutes = require('./routes/rentals');
const quotationRoutes = require('./routes/quotations');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/delivery');
const invoiceRoutes = require('./routes/invoices');
const pricelistRoutes = require('./routes/pricelists');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const availabilityRoutes = require('./routes/availability');
const contractRoutes = require('./routes/contracts');
const healthController = require('./controllers/healthController');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Starting Rental Management API...');

// Setup database associations
try {
  setupAssociations();
  console.log('✅ Database associations configured successfully');
} catch (error) {
  console.error('❌ Failed to setup database associations:', error.message);
}

// Initialize and start notification scheduler
try {
  notificationScheduler.init();
  notificationScheduler.start();
  console.log('✅ Notification scheduler started successfully');
} catch (error) {
  console.error('❌ Failed to start notification scheduler:', error.message);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/reports', express.static(path.join(__dirname, '..', 'reports')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/pricelists', pricelistRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/contracts', contractRoutes);

// Health check endpoints
app.get('/api/health', healthController.healthCheck);
app.get('/api/status', healthController.systemStatus);
app.get('/api/info', healthController.apiInfo);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rental Management API is running on port ${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`⚠️  Database connections disabled for API testing`);
});