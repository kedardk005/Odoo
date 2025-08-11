const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes (with optional authentication for personalized results)
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/search', optionalAuth, productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', optionalAuth, productController.getFeaturedProducts);
router.get('/availability', productController.checkAvailability);
router.get('/:id', optionalAuth, productController.getProductById);

// Protected routes - Admin only
router.use(authenticateToken);
router.post('/', authorize('admin'), upload.array('images', 10), productController.createProduct);
router.put('/:id', authorize('admin'), upload.array('images', 10), productController.updateProduct);
router.delete('/:id', authorize('admin'), productController.deleteProduct);
router.patch('/:id/status', authorize('admin'), productController.updateProductStatus);
router.post('/:id/images', authorize('admin'), upload.array('images', 10), productController.uploadProductImages);
router.delete('/:id/images/:imageId', authorize('admin'), productController.deleteProductImage);

// Inventory management
router.get('/:id/inventory', authorize('admin'), productController.getProductInventory);
router.patch('/:id/inventory', authorize('admin'), productController.updateInventory);
router.get('/:id/reservations', authorize('admin'), productController.getProductReservations);

// Rental-specific endpoints
router.post('/:id/configure-rental', authorize('admin'), productController.configureRentalSettings);
router.get('/:id/rental-pricing', productController.getRentalPricing);
router.get('/:id/availability-calendar', productController.getAvailabilityCalendar);
router.post('/:id/check-availability', productController.checkDetailedAvailability);

module.exports = router;