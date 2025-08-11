const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorize('admin'));

// Dashboard analytics
router.get('/dashboard', reportController.getDashboardData);

// Revenue reports
router.get('/revenue/overview', reportController.getRevenueOverview);

// Customer reports
router.get('/customers/top-customers', reportController.getTopCustomers);

// Inventory reports
router.get('/inventory/utilization', reportController.getInventoryUtilization);

// Export functionality
router.get('/export/excel', reportController.exportToExcel);
router.get('/export/pdf', reportController.exportToPDF);

module.exports = router;