const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Admin routes for contract generation
router.get('/:orderId/generate', authorize('admin'), contractController.generateRentalContract);
router.get('/:orderId/data', authorize('admin'), contractController.generateContractData);

module.exports = router;