const cron = require('node-cron');
const { 
  createNotification, 
  sendPickupReminders, 
  sendReturnReminders, 
  sendOverdueNotifications 
} = require('../controllers/notificationController');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;

    console.log('🔔 Initializing Notification Scheduler...');

    // Run pickup reminders every day at 9 AM
    this.jobs.set('pickup-reminders', cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running pickup reminders job...');
        const notificationController = require('../controllers/notificationController');
        const count = await notificationController.sendPickupReminders();
        console.log(`✅ Sent ${count} pickup reminder notifications`);
      } catch (error) {
        console.error('❌ Error sending pickup reminders:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    }));

    // Run return reminders every day at 9 AM
    this.jobs.set('return-reminders', cron.schedule('0 9 * * *', async () => {
      try {
        console.log('Running return reminders job...');
        const notificationController = require('../controllers/notificationController');
        const count = await notificationController.sendReturnReminders();
        console.log(`✅ Sent ${count} return reminder notifications`);
      } catch (error) {
        console.error('❌ Error sending return reminders:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    }));

    // Run overdue notifications every day at 10 AM and 6 PM
    this.jobs.set('overdue-notifications', cron.schedule('0 10,18 * * *', async () => {
      try {
        console.log('Running overdue notifications job...');
        const notificationController = require('../controllers/notificationController');
        const count = await notificationController.sendOverdueNotifications();
        console.log(`✅ Sent ${count} overdue notifications`);
      } catch (error) {
        console.error('❌ Error sending overdue notifications:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    }));

    // Daily summary report for admins at 8 PM
    this.jobs.set('daily-summary', cron.schedule('0 20 * * *', async () => {
      try {
        console.log('Running daily summary job...');
        await this.sendDailySummary();
        console.log('✅ Daily summary sent to administrators');
      } catch (error) {
        console.error('❌ Error sending daily summary:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    }));

    // Weekly inventory check every Monday at 8 AM
    this.jobs.set('weekly-inventory', cron.schedule('0 8 * * MON', async () => {
      try {
        console.log('Running weekly inventory check...');
        await this.sendInventoryReport();
        console.log('✅ Weekly inventory report sent');
      } catch (error) {
        console.error('❌ Error sending inventory report:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    }));

    this.isInitialized = true;
    console.log('✅ Notification Scheduler initialized with 5 jobs');
  }

  start() {
    if (!this.isInitialized) {
      this.init();
    }

    console.log('🚀 Starting all notification scheduler jobs...');
    
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started job: ${name}`);
    });

    console.log('🔔 All notification jobs are now running');
  }

  stop() {
    console.log('🛑 Stopping all notification scheduler jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️  Stopped job: ${name}`);
    });

    console.log('⏸️  All notification jobs stopped');
  }

  getStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running || false,
        lastDate: job.lastDate() || null
      };
    });
    return status;
  }

  // Send daily summary to administrators
  async sendDailySummary() {
    try {
      const User = require('../models/User');
      const RentalOrder = require('../models/RentalOrder');
      const { Op } = require('sequelize');

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Get today's statistics
      const [todayOrders, todayRevenue, activeRentals, overdueReturns] = await Promise.all([
        RentalOrder.count({
          where: {
            created_at: { [Op.between]: [startOfDay, endOfDay] }
          }
        }),
        RentalOrder.sum('total_amount', {
          where: {
            created_at: { [Op.between]: [startOfDay, endOfDay] },
            status: 'completed'
          }
        }),
        RentalOrder.count({ where: { status: 'in_progress' } }),
        RentalOrder.count({
          where: {
            status: { [Op.ne]: 'completed' },
            return_date: { [Op.lt]: new Date() }
          }
        })
      ]);

      // Get all admin users
      const admins = await User.findAll({
        include: [{
          model: require('../models/Role'),
          as: 'role',
          where: { role_name: 'admin' }
        }]
      });

      const summary = `
        📊 Daily Summary for ${today.toDateString()}
        
        📈 Today's Performance:
        • New Orders: ${todayOrders}
        • Revenue: ₹${todayRevenue || 0}
        • Active Rentals: ${activeRentals}
        • Overdue Returns: ${overdueReturns}
        
        ${overdueReturns > 0 ? '⚠️ Action required for overdue returns!' : '✅ All returns on track'}
      `;

      const notificationController = require('../controllers/notificationController');

      for (const admin of admins) {
        await notificationController.createNotification(
          admin.user_id,
          'Daily Business Summary',
          summary,
          'info',
          {
            type: 'daily_summary',
            date: today.toISOString().split('T')[0],
            metrics: {
              todayOrders,
              todayRevenue: todayRevenue || 0,
              activeRentals,
              overdueReturns
            }
          }
        );
      }
    } catch (error) {
      console.error('Send daily summary error:', error);
    }
  }

  // Send weekly inventory report
  async sendInventoryReport() {
    try {
      const User = require('../models/User');
      const ProductInventory = require('../models/ProductInventory');
      const Product = require('../models/Product');

      // Get low stock products
      const lowStockProducts = await ProductInventory.findAll({
        where: {
          quantity_available: { [Op.lte]: 5 } // Low stock threshold
        },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name', 'sku_code']
        }]
      });

      // Get admin and staff users
      const staffUsers = await User.findAll({
        include: [{
          model: require('../models/Role'),
          as: 'role',
          where: { role_name: { [Op.in]: ['admin', 'staff'] } }
        }]
      });

      if (lowStockProducts.length > 0) {
        const inventoryAlert = `
          📦 Weekly Inventory Alert
          
          ⚠️ Low Stock Items (${lowStockProducts.length}):
          ${lowStockProducts.map(item => 
            `• ${item.product.name} (${item.product.sku_code}): ${item.quantity_available} units`
          ).join('\n')}
          
          Please consider restocking these items soon.
        `;

        const notificationController = require('../controllers/notificationController');

        for (const user of staffUsers) {
          await notificationController.createNotification(
            user.user_id,
            'Weekly Inventory Report',
            inventoryAlert,
            'warning',
            {
              type: 'inventory_alert',
              low_stock_count: lowStockProducts.length,
              products: lowStockProducts.map(item => ({
                product_id: item.product.product_id,
                name: item.product.name,
                sku: item.product.sku_code,
                quantity: item.quantity_available
              }))
            }
          );
        }
      }
    } catch (error) {
      console.error('Send inventory report error:', error);
    }
  }

  // Manual trigger for testing
  async runJob(jobName) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job '${jobName}' not found`);
    }

    console.log(`🔄 Manually running job: ${jobName}`);
    
    try {
      switch (jobName) {
        case 'pickup-reminders':
          const notificationController = require('../controllers/notificationController');
          return await notificationController.sendPickupReminders();
        case 'return-reminders':
          return await notificationController.sendReturnReminders();
        case 'overdue-notifications':
          return await notificationController.sendOverdueNotifications();
        case 'daily-summary':
          await this.sendDailySummary();
          return 'Daily summary sent';
        case 'weekly-inventory':
          await this.sendInventoryReport();
          return 'Inventory report sent';
        default:
          throw new Error('Unknown job type');
      }
    } catch (error) {
      console.error(`❌ Error running job ${jobName}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

module.exports = notificationScheduler;