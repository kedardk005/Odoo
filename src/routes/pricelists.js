const express = require('express');
const router = express.Router();
const pricelistController = require('../controllers/pricelistController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Public route for calculating rental prices
router.post('/calculate-rental-price', pricelistController.calculateRentalPrice);

// Protected routes
router.use(authenticateToken);

// Admin/Staff routes
router.get('/', authorize('admin'), pricelistController.getAllPricelists);
router.post('/', authorize('admin'), pricelistController.createPricelist);
router.get('/product/:productId', authorize('admin'), pricelistController.getProductPricing);
router.post('/bulk-update', authorize('admin'), pricelistController.bulkUpdatePricing);
router.get('/seasonal', authorize('admin'), pricelistController.getSeasonalPricing);

module.exports = router;