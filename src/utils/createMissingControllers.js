const fs = require('fs');
const path = require('path');

const createMissingControllers = async () => {
  console.log('🔧 Creating missing controllers...');

  const controllersDir = path.join(__dirname, '..', 'controllers');

  // Order Controller
  const orderControllerContent = `
const RentalOrder = require('../models/RentalOrder');
const RentalOrderItem = require('../models/RentalOrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { sequelize } = require('../config/database');

const orderController = {
  createOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Order creation functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
    }
  },

  getAllOrders: async (req, res) => {
    try {
      const orders = await RentalOrder.findAll({
        include: [
          { model: User, as: 'customer', attributes: ['user_id', 'full_name', 'email'] },
          { model: RentalOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ],
        order: [['created_at', 'DESC']]
      });
      res.json({ success: true, data: { orders } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await RentalOrder.findByPk(id, {
        include: [
          { model: User, as: 'customer', attributes: ['user_id', 'full_name', 'email'] },
          { model: RentalOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
        ]
      });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: { order } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
  },

  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const orders = await RentalOrder.findAll({
        where: { customer_id: userId },
        include: [{ model: RentalOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
        order: [['created_at', 'DESC']]
      });
      res.json({ success: true, data: { orders } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch your orders', error: error.message });
    }
  },

  getMyOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.user_id;
      const order = await RentalOrder.findOne({
        where: { order_id: id, customer_id: userId },
        include: [{ model: RentalOrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }]
      });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      res.json({ success: true, data: { order } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Update order functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order', error: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await RentalOrder.findByPk(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      await order.update({ status });
      res.json({ success: true, message: 'Order status updated successfully', data: { order } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Delete order functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete order', error: error.message });
    }
  },

  cancelOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Cancel order functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to cancel order', error: error.message });
    }
  },

  confirmOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Confirm order functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to confirm order', error: error.message });
    }
  },

  startRental: async (req, res) => {
    try {
      res.json({ success: true, message: 'Start rental functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to start rental', error: error.message });
    }
  },

  completeRental: async (req, res) => {
    try {
      res.json({ success: true, message: 'Complete rental functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to complete rental', error: error.message });
    }
  },

  extendOrder: async (req, res) => {
    try {
      res.json({ success: true, message: 'Extend order functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to extend order', error: error.message });
    }
  },

  addOrderItem: async (req, res) => {
    try {
      res.json({ success: true, message: 'Add order item functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add order item', error: error.message });
    }
  },

  updateOrderItem: async (req, res) => {
    try {
      res.json({ success: true, message: 'Update order item functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update order item', error: error.message });
    }
  },

  removeOrderItem: async (req, res) => {
    try {
      res.json({ success: true, message: 'Remove order item functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to remove order item', error: error.message });
    }
  },

  getDeliveryStatus: async (req, res) => {
    try {
      res.json({ success: true, message: 'Get delivery status functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get delivery status', error: error.message });
    }
  },

  schedulePickup: async (req, res) => {
    try {
      res.json({ success: true, message: 'Schedule pickup functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to schedule pickup', error: error.message });
    }
  },

  scheduleReturn: async (req, res) => {
    try {
      res.json({ success: true, message: 'Schedule return functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to schedule return', error: error.message });
    }
  },

  calculateLateFees: async (req, res) => {
    try {
      res.json({ success: true, message: 'Calculate late fees functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to calculate late fees', error: error.message });
    }
  },

  addDamageCharges: async (req, res) => {
    try {
      res.json({ success: true, message: 'Add damage charges functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add damage charges', error: error.message });
    }
  }
};

module.exports = orderController;
  `;

  // Delivery Controller
  const deliveryControllerContent = `
const Pickup = require('../models/Pickup');
const Return = require('../models/Return');
const RentalOrder = require('../models/RentalOrder');
const User = require('../models/User');

const deliveryController = {
  getAllDeliveries: async (req, res) => {
    try {
      res.json({ success: true, message: 'Get all deliveries functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch deliveries', error: error.message });
    }
  },

  getDeliveryById: async (req, res) => {
    try {
      res.json({ success: true, message: 'Get delivery by ID functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch delivery', error: error.message });
    }
  },

  getMyDeliveries: async (req, res) => {
    try {
      res.json({ success: true, message: 'Get my deliveries functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch your deliveries', error: error.message });
    }
  },

  getMyDeliveryById: async (req, res) => {
    try {
      res.json({ success: true, message: 'Get my delivery by ID functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch delivery', error: error.message });
    }
  },

  createDelivery: async (req, res) => {
    try {
      res.json({ success: true, message: 'Create delivery functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create delivery', error: error.message });
    }
  },

  updateDelivery: async (req, res) => {
    try {
      res.json({ success: true, message: 'Update delivery functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update delivery', error: error.message });
    }
  },

  deleteDelivery: async (req, res) => {
    try {
      res.json({ success: true, message: 'Delete delivery functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete delivery', error: error.message });
    }
  },

  updateDeliveryStatus: async (req, res) => {
    try {
      res.json({ success: true, message: 'Update delivery status functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update delivery status', error: error.message });
    }
  },

  scheduleDelivery: async (req, res) => {
    try {
      res.json({ success: true, message: 'Schedule delivery functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to schedule delivery', error: error.message });
    }
  },

  rescheduleDelivery: async (req, res) => {
    try {
      res.json({ success: true, message: 'Reschedule delivery functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to reschedule delivery', error: error.message });
    }
  },

  assignDriver: async (req, res) => {
    try {
      res.json({ success: true, message: 'Assign driver functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to assign driver', error: error.message });
    }
  },

  addCustomerSignature: async (req, res) => {
    try {
      res.json({ success: true, message: 'Add customer signature functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add customer signature', error: error.message });
    }
  }
};

module.exports = deliveryController;
  `;

  // Additional controllers for other routes
  const controllers = {
    'orderController.js': orderControllerContent,
    'deliveryController.js': deliveryControllerContent,
    'invoiceController.js': `
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const invoiceController = {
  getAllInvoices: async (req, res) => {
    try {
      const invoices = await Invoice.findAll({ include: [{ model: Payment, as: 'payments' }] });
      res.json({ success: true, data: { invoices } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch invoices', error: error.message });
    }
  },

  getInvoiceById: async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await Invoice.findByPk(id, { include: [{ model: Payment, as: 'payments' }] });
      if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
      res.json({ success: true, data: { invoice } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch invoice', error: error.message });
    }
  },

  createInvoice: async (req, res) => {
    try {
      res.json({ success: true, message: 'Create invoice functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create invoice', error: error.message });
    }
  },

  updateInvoice: async (req, res) => {
    try {
      res.json({ success: true, message: 'Update invoice functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update invoice', error: error.message });
    }
  },

  deleteInvoice: async (req, res) => {
    try {
      res.json({ success: true, message: 'Delete invoice functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete invoice', error: error.message });
    }
  }
};

module.exports = invoiceController;
    `,
    'notificationController.js': `
const Notification = require('../models/Notification');

const notificationController = {
  getAllNotifications: async (req, res) => {
    try {
      const notifications = await Notification.findAll();
      res.json({ success: true, data: { notifications } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
    }
  },

  getMyNotifications: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const notifications = await Notification.findAll({ where: { user_id: userId } });
      res.json({ success: true, data: { notifications } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch your notifications', error: error.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      res.json({ success: true, message: 'Mark as read functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
    }
  }
};

module.exports = notificationController;
    `,
    'pricelistController.js': `
const Pricelist = require('../models/Pricelist');
const PricingRule = require('../models/PricingRule');

const pricelistController = {
  getAllPricelists: async (req, res) => {
    try {
      const pricelists = await Pricelist.findAll({ include: [{ model: PricingRule, as: 'rules' }] });
      res.json({ success: true, data: { pricelists } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch pricelists', error: error.message });
    }
  },

  getPricelistById: async (req, res) => {
    try {
      const { id } = req.params;
      const pricelist = await Pricelist.findByPk(id, { include: [{ model: PricingRule, as: 'rules' }] });
      if (!pricelist) return res.status(404).json({ success: false, message: 'Pricelist not found' });
      res.json({ success: true, data: { pricelist } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch pricelist', error: error.message });
    }
  },

  createPricelist: async (req, res) => {
    try {
      res.json({ success: true, message: 'Create pricelist functionality to be implemented' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create pricelist', error: error.message });
    }
  }
};

module.exports = pricelistController;
    `
  };

  // Create all missing controllers
  for (const [filename, content] of Object.entries(controllers)) {
    const filePath = path.join(controllersDir, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content.trim());
      console.log(`✅ Created ${filename}`);
    } else {
      console.log(`ℹ️  ${filename} already exists`);
    }
  }

  console.log('🎉 All missing controllers created successfully!');
};

// Run if called directly
if (require.main === module) {
  createMissingControllers()
    .then(() => {
      console.log('Controller creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Controller creation failed:', error);
      process.exit(1);
    });
}

module.exports = createMissingControllers;