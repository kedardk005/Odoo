const { Op } = require('sequelize');
const User = require('../models/User');
const { Order } = require('../models/Order');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const UserNotificationPreference = require('../models/UserNotificationPreference');

const customerController = {
  // Customer's own profile
  getMyProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: UserNotificationPreference,
          as: 'notificationPreference'
        }]
      });

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get my profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      });
    }
  },

  // Update customer's own profile
  updateMyProfile: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode
      } = req.body;

      const user = await User.findByPk(req.user.id);
      
      await user.update({
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update my profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  },

  // Get customer's orders
  getMyOrders: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        startDate,
        endDate
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        customerId: req.user.id
      };

      if (status) {
        whereClause.status = status;
      }

      if (startDate && endDate) {
        whereClause.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'items',
            include: [{
              association: 'product',
              attributes: ['id', 'name', 'images']
            }]
          }
        ]
      });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
  },

  // Get customer's invoices
  getMyInvoices: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        customerId: req.user.id
      };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows: invoices } = await Invoice.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'items'
          },
          {
            association: 'payments'
          }
        ]
      });

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
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

  // Get customer's payments
  getMyPayments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: {
          customerId: req.user.id
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'invoice',
            attributes: ['id', 'invoiceNumber', 'totalAmount']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        error: error.message
      });
    }
  },

  // Get customer's notifications
  getMyNotifications: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        userId: req.user.id
      };

      if (unreadOnly === 'true') {
        whereClause.readAt = null;
      }

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get my notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (req, res) => {
    try {
      const {
        emailEnabled,
        smsEnabled,
        pushEnabled,
        pickupReminders,
        returnReminders,
        overdueAlerts,
        paymentReminders,
        marketingEmails
      } = req.body;

      let preferences = await UserNotificationPreference.findOne({
        where: { userId: req.user.id }
      });

      if (!preferences) {
        preferences = await UserNotificationPreference.create({ 
          userId: req.user.id 
        });
      }

      await preferences.update({
        emailEnabled,
        smsEnabled,
        pushEnabled,
        pickupReminders,
        returnReminders,
        overdueAlerts,
        paymentReminders,
        marketingEmails
      });

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: { preferences }
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get all customers
  getAllCustomers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        customerType,
        isActive,
        city,
        state
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        role: 'customer'
      };

      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (customerType) {
        whereClause.customerType = customerType;
      }

      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      if (city) {
        whereClause.city = { [Op.iLike]: `%${city}%` };
      }

      if (state) {
        whereClause.state = { [Op.iLike]: `%${state}%` };
      }

      const { count, rows: customers } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: {
          exclude: ['password']
        }
      });

      res.json({
        success: true,
        data: {
          customers,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customer by ID
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await User.findOne({
        where: {
          id,
          role: 'customer'
        },
        include: [{
          model: UserNotificationPreference,
          as: 'notificationPreference'
        }]
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.json({
        success: true,
        data: { customer }
      });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer',
        error: error.message
      });
    }
  },

  // Admin/Staff: Update customer
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const customer = await User.findOne({
        where: {
          id,
          role: 'customer'
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Don't allow role changes through this endpoint
      delete updateData.role;
      delete updateData.password;

      await customer.update(updateData);

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer }
      });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update customer',
        error: error.message
      });
    }
  },

  // Admin/Staff: Update customer status
  updateCustomerStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const customer = await User.findOne({
        where: {
          id,
          role: 'customer'
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      await customer.update({ isActive });

      res.json({
        success: true,
        message: 'Customer status updated successfully',
        data: { customer }
      });
    } catch (error) {
      console.error('Update customer status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update customer status',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customer orders
  getCustomerOrders: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        customerId: id
      };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            association: 'items',
            include: [{
              association: 'product',
              attributes: ['id', 'name', 'sku']
            }]
          }
        ]
      });

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get customer orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer orders',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customer invoices
  getCustomerInvoices: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        status
      } = req.query;

      const offset = (page - 1) * limit;
      
      const whereClause = {
        customerId: id
      };

      if (status) {
        whereClause.status = status;
      }

      const { count, rows: invoices } = await Invoice.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get customer invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer invoices',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customer payments
  getCustomerPayments: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10
      } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: {
          customerId: id
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            association: 'invoice',
            attributes: ['id', 'invoiceNumber', 'totalAmount']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get customer payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer payments',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customer statistics
  getCustomerStats: async (req, res) => {
    try {
      const { id } = req.params;

      // Get customer info
      const customer = await User.findByPk(id);
      if (!customer || customer.role !== 'customer') {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Get statistics
      const totalOrders = await Order.count({ where: { customerId: id } });
      const completedOrders = await Order.count({ 
        where: { customerId: id, status: 'completed' } 
      });
      const totalSpent = await Order.sum('totalAmount', { 
        where: { customerId: id, status: { [Op.in]: ['completed', 'delivered'] } }
      }) || 0;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const pendingInvoices = await Invoice.count({
        where: { customerId: id, status: { [Op.in]: ['sent', 'overdue'] } }
      });

      res.json({
        success: true,
        data: {
          customer: {
            id: customer.id,
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            customerType: customer.customerType,
            registrationDate: customer.registrationDate
          },
          statistics: {
            totalOrders,
            completedOrders,
            totalSpent,
            averageOrderValue,
            pendingInvoices,
            completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(2) : 0
          }
        }
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer statistics',
        error: error.message
      });
    }
  },

  // Admin: Delete customer
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await User.findOne({
        where: {
          id,
          role: 'customer'
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Check for active orders
      const activeOrders = await Order.count({
        where: {
          customerId: id,
          status: { [Op.in]: ['confirmed', 'in_progress', 'delivered'] }
        }
      });

      if (activeOrders > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer with active orders'
        });
      }

      // Soft delete by deactivating
      await customer.update({ isActive: false });

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete customer',
        error: error.message
      });
    }
  },

  // Admin/Staff: Search customers
  searchCustomers: async (req, res) => {
    try {
      const { query, limit = 10 } = req.body;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const customers = await User.findAll({
        where: {
          role: 'customer',
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
            { phone: { [Op.iLike]: `%${query}%` } }
          ]
        },
        limit: parseInt(limit),
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'customerType', 'isActive'],
        order: [['firstName', 'ASC']]
      });

      res.json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      console.error('Search customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search customers',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get customers by type
  getCustomersByType: async (req, res) => {
    try {
      const { type } = req.query;

      const validTypes = ['individual', 'corporate', 'vip'];
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer type'
        });
      }

      const whereClause = {
        role: 'customer'
      };

      if (type) {
        whereClause.customerType = type;
      }

      const customers = await User.findAll({
        where: whereClause,
        attributes: ['id', 'firstName', 'lastName', 'email', 'customerType', 'city', 'state'],
        order: [['firstName', 'ASC']]
      });

      res.json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      console.error('Get customers by type error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers by type',
        error: error.message
      });
    }
  },

  // Admin/Staff: Get active customers
  getActiveCustomers: async (req, res) => {
    try {
      const customers = await User.findAll({
        where: {
          role: 'customer',
          isActive: true
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'customerType'],
        order: [['firstName', 'ASC']]
      });

      res.json({
        success: true,
        data: { customers }
      });
    } catch (error) {
      console.error('Get active customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active customers',
        error: error.message
      });
    }
  }
};

module.exports = customerController;