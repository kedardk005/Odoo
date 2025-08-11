const RentalQuotation = require('../models/RentalQuotation');
const User = require('../models/User');
const { sequelize } = require('../config/database');

const quotationController = {
  // Create new quotation
  createQuotation: async (req, res) => {
    try {
      const customerId = req.user.user_id;
      const { items, notes } = req.body;

      const quotation = await RentalQuotation.create({
        customer_id: customerId,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        message: 'Quotation created successfully',
        data: { quotation }
      });
    } catch (error) {
      console.error('Create quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quotation',
        error: error.message
      });
    }
  },

  // Get all quotations (admin/staff)
  getAllQuotations: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, customer } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (customer) whereClause.customer_id = customer;

      const quotations = await RentalQuotation.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email', 'phone_number']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          quotations: quotations.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(quotations.count / limit),
            totalItems: quotations.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all quotations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotations',
        error: error.message
      });
    }
  },

  // Get quotation by ID (admin/staff)
  getQuotationById: async (req, res) => {
    try {
      const { id } = req.params;

      const quotation = await RentalQuotation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email', 'phone_number']
          }
        ]
      });

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      res.json({
        success: true,
        data: { quotation }
      });
    } catch (error) {
      console.error('Get quotation by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotation',
        error: error.message
      });
    }
  },

  // Get current user's quotations
  getMyQuotations: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = { customer_id: userId };
      if (status) whereClause.status = status;

      const quotations = await RentalQuotation.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          quotations: quotations.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(quotations.count / limit),
            totalItems: quotations.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my quotations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your quotations',
        error: error.message
      });
    }
  },

  // Get current user's quotation by ID
  getMyQuotationById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const quotation = await RentalQuotation.findOne({
        where: { quotation_id: id, customer_id: userId }
      });

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      res.json({
        success: true,
        data: { quotation }
      });
    } catch (error) {
      console.error('Get my quotation by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotation',
        error: error.message
      });
    }
  },

  // Update quotation (admin/staff)
  updateQuotation: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const quotation = await RentalQuotation.findByPk(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      await quotation.update(updates);

      res.json({
        success: true,
        message: 'Quotation updated successfully',
        data: { quotation }
      });
    } catch (error) {
      console.error('Update quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quotation',
        error: error.message
      });
    }
  },

  // Update quotation status (admin/staff)
  updateQuotationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
        });
      }

      const quotation = await RentalQuotation.findByPk(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      await quotation.update({ status });

      res.json({
        success: true,
        message: 'Quotation status updated successfully',
        data: { quotation }
      });
    } catch (error) {
      console.error('Update quotation status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quotation status',
        error: error.message
      });
    }
  },

  // Delete quotation (admin only)
  deleteQuotation: async (req, res) => {
    try {
      const { id } = req.params;

      const quotation = await RentalQuotation.findByPk(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      await quotation.destroy();

      res.json({
        success: true,
        message: 'Quotation deleted successfully'
      });
    } catch (error) {
      console.error('Delete quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quotation',
        error: error.message
      });
    }
  },

  // Confirm quotation (convert to order)
  confirmQuotation: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const quotation = await RentalQuotation.findOne({
        where: { quotation_id: id, customer_id: userId }
      });

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      if (quotation.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Only approved quotations can be confirmed'
        });
      }

      // TODO: Create order from quotation
      // This would involve creating a rental order with the quotation details

      res.json({
        success: true,
        message: 'Quotation confirmed and order created successfully'
      });
    } catch (error) {
      console.error('Confirm quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm quotation',
        error: error.message
      });
    }
  },

  // Send quotation (admin/staff)
  sendQuotation: async (req, res) => {
    try {
      const { id } = req.params;

      const quotation = await RentalQuotation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email']
          }
        ]
      });

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      // TODO: Send email with quotation details
      console.log(`Sending quotation ${id} to ${quotation.customer.email}`);

      res.json({
        success: true,
        message: 'Quotation sent successfully'
      });
    } catch (error) {
      console.error('Send quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send quotation',
        error: error.message
      });
    }
  },

  // Duplicate quotation (admin/staff)
  duplicateQuotation: async (req, res) => {
    try {
      const { id } = req.params;

      const originalQuotation = await RentalQuotation.findByPk(id);
      if (!originalQuotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      const duplicatedQuotation = await RentalQuotation.create({
        customer_id: originalQuotation.customer_id,
        status: 'pending'
      });

      res.json({
        success: true,
        message: 'Quotation duplicated successfully',
        data: { quotation: duplicatedQuotation }
      });
    } catch (error) {
      console.error('Duplicate quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to duplicate quotation',
        error: error.message
      });
    }
  },

  // Generate quotation PDF
  generateQuotationPDF: async (req, res) => {
    try {
      const { id } = req.params;

      const quotation = await RentalQuotation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email']
          }
        ]
      });

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      // TODO: Generate PDF
      res.json({
        success: true,
        message: 'PDF generation functionality will be implemented',
        data: { quotation }
      });
    } catch (error) {
      console.error('Generate quotation PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate quotation PDF',
        error: error.message
      });
    }
  },

  // Quotation item management methods
  addQuotationItem: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Add quotation item functionality will be implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to add quotation item',
        error: error.message
      });
    }
  },

  updateQuotationItem: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Update quotation item functionality will be implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update quotation item',
        error: error.message
      });
    }
  },

  removeQuotationItem: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Remove quotation item functionality will be implemented'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to remove quotation item',
        error: error.message
      });
    }
  },

  // Calculate price
  calculatePrice: async (req, res) => {
    try {
      const { items, duration, customerType } = req.body;

      // TODO: Implement pricing calculation logic
      const calculatedPrice = {
        subtotal: 0,
        taxes: 0,
        total: 0,
        breakdown: []
      };

      res.json({
        success: true,
        data: { pricing: calculatedPrice }
      });
    } catch (error) {
      console.error('Calculate price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate price',
        error: error.message
      });
    }
  },

  // Recalculate quotation
  recalculateQuotation: async (req, res) => {
    try {
      const { id } = req.params;

      const quotation = await RentalQuotation.findByPk(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Quotation not found'
        });
      }

      // TODO: Implement recalculation logic

      res.json({
        success: true,
        message: 'Quotation recalculated successfully',
        data: { quotation }
      });
    } catch (error) {
      console.error('Recalculate quotation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to recalculate quotation',
        error: error.message
      });
    }
  }
};

module.exports = quotationController;