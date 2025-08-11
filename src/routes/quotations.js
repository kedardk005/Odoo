const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer routes
router.post('/', quotationController.createQuotation);
router.get('/my-quotations', quotationController.getMyQuotations);
router.get('/my-quotations/:id', quotationController.getMyQuotationById);
router.post('/:id/confirm', quotationController.confirmQuotation);

// Admin/Staff routes
router.get('/', authorize('admin', 'staff'), quotationController.getAllQuotations);
router.get('/:id', authorize('admin', 'staff'), quotationController.getQuotationById);
router.put('/:id', authorize('admin', 'staff'), quotationController.updateQuotation);
router.patch('/:id/status', authorize('admin', 'staff'), quotationController.updateQuotationStatus);
router.delete('/:id', authorize('admin'), quotationController.deleteQuotation);

// Quotation actions
router.post('/:id/send', authorize('admin', 'staff'), quotationController.sendQuotation);
router.post('/:id/duplicate', authorize('admin', 'staff'), quotationController.duplicateQuotation);
router.get('/:id/pdf', quotationController.generateQuotationPDF);

// Items management
router.post('/:id/items', authorize('admin', 'staff'), quotationController.addQuotationItem);
router.put('/:id/items/:itemId', authorize('admin', 'staff'), quotationController.updateQuotationItem);
router.delete('/:id/items/:itemId', authorize('admin', 'staff'), quotationController.removeQuotationItem);

// Pricing calculations
router.post('/calculate-price', quotationController.calculatePrice);
router.post('/:id/recalculate', authorize('admin', 'staff'), quotationController.recalculateQuotation);

module.exports = router;