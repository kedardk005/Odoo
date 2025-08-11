const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer routes
router.post('/', orderController.createOrder);
router.post('/:orderId/cancel', orderController.cancelOrder);

// Admin routes
router.get('/', authorize('admin'), orderController.getAllOrders);

// Order actions
router.post('/:orderId/confirm', authorize('admin'), orderController.confirmOrder);
router.post('/:orderId/start-rental', authorize('admin'), orderController.startRental);
router.post('/:orderId/complete-rental', authorize('admin'), orderController.completeRental);
router.post('/:orderId/extend', authorize('admin'), orderController.extendOrder);

// Late fees calculation
router.get('/:orderId/calculate-late-fees', authorize('admin'), orderController.calculateLateFees);

// Analytics
router.get('/analytics', authorize('admin'), orderController.getOrderAnalytics);

module.exports = router;