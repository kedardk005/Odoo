const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer routes
router.get('/my-invoices', invoiceController.getMyInvoices);

// Admin routes
router.get('/', authorize('admin'), invoiceController.getAllInvoices);
router.get('/:id', authorize('admin'), invoiceController.getInvoiceById);
router.post('/', authorize('admin'), invoiceController.createInvoice);
router.post('/balance-invoice', authorize('admin'), invoiceController.createBalanceInvoice);

// Invoice actions
router.post('/:invoice_id/add-late-fees', authorize('admin'), invoiceController.addLateFees);
router.post('/:invoice_id/mark-paid', authorize('admin'), invoiceController.markAsPaid);

// PDF generation
router.get('/:invoice_id/pdf', invoiceController.generateInvoicePDF);

module.exports = router;