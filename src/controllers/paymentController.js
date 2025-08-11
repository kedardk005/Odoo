const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const RentalOrder = require('../models/RentalOrder');
const User = require('../models/User');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const paymentController = {
  // Get all payments (admin/staff only)
  getAllPayments: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, method } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (method) whereClause.method = method;

      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Invoice,
            as: 'invoice',
            include: [
              {
                model: RentalOrder,
                as: 'order',
                include: [
                  {
                    model: User,
                    as: 'customer',
                    attributes: ['user_id', 'full_name', 'email']
                  }
                ]
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['payment_date', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(payments.count / limit),
            totalItems: payments.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        error: error.message
      });
    }
  },

  // Get payment by ID (admin/staff only)
  getPaymentById: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
        include: [
          {
            model: Invoice,
            as: 'invoice',
            include: [
              {
                model: RentalOrder,
                as: 'order',
                include: [
                  {
                    model: User,
                    as: 'customer',
                    attributes: ['user_id', 'full_name', 'email']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      console.error('Get payment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment',
        error: error.message
      });
    }
  },

  // Get my payments (customer)
  getMyPayments: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;

      // Get payments through invoices and orders
      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Invoice,
            as: 'invoice',
            include: [
              {
                model: RentalOrder,
                as: 'order',
                where: { customer_id: userId },
                include: [
                  {
                    model: User,
                    as: 'customer',
                    attributes: ['user_id', 'full_name', 'email']
                  }
                ]
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['payment_date', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(payments.count / limit),
            totalItems: payments.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your payments',
        error: error.message
      });
    }
  },

  // Create payment
  createPayment: async (req, res) => {
    try {
      const { invoice_id, amount, method } = req.body;

      if (!invoice_id || !amount || !method) {
        return res.status(400).json({
          success: false,
          message: 'Invoice ID, amount, and payment method are required'
        });
      }

      // Check if invoice exists
      const invoice = await Invoice.findByPk(invoice_id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Create payment
      const payment = await Payment.create({
        invoice_id,
        amount: parseFloat(amount),
        method,
        status: 'pending'
      });

      // Update invoice paid amount
      const newPaidAmount = parseFloat(invoice.paid_amount) + parseFloat(amount);
      let invoiceStatus = 'unpaid';

      if (newPaidAmount >= parseFloat(invoice.total_amount)) {
        invoiceStatus = 'paid';
      } else if (newPaidAmount > 0) {
        invoiceStatus = 'partial';
      }

      await invoice.update({
        paid_amount: newPaidAmount,
        status: invoiceStatus
      });

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: { payment }
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment',
        error: error.message
      });
    }
  },

  // Update payment status (admin/staff only)
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['success', 'failed', 'pending'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
        });
      }

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      await payment.update({ status });

      // If payment failed, update invoice paid amount
      if (status === 'failed') {
        const invoice = await Invoice.findByPk(payment.invoice_id);
        if (invoice) {
          const newPaidAmount = Math.max(0, parseFloat(invoice.paid_amount) - parseFloat(payment.amount));
          let invoiceStatus = 'unpaid';

          if (newPaidAmount >= parseFloat(invoice.total_amount)) {
            invoiceStatus = 'paid';
          } else if (newPaidAmount > 0) {
            invoiceStatus = 'partial';
          }

          await invoice.update({
            paid_amount: newPaidAmount,
            status: invoiceStatus
          });
        }
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: { payment }
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status',
        error: error.message
      });
    }
  },

  // Process refund (admin/staff only)
  processRefund: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, refund_amount } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.status !== 'success') {
        return res.status(400).json({
          success: false,
          message: 'Can only refund successful payments'
        });
      }

      const refundAmount = refund_amount ? parseFloat(refund_amount) : parseFloat(payment.amount);

      // Create refund payment (negative amount)
      const refundPayment = await Payment.create({
        invoice_id: payment.invoice_id,
        amount: -refundAmount,
        method: payment.method + '_refund',
        status: 'success'
      });

      // Update invoice paid amount
      const invoice = await Invoice.findByPk(payment.invoice_id);
      if (invoice) {
        const newPaidAmount = Math.max(0, parseFloat(invoice.paid_amount) - refundAmount);
        let invoiceStatus = 'unpaid';

        if (newPaidAmount >= parseFloat(invoice.total_amount)) {
          invoiceStatus = 'paid';
        } else if (newPaidAmount > 0) {
          invoiceStatus = 'partial';
        }

        await invoice.update({
          paid_amount: newPaidAmount,
          status: invoiceStatus
        });
      }

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: { 
          original_payment: payment,
          refund_payment: refundPayment,
          refund_amount: refundAmount,
          reason
        }
      });
    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  },

  // Get payment analytics (admin/staff only)
  getPaymentAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.payment_date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const [totalPayments, successfulPayments, failedPayments, pendingPayments, totalAmount] = await Promise.all([
        Payment.count({ where: dateFilter }),
        Payment.count({ where: { ...dateFilter, status: 'success' } }),
        Payment.count({ where: { ...dateFilter, status: 'failed' } }),
        Payment.count({ where: { ...dateFilter, status: 'pending' } }),
        Payment.sum('amount', { where: { ...dateFilter, status: 'success' } })
      ]);

      res.json({
        success: true,
        data: {
          totalPayments,
          successfulPayments,
          failedPayments,
          pendingPayments,
          totalAmount: totalAmount || 0,
          successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Get payment analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment analytics',
        error: error.message
      });
    }
  },

  // Initiate online payment (Stripe, PayPal, etc.)
  initiateOnlinePayment: async (req, res) => {
    try {
      const { invoice_id, payment_method, return_url } = req.body;

      if (!invoice_id || !payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Invoice ID and payment method are required'
        });
      }

      const invoice = await Invoice.findByPk(invoice_id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      const remainingAmount = parseFloat(invoice.total_amount) - parseFloat(invoice.paid_amount);
      if (remainingAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invoice is already fully paid'
        });
      }

      // TODO: Integrate with actual payment gateways
      // For now, return a mock response
      res.json({
        success: true,
        message: 'Payment gateway integration to be implemented',
        data: {
          payment_url: `https://checkout.example.com/pay/${invoice_id}`,
          amount: remainingAmount,
          currency: 'INR',
          payment_method,
          return_url
        }
      });
    } catch (error) {
      console.error('Initiate online payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate online payment',
        error: error.message
      });
    }
  },

  processPayment: async (req, res) => {
    try {
      res.json({ success: true, message: 'Process payment functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to process payment', error: error.message });
    }
  },

  getInvoicePayments: async (req, res) => {
    try {
      const { id } = req.params;
      const payments = await Payment.findAll({ where: { invoice_id: id } });
      res.json({ success: true, data: { payments } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get invoice payments', error: error.message });
    }
  },

  addPayment: async (req, res) => {
    try {
      res.json({ success: true, message: 'Add payment functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add payment', error: error.message });
    }
  },

  addPartialPayment: async (req, res) => {
    try {
      res.json({ success: true, message: 'Add partial payment functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add partial payment', error: error.message });
    }
  }
};

module.exports = paymentController;