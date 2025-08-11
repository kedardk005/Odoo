const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const RentalQuotation = require('../models/RentalQuotation');
const Product = require('../models/Product');
const ProductInventory = require('../models/ProductInventory');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Pickup = require('../models/Pickup');
const Return = require('../models/Return');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const orderController = {
  // Create rental order from quotation or direct
  createOrder: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const { quotation_id, customer_id, items, pickup_date, return_date, deposit_amount } = req.body;

      if (!customer_id || !items || !Array.isArray(items)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Customer ID and items are required'
        });
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Product ${item.product_id} not found`
          });
        }

        // Check availability
        const inventory = await ProductInventory.findOne({
          where: { product_id: item.product_id }
        });

        if (!inventory || inventory.quantity_available < item.quantity) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for product ${product.name}`
          });
        }

        totalAmount += parseFloat(item.unit_price) * parseInt(item.quantity);
      }

      // Create rental order
      const order = await RentalOrder.create({
        quotation_id,
        customer_id,
        status: 'confirmed',
        pickup_date: pickup_date ? new Date(pickup_date) : null,
        return_date: return_date ? new Date(return_date) : null,
        total_amount: totalAmount,
        deposit_amount: deposit_amount || 0
      }, { transaction });

      // Create order items and update inventory
      for (const item of items) {
        await RentalOrderItem.create({
          order_id: order.order_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          rental_duration: item.rental_duration || 1,
          rental_period_type: item.rental_period_type || 'day'
        }, { transaction });

        // Reserve inventory
        await ProductInventory.decrement(
          'quantity_available',
          {
            by: parseInt(item.quantity),
            where: { product_id: item.product_id },
            transaction
          }
        );
      }

      // Update quotation status if created from quotation
      if (quotation_id) {
        await RentalQuotation.update(
          { status: 'converted' },
          { where: { quotation_id }, transaction }
        );
      }

      await transaction.commit();

      // Fetch created order with details
      const createdOrder = await RentalOrder.findByPk(order.order_id, {
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

      res.status(201).json({
        success: true,
        message: 'Rental order created successfully',
        data: { order: createdOrder }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  },

  // Get all orders (admin/staff)
  getAllOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, customer, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (customer) whereClause.customer_id = customer;
      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const orders = await RentalOrder.findAndCountAll({
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
          orders: orders.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(orders.count / limit),
            totalItems: orders.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
  },

  // Confirm order and start rental process
  confirmOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { pickup_schedule } = req.body;

      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status
      await order.update({ status: 'confirmed' });

      // Schedule pickup if requested
      if (pickup_schedule) {
        await Pickup.create({
          order_id: orderId,
          scheduled_time: new Date(pickup_schedule.scheduled_time),
          address: pickup_schedule.address,
          contact_person: pickup_schedule.contact_person,
          contact_phone: pickup_schedule.contact_phone,
          status: 'scheduled'
        });
      }

      res.json({
        success: true,
        message: 'Order confirmed successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Confirm order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm order',
        error: error.message
      });
    }
  },

  // Start rental (mark as in progress)
  startRental: async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      await order.update({ status: 'in_progress' });

      // Schedule return
      if (order.return_date) {
        await Return.create({
          order_id: orderId,
          expected_return_date: order.return_date,
          status: 'scheduled'
        });
      }

      res.json({
        success: true,
        message: 'Rental started successfully',
        data: { order }
      });
    } catch (error) {
      console.error('Start rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start rental',
        error: error.message
      });
    }
  },

  // Complete rental
  completeRental: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { orderId } = req.params;
      const { return_condition, damage_charges, late_fees } = req.body;

      const order = await RentalOrder.findByPk(orderId, {
        include: [{ model: RentalOrderItem, as: 'items' }],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status and charges
      await order.update({
        status: 'completed',
        damage_charges: damage_charges || 0,
        late_fee_amount: late_fees || 0
      }, { transaction });

      // Return inventory
      for (const item of order.items) {
        await ProductInventory.increment(
          'quantity_available',
          {
            by: parseInt(item.quantity),
            where: { product_id: item.product_id },
            transaction
          }
        );
      }

      await transaction.commit();

      res.json({
        success: true,
        message: 'Rental completed successfully',
        data: { 
          order,
          return_condition,
          damage_charges: damage_charges || 0,
          late_fees: late_fees || 0
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Complete rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete rental',
        error: error.message
      });
    }
  },

  // Extend rental order
  extendOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { new_return_date, additional_amount, extension_reason } = req.body;

      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order
      const updatedTotalAmount = parseFloat(order.total_amount) + (additional_amount || 0);
      await order.update({
        return_date: new Date(new_return_date),
        total_amount: updatedTotalAmount
      });

      // Update return schedule
      await Return.update(
        { expected_return_date: new Date(new_return_date) },
        { where: { order_id: orderId } }
      );

      res.json({
        success: true,
        message: 'Order extended successfully',
        data: { 
          order,
          extension_reason,
          additional_amount: additional_amount || 0,
          new_total: updatedTotalAmount
        }
      });
    } catch (error) {
      console.error('Extend order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend order',
        error: error.message
      });
    }
  },

  // Cancel order
  cancelOrder: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { orderId } = req.params;
      const { cancellation_reason, refund_amount } = req.body;

      const order = await RentalOrder.findByPk(orderId, {
        include: [{ model: RentalOrderItem, as: 'items' }],
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status
      await order.update({ status: 'cancelled' }, { transaction });

      // Return inventory if order was confirmed
      if (order.status === 'confirmed' || order.status === 'in_progress') {
        for (const item of order.items) {
          await ProductInventory.increment(
            'quantity_available',
            {
              by: parseInt(item.quantity),
              where: { product_id: item.product_id },
              transaction
            }
          );
        }
      }

      // Cancel any scheduled pickups/returns
      await Pickup.update(
        { status: 'cancelled' },
        { where: { order_id: orderId }, transaction }
      );

      await Return.update(
        { status: 'cancelled' },
        { where: { order_id: orderId }, transaction }
      );

      await transaction.commit();

      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { 
          order,
          cancellation_reason,
          refund_amount: refund_amount || 0
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Cancel order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      });
    }
  },

  // Calculate late fees for order
  calculateLateFees: async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!order.return_date) {
        return res.status(400).json({
          success: false,
          message: 'Order does not have a return date set'
        });
      }

      const currentDate = new Date();
      const returnDate = new Date(order.return_date);

      if (currentDate > returnDate) {
        const daysLate = Math.ceil((currentDate - returnDate) / (1000 * 60 * 60 * 24));
        const lateFeePerDay = parseFloat(process.env.LATE_FEE_PER_DAY) || 50;
        const lateFeeAmount = daysLate * lateFeePerDay;

        res.json({
          success: true,
          data: {
            orderId,
            returnDate: returnDate.toISOString(),
            currentDate: currentDate.toISOString(),
            daysLate,
            lateFeePerDay,
            lateFeeAmount,
            newTotalAmount: parseFloat(order.total_amount) + lateFeeAmount
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            orderId,
            daysLate: 0,
            lateFeeAmount: 0,
            totalAmount: parseFloat(order.total_amount)
          }
        });
      }
    } catch (error) {
      console.error('Calculate late fees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate late fees',
        error: error.message
      });
    }
  },

  // Get order analytics
  getOrderAnalytics: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const [
        totalOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        averageOrderValue
      ] = await Promise.all([
        RentalOrder.count({ where: dateFilter }),
        RentalOrder.count({ where: { ...dateFilter, status: 'confirmed' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'in_progress' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'completed' } }),
        RentalOrder.count({ where: { ...dateFilter, status: 'cancelled' } }),
        RentalOrder.sum('total_amount', { where: { ...dateFilter, status: 'completed' } }),
        RentalOrder.findOne({
          where: dateFilter,
          attributes: [[sequelize.fn('AVG', sequelize.col('total_amount')), 'avgValue']]
        })
      ]);

      res.json({
        success: true,
        data: {
          totalOrders,
          ordersByStatus: {
            confirmed: confirmedOrders,
            inProgress: inProgressOrders,
            completed: completedOrders,
            cancelled: cancelledOrders
          },
          revenue: {
            total: totalRevenue || 0,
            average: parseFloat(averageOrderValue?.dataValues?.avgValue) || 0
          },
          conversionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Get order analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order analytics',
        error: error.message
      });
    }
  }
};

module.exports = orderController;