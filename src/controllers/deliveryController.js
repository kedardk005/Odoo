const Pickup = require('../models/Pickup');
const Return = require('../models/Return');
const RentalOrder = require('../models/RentalOrder');
const User = require('../models/User');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const deliveryController = {
  // Get all pickups and returns
  getAllDeliveries: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;

      const pickups = await Pickup.findAll({
        where: whereClause,
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [{ model: User, as: 'customer', attributes: ['user_id', 'full_name', 'phone_number'] }]
          },
          {
            model: User,
            as: 'assignedStaff',
            attributes: ['user_id', 'full_name']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scheduled_time', 'ASC']]
      });

      const returns = await Return.findAll({
        where: whereClause,
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [{ model: User, as: 'customer', attributes: ['user_id', 'full_name', 'phone_number'] }]
          },
          {
            model: User,
            as: 'assignedStaff',
            attributes: ['user_id', 'full_name']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['expected_return_date', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          pickups,
          returns,
          pagination: {
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all deliveries error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deliveries',
        error: error.message
      });
    }
  },

  // Schedule pickup for an order
  schedulePickup: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { scheduled_time, address, contact_person, contact_phone, assigned_staff_id } = req.body;

      // Check if order exists
      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Create pickup record
      const pickup = await Pickup.create({
        order_id: orderId,
        scheduled_time: new Date(scheduled_time),
        address,
        contact_person,
        contact_phone,
        assigned_staff_id,
        status: 'scheduled'
      });

      res.status(201).json({
        success: true,
        message: 'Pickup scheduled successfully',
        data: { pickup }
      });
    } catch (error) {
      console.error('Schedule pickup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule pickup',
        error: error.message
      });
    }
  },

  // Schedule return for an order
  scheduleReturn: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { expected_return_date, assigned_staff_id } = req.body;

      const order = await RentalOrder.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const returnRecord = await Return.create({
        order_id: orderId,
        expected_return_date: new Date(expected_return_date),
        assigned_staff_id,
        status: 'scheduled'
      });

      res.status(201).json({
        success: true,
        message: 'Return scheduled successfully',
        data: { return: returnRecord }
      });
    } catch (error) {
      console.error('Schedule return error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule return',
        error: error.message
      });
    }
  },

  // Mark pickup as completed
  markPickupCompleted: async (req, res) => {
    try {
      const { pickupId } = req.params;
      const { delivery_notes, actual_time } = req.body;

      const pickup = await Pickup.findByPk(pickupId);
      if (!pickup) {
        return res.status(404).json({
          success: false,
          message: 'Pickup not found'
        });
      }

      await pickup.update({
        status: 'completed',
        actual_time: actual_time || new Date(),
        delivery_notes
      });

      // Update rental order status
      const order = await RentalOrder.findByPk(pickup.order_id);
      if (order) {
        await order.update({ status: 'in_progress' });
      }

      res.json({
        success: true,
        message: 'Pickup marked as completed',
        data: { pickup }
      });
    } catch (error) {
      console.error('Mark pickup completed error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark pickup as completed',
        error: error.message
      });
    }
  },

  // Mark return as completed
  markReturnCompleted: async (req, res) => {
    try {
      const { returnId } = req.params;
      const { condition_notes, damage_assessment, late_fee_applied } = req.body;

      const returnRecord = await Return.findByPk(returnId);
      if (!returnRecord) {
        return res.status(404).json({
          success: false,
          message: 'Return not found'
        });
      }

      await returnRecord.update({
        status: 'completed',
        actual_time: new Date(),
        condition_notes,
        damage_assessment,
        late_fee_applied: parseFloat(late_fee_applied) || 0
      });

      // Update rental order status and apply fees
      const order = await RentalOrder.findByPk(returnRecord.order_id);
      if (order) {
        await order.update({
          status: 'completed',
          late_fee_amount: parseFloat(late_fee_applied) || 0
        });
      }

      res.json({
        success: true,
        message: 'Return marked as completed',
        data: { return: returnRecord }
      });
    } catch (error) {
      console.error('Mark return completed error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark return as completed',
        error: error.message
      });
    }
  },

  // Get overdue returns
  getOverdueReturns: async (req, res) => {
    try {
      const overdueReturns = await Return.findAll({
        where: {
          expected_return_date: { [Op.lt]: new Date() },
          status: { [Op.ne]: 'completed' }
        },
        include: [
          {
            model: RentalOrder,
            as: 'order',
            include: [{ model: User, as: 'customer', attributes: ['user_id', 'full_name', 'phone_number', 'email'] }]
          }
        ],
        order: [['expected_return_date', 'ASC']]
      });

      res.json({
        success: true,
        data: { overdueReturns },
        count: overdueReturns.length
      });
    } catch (error) {
      console.error('Get overdue returns error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue returns',
        error: error.message
      });
    }
  },

  // Calculate late fees for overdue returns
  calculateLateFees: async (req, res) => {
    try {
      const { returnId } = req.params;
      
      const returnRecord = await Return.findByPk(returnId, {
        include: [{ model: RentalOrder, as: 'order' }]
      });

      if (!returnRecord) {
        return res.status(404).json({
          success: false,
          message: 'Return not found'
        });
      }

      const currentDate = new Date();
      const expectedDate = new Date(returnRecord.expected_return_date);
      
      if (currentDate > expectedDate) {
        const daysLate = Math.ceil((currentDate - expectedDate) / (1000 * 60 * 60 * 24));
        const lateFeePerDay = parseFloat(process.env.LATE_FEE_PER_DAY) || 50;
        const lateFeeAmount = daysLate * lateFeePerDay;

        res.json({
          success: true,
          data: {
            daysLate,
            lateFeePerDay,
            lateFeeAmount,
            totalAmount: parseFloat(returnRecord.order.total_amount) + lateFeeAmount
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            daysLate: 0,
            lateFeeAmount: 0,
            totalAmount: parseFloat(returnRecord.order.total_amount)
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

  // Get delivery calendar
  getDeliveryCalendar: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.scheduled_time = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const [pickups, returns] = await Promise.all([
        Pickup.findAll({
          where: dateFilter,
          include: [
            {
              model: RentalOrder,
              as: 'order',
              include: [{ model: User, as: 'customer', attributes: ['full_name', 'phone_number'] }]
            },
            { model: User, as: 'assignedStaff', attributes: ['full_name'] }
          ]
        }),
        Return.findAll({
          where: dateFilter.scheduled_time ? { expected_return_date: dateFilter.scheduled_time } : {},
          include: [
            {
              model: RentalOrder,
              as: 'order',
              include: [{ model: User, as: 'customer', attributes: ['full_name', 'phone_number'] }]
            },
            { model: User, as: 'assignedStaff', attributes: ['full_name'] }
          ]
        })
      ]);

      res.json({
        success: true,
        data: {
          pickups,
          returns,
          summary: {
            totalPickups: pickups.length,
            totalReturns: returns.length,
            completedPickups: pickups.filter(p => p.status === 'completed').length,
            completedReturns: returns.filter(r => r.status === 'completed').length
          }
        }
      });
    } catch (error) {
      console.error('Get delivery calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch delivery calendar',
        error: error.message
      });
    }
  }
};

module.exports = deliveryController;