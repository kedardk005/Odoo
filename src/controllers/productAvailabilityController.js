const Product = require('../models/Product');
const ProductAvailabilityCalendar = require('../models/ProductAvailabilityCalendar');
const ProductInventory = require('../models/ProductInventory');
const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const productAvailabilityController = {
  // Get product availability for calendar view
  getProductAvailabilityCalendar: async (req, res) => {
    try {
      const { product_id, start_date, end_date, view_type = 'month' } = req.query;

      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      // Set default date range if not provided
      const startDate = start_date ? new Date(start_date) : new Date();
      const endDate = end_date ? new Date(end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      // Get product details
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: ProductInventory,
            as: 'inventory'
          }
        ]
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Generate availability for the date range
      const availability = await this.generateAvailabilityCalendar(product_id, startDate, endDate);

      res.json({
        success: true,
        data: {
          product: {
            id: product.product_id,
            name: product.name,
            total_quantity: product.inventory?.quantity_total || 0,
            available_quantity: product.inventory?.quantity_available || 0
          },
          date_range: {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          },
          availability_calendar: availability
        }
      });
    } catch (error) {
      console.error('Get product availability calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch availability calendar',
        error: error.message
      });
    }
  },

  // Check availability for specific dates and quantity
  checkAvailability: async (req, res) => {
    try {
      const { product_id, start_date, end_date, quantity } = req.body;

      if (!product_id || !start_date || !end_date || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, start date, end date, and quantity are required'
        });
      }

      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);

      // Get product inventory
      const inventory = await ProductInventory.findOne({
        where: { product_id }
      });

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Product inventory not found'
        });
      }

      // Check if requested quantity is available for all dates in the range
      const availability = await this.checkDateRangeAvailability(product_id, startDateObj, endDateObj, quantity);

      res.json({
        success: true,
        data: {
          available: availability.isAvailable,
          requested_quantity: quantity,
          available_quantity: availability.minAvailable,
          conflicting_dates: availability.conflictingDates,
          message: availability.isAvailable 
            ? 'Product is available for the requested dates and quantity'
            : `Only ${availability.minAvailable} units available. Conflicts on: ${availability.conflictingDates.join(', ')}`
        }
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error.message
      });
    }
  },

  // Reserve product for specific dates (used during order confirmation)
  reserveProduct: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { product_id, start_date, end_date, quantity, order_id } = req.body;

      // First check if availability exists for the entire date range
      const availability = await this.checkDateRangeAvailability(product_id, new Date(start_date), new Date(end_date), quantity);

      if (!availability.isAvailable) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient quantity available for the requested dates',
          data: {
            available_quantity: availability.minAvailable,
            conflicting_dates: availability.conflictingDates
          }
        });
      }

      // Reserve the product for each date in the range
      const reservationResults = await this.makeReservation(product_id, new Date(start_date), new Date(end_date), quantity, transaction);

      await transaction.commit();

      res.json({
        success: true,
        message: 'Product reserved successfully',
        data: {
          reserved_dates: reservationResults,
          total_days: reservationResults.length
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Reserve product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reserve product',
        error: error.message
      });
    }
  },

  // Release reservation (used when order is cancelled)
  releaseReservation: async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      const { product_id, start_date, end_date, quantity } = req.body;

      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);

      // Release reservation for each date in the range
      const currentDate = new Date(startDateObj);
      const releasedDates = [];

      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Find or create availability record for this date
        const [availability] = await ProductAvailabilityCalendar.findOrCreate({
          where: {
            product_id,
            date: dateStr
          },
          defaults: {
            total_quantity: 0,
            reserved_quantity: 0,
            available_quantity: 0,
            status: 'available'
          },
          transaction
        });

        // Release the reservation
        const newReservedQuantity = Math.max(0, availability.reserved_quantity - quantity);
        const newAvailableQuantity = availability.total_quantity - newReservedQuantity;

        await availability.update({
          reserved_quantity: newReservedQuantity,
          available_quantity: newAvailableQuantity,
          status: newAvailableQuantity > 0 ? 'available' : 'fully_booked'
        }, { transaction });

        releasedDates.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      await transaction.commit();

      res.json({
        success: true,
        message: 'Reservation released successfully',
        data: {
          released_dates: releasedDates,
          quantity_released: quantity
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Release reservation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to release reservation',
        error: error.message
      });
    }
  },

  // Get availability summary for multiple products
  getBulkAvailability: async (req, res) => {
    try {
      const { product_ids, start_date, end_date } = req.body;

      if (!product_ids || !Array.isArray(product_ids) || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Product IDs array, start date, and end date are required'
        });
      }

      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);

      const availabilityResults = [];

      for (const product_id of product_ids) {
        const product = await Product.findByPk(product_id, {
          include: [{ model: ProductInventory, as: 'inventory' }]
        });

        if (product) {
          const availability = await this.generateAvailabilityCalendar(product_id, startDateObj, endDateObj);
          
          availabilityResults.push({
            product_id,
            product_name: product.name,
            total_quantity: product.inventory?.quantity_total || 0,
            availability_calendar: availability
          });
        }
      }

      res.json({
        success: true,
        data: {
          date_range: {
            start_date: startDateObj.toISOString().split('T')[0],
            end_date: endDateObj.toISOString().split('T')[0]
          },
          products_availability: availabilityResults
        }
      });
    } catch (error) {
      console.error('Get bulk availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bulk availability',
        error: error.message
      });
    }
  },

  // Helper functions
  generateAvailabilityCalendar: async (productId, startDate, endDate) => {
    try {
      // Get product inventory
      const inventory = await ProductInventory.findOne({
        where: { product_id: productId }
      });

      const totalQuantity = inventory?.quantity_total || 0;
      const availability = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Check existing availability record
        let availabilityRecord = await ProductAvailabilityCalendar.findOne({
          where: {
            product_id: productId,
            date: dateStr
          }
        });

        if (!availabilityRecord) {
          // Create new availability record with default values
          availabilityRecord = await ProductAvailabilityCalendar.create({
            product_id: productId,
            date: dateStr,
            total_quantity: totalQuantity,
            reserved_quantity: 0,
            available_quantity: totalQuantity,
            status: totalQuantity > 0 ? 'available' : 'fully_booked'
          });
        }

        availability.push({
          date: dateStr,
          total_quantity: availabilityRecord.total_quantity,
          reserved_quantity: availabilityRecord.reserved_quantity,
          available_quantity: availabilityRecord.available_quantity,
          status: availabilityRecord.status,
          notes: availabilityRecord.notes
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return availability;
    } catch (error) {
      console.error('Generate availability calendar error:', error);
      throw error;
    }
  },

  checkDateRangeAvailability: async (productId, startDate, endDate, requestedQuantity) => {
    try {
      const currentDate = new Date(startDate);
      let minAvailable = Infinity;
      const conflictingDates = [];

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        let availabilityRecord = await ProductAvailabilityCalendar.findOne({
          where: {
            product_id: productId,
            date: dateStr
          }
        });

        if (!availabilityRecord) {
          // Get product inventory for default values
          const inventory = await ProductInventory.findOne({
            where: { product_id: productId }
          });
          const totalQuantity = inventory?.quantity_total || 0;

          availabilityRecord = {
            available_quantity: totalQuantity
          };
        }

        if (availabilityRecord.available_quantity < requestedQuantity) {
          conflictingDates.push(dateStr);
        }

        minAvailable = Math.min(minAvailable, availabilityRecord.available_quantity);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        isAvailable: conflictingDates.length === 0,
        minAvailable: minAvailable === Infinity ? 0 : minAvailable,
        conflictingDates
      };
    } catch (error) {
      console.error('Check date range availability error:', error);
      throw error;
    }
  },

  makeReservation: async (productId, startDate, endDate, quantity, transaction) => {
    try {
      const reservationResults = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // Get product inventory for total quantity
        const inventory = await ProductInventory.findOne({
          where: { product_id: productId }
        });
        const totalQuantity = inventory?.quantity_total || 0;

        // Find or create availability record
        const [availability] = await ProductAvailabilityCalendar.findOrCreate({
          where: {
            product_id: productId,
            date: dateStr
          },
          defaults: {
            total_quantity: totalQuantity,
            reserved_quantity: 0,
            available_quantity: totalQuantity,
            status: 'available'
          },
          transaction
        });

        // Update reservation
        const newReservedQuantity = availability.reserved_quantity + quantity;
        const newAvailableQuantity = availability.total_quantity - newReservedQuantity;

        await availability.update({
          reserved_quantity: newReservedQuantity,
          available_quantity: newAvailableQuantity,
          status: newAvailableQuantity > 0 ? 'limited' : 'fully_booked'
        }, { transaction });

        reservationResults.push({
          date: dateStr,
          reserved_quantity: quantity,
          new_available_quantity: newAvailableQuantity
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return reservationResults;
    } catch (error) {
      console.error('Make reservation error:', error);
      throw error;
    }
  }
};

module.exports = productAvailabilityController;