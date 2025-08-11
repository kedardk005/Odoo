const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin routes for delivery management
router.get('/', authorize('admin'), deliveryController.getAllDeliveries);
router.post('/schedule-pickup/:orderId', authorize('admin'), deliveryController.schedulePickup);
router.post('/schedule-return/:orderId', authorize('admin'), deliveryController.scheduleReturn);
router.post('/pickup/:pickupId/complete', authorize('admin'), deliveryController.markPickupCompleted);
router.post('/return/:returnId/complete', authorize('admin'), deliveryController.markReturnCompleted);
router.get('/overdue-returns', authorize('admin'), deliveryController.getOverdueReturns);
router.get('/calculate-late-fees/:returnId', authorize('admin'), deliveryController.calculateLateFees);
router.get('/calendar', authorize('admin'), deliveryController.getDeliveryCalendar);

module.exports = router;