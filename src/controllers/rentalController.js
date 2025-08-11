const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const rentalController = {
  // Get all rentals (admin/staff only)
  getAllRentals: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, customer } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (customer) whereClause.customer_id = customer;

      const rentals = await RentalOrder.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email', 'phone_number']
          },
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          rentals: rentals.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(rentals.count / limit),
            totalItems: rentals.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rentals',
        error: error.message
      });
    }
  },

  // Get rental by ID (admin/staff only)
  getRentalById: async (req, res) => {
    try {
      const { id } = req.params;

      const rental = await RentalOrder.findByPk(id, {
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email', 'phone_number']
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
      });

      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      res.json({
        success: true,
        data: { rental }
      });
    } catch (error) {
      console.error('Get rental by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental',
        error: error.message
      });
    }
  },

  // Get current user's rentals
  getMyRentals: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = { customer_id: userId };
      if (status) whereClause.status = status;

      const rentals = await RentalOrder.findAndCountAll({
        where: whereClause,
        include: [
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
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          rentals: rentals.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(rentals.count / limit),
            totalItems: rentals.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your rentals',
        error: error.message
      });
    }
  },

  // Get current user's rental by ID
  getMyRentalById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;

      const rental = await RentalOrder.findOne({
        where: { order_id: id, customer_id: userId },
        include: [
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
      });

      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      res.json({
        success: true,
        data: { rental }
      });
    } catch (error) {
      console.error('Get my rental by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental',
        error: error.message
      });
    }
  },

  // Update rental status (admin/staff only)
  updateRentalStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
        });
      }

      const rental = await RentalOrder.findByPk(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      await rental.update({ status });

      res.json({
        success: true,
        message: 'Rental status updated successfully',
        data: { rental }
      });
    } catch (error) {
      console.error('Update rental status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rental status',
        error: error.message
      });
    }
  },

  // Extend rental (admin/staff only)
  extendRental: async (req, res) => {
    try {
      const { id } = req.params;
      const { newReturnDate, additionalAmount } = req.body;

      const rental = await RentalOrder.findByPk(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      await rental.update({
        return_date: newReturnDate,
        total_amount: rental.total_amount + (additionalAmount || 0)
      });

      res.json({
        success: true,
        message: 'Rental extended successfully',
        data: { rental }
      });
    } catch (error) {
      console.error('Extend rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend rental',
        error: error.message
      });
    }
  },

  // Terminate rental early (admin/staff only)
  terminateRental: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, refundAmount } = req.body;

      const rental = await RentalOrder.findByPk(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      await rental.update({
        status: 'cancelled',
        return_date: new Date()
      });

      res.json({
        success: true,
        message: 'Rental terminated successfully',
        data: { rental, reason, refundAmount }
      });
    } catch (error) {
      console.error('Terminate rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate rental',
        error: error.message
      });
    }
  },

  // Get rental analytics (admin/staff only)
  getRentalAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const [totalRentals, activeRentals, completedRentals, cancelledRentals, totalRevenue] = await Promise.all([
        RentalOrder.count({ where: dateFilter }),
        RentalOrder.count({ where: { ...dateFilter, status: 'in_progress' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'completed' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'cancelled' } }),
        RentalOrder.sum('total_amount', { where: { ...dateFilter, status: 'completed' } })
      ]);

      res.json({
        success: true,
        data: {
          totalRentals,
          activeRentals,
          completedRentals,
          cancelledRentals,
          totalRevenue: totalRevenue || 0
        }
      });
    } catch (error) {
      console.error('Get rental analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental analytics',
        error: error.message
      });
    }
  },

  // Get product rental history (admin/staff only)
  getProductRentalHistory: async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const rentals = await RentalOrderItem.findAndCountAll({
        where: { product_id: productId },
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
          },
          {
            model: Product,
            as: 'product',
            attributes: ['product_id', 'name', 'sku_code']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['order', 'created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          history: rentals.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(rentals.count / limit),
            totalItems: rentals.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get product rental history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product rental history',
        error: error.message
      });
    }
  },

  // Get customer rental history (admin/staff only)
  getCustomerRentalHistory: async (req, res) => {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const rentals = await RentalOrder.findAndCountAll({
        where: { customer_id: customerId },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email']
          },
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          history: rentals.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(rentals.count / limit),
            totalItems: rentals.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get customer rental history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer rental history',
        error: error.message
      });
    }
  },

  // Get rental calendar (admin/staff only)
  getRentalCalendar: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter[Op.or] = [
          {
            pickup_date: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          {
            return_date: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          }
        ];
      }

      const rentals = await RentalOrder.findAll({
        where: dateFilter,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['user_id', 'full_name', 'email']
          },
          {
            model: RentalOrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'sku_code']
              }
            ]
          }
        ],
        order: [['pickup_date', 'ASC']]
      });

      res.json({
        success: true,
        data: { calendar: rentals }
      });
    } catch (error) {
      console.error('Get rental calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental calendar',
        error: error.message
      });
    }
  },

  // Check product availability
  checkProductAvailability: async (req, res) => {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      // Get total quantity from inventory
      const inventory = await sequelize.query(`
        SELECT quantity_available FROM product_inventory WHERE product_id = :productId
      `, {
        replacements: { productId },
        type: sequelize.QueryTypes.SELECT
      });

      const totalQuantity = inventory.reduce((sum, inv) => sum + inv.quantity_available, 0);

      // Get booked quantity for the date range
      const bookedQuantity = await sequelize.query(`
        SELECT COALESCE(SUM(roi.quantity), 0) as booked_quantity
        FROM rental_order_items roi
        JOIN rental_orders ro ON roi.order_id = ro.order_id
        WHERE roi.product_id = :productId
        AND ro.status NOT IN ('cancelled', 'completed')
        AND ro.pickup_date <= :endDate
        AND ro.return_date >= :startDate
      `, {
        replacements: { productId, startDate, endDate },
        type: sequelize.QueryTypes.SELECT
      });

      const bookedQty = bookedQuantity[0]?.booked_quantity || 0;
      const availableQuantity = totalQuantity - bookedQty;

      res.json({
        success: true,
        data: {
          productId: parseInt(productId),
          totalQuantity,
          bookedQuantity: bookedQty,
          availableQuantity: Math.max(0, availableQuantity),
          isAvailable: availableQuantity > 0
        }
      });
    } catch (error) {
      console.error('Check product availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check product availability',
        error: error.message
      });
    }
  }
};

module.exports = rentalController;