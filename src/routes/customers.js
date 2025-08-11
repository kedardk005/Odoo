const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer can access their own data
router.get('/me', customerController.getMyProfile);
router.put('/me', customerController.updateMyProfile);
router.get('/me/orders', customerController.getMyOrders);
router.get('/me/invoices', customerController.getMyInvoices);
router.get('/me/payments', customerController.getMyPayments);
router.get('/me/notifications', customerController.getMyNotifications);
router.put('/me/notification-preferences', customerController.updateNotificationPreferences);

// Admin routes
router.get('/', authorize('admin'), customerController.getAllCustomers);
router.get('/:id', authorize('admin'), customerController.getCustomerById);
router.put('/:id', authorize('admin'), customerController.updateCustomer);
router.patch('/:id/status', authorize('admin'), customerController.updateCustomerStatus);
router.get('/:id/orders', authorize('admin'), customerController.getCustomerOrders);
router.get('/:id/invoices', authorize('admin'), customerController.getCustomerInvoices);
router.get('/:id/payments', authorize('admin'), customerController.getCustomerPayments);
router.get('/:id/stats', authorize('admin'), customerController.getCustomerStats);
router.delete('/:id', authorize('admin'), customerController.deleteCustomer);

// Search and filter
router.post('/search', authorize('admin'), customerController.searchCustomers);
router.get('/filter/type', authorize('admin'), customerController.getCustomersByType);
router.get('/filter/active', authorize('admin'), customerController.getActiveCustomers);

module.exports = router;