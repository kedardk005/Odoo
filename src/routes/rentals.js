const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer routes
router.get('/my-rentals', rentalController.getMyRentals);
router.get('/my-rentals/:id', rentalController.getMyRentalById);

// Admin routes
router.get('/', authorize('admin'), rentalController.getAllRentals);
router.get('/:id', authorize('admin'), rentalController.getRentalById);
router.patch('/:id/status', authorize('admin'), rentalController.updateRentalStatus);
router.post('/:id/extend', authorize('admin'), rentalController.extendRental);
router.post('/:id/terminate', authorize('admin'), rentalController.terminateRental);

// Rental analytics and reports
router.get('/analytics/overview', authorize('admin'), rentalController.getRentalAnalytics);
router.get('/analytics/product/:productId', authorize('admin'), rentalController.getProductRentalHistory);
router.get('/analytics/customer/:customerId', authorize('admin'), rentalController.getCustomerRentalHistory);

// Calendar and availability
router.get('/calendar', authorize('admin'), rentalController.getRentalCalendar);
router.get('/availability/:productId', rentalController.checkProductAvailability);

module.exports = router;