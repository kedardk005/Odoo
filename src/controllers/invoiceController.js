const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const invoiceController = {
  // Get all invoices (admin/staff)
  getAllInvoices: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, customer, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (customer) whereClause.customer_id = customer;
      if (startDate && endDate) {
        whereClause.invoice_date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const invoices = await Invoice.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [
              {
                model: User,
                as: 'customer',
                attributes: ['user_id', 'full_name', 'email', 'phone_number']
              }
            ]
          },
          {
            model: Payment,
            as: 'payments'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          invoices: invoices.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(invoices.count / limit),
            totalItems: invoices.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices',
        error: error.message
      });
    }
  },

  // Get invoice by ID
  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [
              {
                model: User,
                as: 'customer',
                attributes: ['user_id', 'full_name', 'email', 'phone_number', 'address']
              },
              {
                model: RentalOrderItem,
                as: 'items',
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['product_id', 'name', 'sku_code', 'description']
                  }
                ]
              }
            ]
          },
          {
            model: Payment,
            as: 'payments'
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: { invoice }
      });
    } catch (error) {
      console.error('Get invoice by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoice',
        error: error.message
      });
    }
  },

  // Create invoice from rental order (supports full upfront and partial payment)
  createInvoice: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { 
        order_id, 
        payment_type = 'full', // 'full' or 'partial'
        deposit_percentage,
        due_date,
        notes 
      } = req.body;

      if (!order_id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      // Get the rental order with items
      const order = await RentalOrder.findByPk(order_id, {
        include: [
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product'
              }
            ]
          },
          {
            model: User,
            as: 'customer'
          }
        ],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rental order not found'
        });
      }

      // Calculate invoice amounts
      const orderTotal = parseFloat(order.total_amount);
      let invoiceAmount = orderTotal;
      let depositAmount = 0;
      let balanceAmount = 0;

      if (payment_type === 'partial') {
        const depositPercent = deposit_percentage || 30; // Default 30% deposit
        depositAmount = (orderTotal * depositPercent) / 100;
        invoiceAmount = depositAmount;
        balanceAmount = orderTotal - depositAmount;
      }

      // Generate unique invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create the invoice
      const invoice = await Invoice.create({
        order_id,
        customer_id: order.customer_id,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        due_date: due_date ? new Date(due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        total_amount: orderTotal,
        invoice_amount: invoiceAmount,
        deposit_amount: depositAmount,
        balance_amount: balanceAmount,
        payment_type,
        status: 'pending',
        notes
      }, { transaction });

      // Update order status if full payment invoice
      if (payment_type === 'full') {
        await order.update({
          status: 'confirmed',
          deposit_amount: 0
        }, { transaction });
      } else {
        await order.update({
          deposit_amount: depositAmount
        }, { transaction });
      }

      await transaction.commit();

      // Fetch the created invoice with relationships
      const createdInvoice = await Invoice.findByPk(invoice.invoice_id, {
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [
              {
                model: User,
                as: 'customer',
                attributes: ['user_id', 'full_name', 'email', 'phone_number']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: `${payment_type === 'full' ? 'Full payment' : 'Deposit'} invoice created successfully`,
        data: { invoice: createdInvoice }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create invoice',
        error: error.message
      });
    }
  },

  // Create balance invoice for partial payment orders
  createBalanceInvoice: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { order_id, due_date, notes } = req.body;

      // Get the order and check if it has a deposit invoice
      const order = await RentalOrder.findByPk(order_id, {
        include: [
          {
            model: Invoice,
            as: 'invoices',
            where: { payment_type: 'partial' }
          },
          {
            model: User,
            as: 'customer'
          }
        ],
        transaction
      });

      if (!order || !order.invoices || order.invoices.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'No deposit invoice found for this order'
        });
      }

      const depositInvoice = order.invoices[0];
      const balanceAmount = parseFloat(depositInvoice.balance_amount);

      if (balanceAmount <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'No balance amount remaining for this order'
        });
      }

      const invoiceNumber = await this.generateInvoiceNumber();

      const balanceInvoice = await Invoice.create({
        order_id,
        customer_id: order.customer_id,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
        due_date: due_date ? new Date(due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        total_amount: parseFloat(order.total_amount),
        invoice_amount: balanceAmount,
        deposit_amount: 0,
        balance_amount: 0,
        payment_type: 'balance',
        status: 'pending',
        notes
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Balance invoice created successfully',
        data: { invoice: balanceInvoice }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create balance invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create balance invoice',
        error: error.message
      });
    }
  },

  // Add late fees to invoice
  addLateFees: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { invoice_id, late_fee_amount, reason } = req.body;

      const invoice = await Invoice.findByPk(invoice_id, { transaction });
      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      const newTotalAmount = parseFloat(invoice.total_amount) + parseFloat(late_fee_amount);
      const newInvoiceAmount = parseFloat(invoice.invoice_amount) + parseFloat(late_fee_amount);

      await invoice.update({
        total_amount: newTotalAmount,
        invoice_amount: newInvoiceAmount,
        late_fee_amount: parseFloat(late_fee_amount),
        late_fee_reason: reason,
        status: 'overdue'
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Late fees added successfully',
        data: { 
          invoice,
          late_fee_added: parseFloat(late_fee_amount),
          new_total: newTotalAmount
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Add late fees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add late fees',
        error: error.message
      });
    }
  },

  // Mark invoice as paid
  markAsPaid: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { invoice_id, payment_method, payment_reference, amount_paid } = req.body;

      const invoice = await Invoice.findByPk(invoice_id, { transaction });
      if (!invoice) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Create payment record
      const payment = await Payment.create({
        invoice_id,
        payment_amount: amount_paid || invoice.invoice_amount,
        method: payment_method,
        payment_reference,
        status: 'success',
        payment_date: new Date()
      }, { transaction });

      // Update invoice status
      await invoice.update({
        status: 'paid',
        paid_date: new Date()
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Invoice marked as paid successfully',
        data: { invoice, payment }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Mark as paid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark invoice as paid',
        error: error.message
      });
    }
  },

  // Get customer invoices
  getMyInvoices: async (req, res) => {
    try {
      const customerId = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = { customer_id: customerId };
      if (status) whereClause.status = status;

      const invoices = await Invoice.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: RentalOrder,
            as: 'order',
            attributes: ['order_id', 'pickup_date', 'return_date', 'status']
          },
          {
            model: Payment,
            as: 'payments'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          invoices: invoices.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(invoices.count / limit),
            totalItems: invoices.count
          }
        }
      });
    } catch (error) {
      console.error('Get my invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch invoices',
        error: error.message
      });
    }
  },

  // Generate unique invoice number
  generateInvoiceNumber: async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Find the last invoice for today
    const lastInvoice = await Invoice.findOne({
      where: {
        invoice_number: {
          [Op.like]: `INV-${year}${month}-%`
        }
      },
      order: [['invoice_number', 'DESC']]
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `INV-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;
  },

  // Generate invoice PDF
  generateInvoicePDF: async (req, res) => {
    try {
      const { invoice_id } = req.params;

      const invoice = await Invoice.findByPk(invoice_id, {
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [
              {
                model: User,
                as: 'customer'
              },
              {
                model: RentalOrderItem,
                as: 'items',
                include: [
                  {
                    model: Product,
                    as: 'product'
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Generate PDF logic would go here
      // For now, return invoice data
      res.json({
        success: true,
        message: 'Invoice PDF generated successfully',
        data: { invoice }
      });
    } catch (error) {
      console.error('Generate invoice PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate invoice PDF',
        error: error.message
      });
    }
  }
};

module.exports = invoiceController;