const express = require('express');
const router = express.Router();
const productAvailabilityController = require('../controllers/productAvailabilityController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public routes (for checking availability)
router.get('/calendar', productAvailabilityController.getProductAvailabilityCalendar);
router.post('/check', productAvailabilityController.checkAvailability);
router.post('/bulk-check', productAvailabilityController.getBulkAvailability);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin routes for reservation management
router.post('/reserve', authorize('admin'), productAvailabilityController.reserveProduct);
router.post('/release', authorize('admin'), productAvailabilityController.releaseReservation);

module.exports = router;