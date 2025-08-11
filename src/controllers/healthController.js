const { sequelize } = require('../config/database');
const { testConnection } = require('../services/emailService');

const healthController = {
  // Basic health check
  healthCheck: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Rental Management API is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  },

  // Detailed system status
  systemStatus: async (req, res) => {
    try {
      const status = {
        api: 'healthy',
        database: 'unknown',
        email: 'unknown',
        timestamp: new Date().toISOString()
      };

      // Test database connection
      try {
        await sequelize.authenticate();
        status.database = 'connected';
      } catch (error) {
        status.database = 'error';
        status.databaseError = error.message;
      }

      // Test email service
      try {
        const emailTest = await testConnection();
        status.email = emailTest.success ? 'connected' : 'error';
        if (!emailTest.success) {
          status.emailError = emailTest.message;
        }
      } catch (error) {
        status.email = 'error';
        status.emailError = error.message;
      }

      const overallHealthy = status.database === 'connected' && status.email === 'connected';

      res.status(overallHealthy ? 200 : 503).json({
        success: overallHealthy,
        status,
        message: overallHealthy ? 'All systems operational' : 'Some systems are experiencing issues'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'System status check failed',
        error: error.message
      });
    }
  },

  // API endpoints summary
  apiInfo: async (req, res) => {
    try {
      const endpoints = {
        authentication: [
          'POST /api/auth/register - User registration',
          'POST /api/auth/login - User login',
          'GET /api/auth/profile - Get user profile',
          'PUT /api/auth/profile - Update profile'
        ],
        products: [
          'GET /api/products - List products',
          'GET /api/products/:id - Get product details',
          'POST /api/products - Create product (Admin)',
          'PUT /api/products/:id - Update product (Admin)'
        ],
        rentals: [
          'POST /api/quotations - Create quotation',
          'POST /api/orders - Create order',
          'GET /api/rentals/my-rentals - Get user rentals',
          'GET /api/delivery - Delivery management'
        ],
        reports: [
          'GET /api/reports/dashboard - Dashboard data',
          'GET /api/reports/revenue/overview - Revenue reports',
          'GET /api/reports/customers/top-customers - Customer analytics'
        ]
      };

      res.json({
        success: true,
        message: 'Rental Management API Endpoints',
        version: '1.0.0',
        baseUrl: `${req.protocol}://${req.get('host')}/api`,
        endpoints
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'API info failed',
        error: error.message
      });
    }
  }
};

module.exports = healthController;