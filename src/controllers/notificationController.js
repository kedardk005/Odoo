const Notification = require('../models/Notification');
const User = require('../models/User');
const UserNotificationPreference = require('../models/UserNotificationPreference');
const RentalOrder = require('../models/RentalOrder');
const Return = require('../models/Return');
const Pickup = require('../models/Pickup');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

class NotificationController {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  }

  // Get all notifications for a user
  getMyNotifications = async (req, res) => {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 20, unread_only = false } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = { user_id: userId };
      if (unread_only === 'true') {
        whereClause.is_read = false;
      }

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          notifications: notifications.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(notifications.count / limit),
            totalItems: notifications.count,
            unreadCount: await Notification.count({ where: { user_id: userId, is_read: false } })
          }
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  // Mark notification as read
  markAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.user_id;

      const notification = await Notification.findOne({
        where: { notification_id: notificationId, user_id: userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.update({ is_read: true });

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  markAllAsRead = async (req, res) => {
    try {
      const userId = req.user.user_id;

      await Notification.update(
        { is_read: true },
        { where: { user_id: userId, is_read: false } }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  // Create notification (internal use)
  createNotification = async (userId, title, message, type = 'info', metadata = {}) => {
    try {
      const notification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        metadata: JSON.stringify(metadata),
        is_read: false
      });

      // Check user preferences and send email if enabled
      await this.sendEmailNotification(userId, title, message, type);

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Send email notification based on user preferences
  sendEmailNotification = async (userId, title, message, type) => {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: UserNotificationPreference, as: 'notificationPreference' }]
      });

      if (!user || !user.email) return;

      // Check if user wants email notifications
      const preferences = user.notificationPreference;
      if (!preferences || !preferences.email_notifications) return;

      // Type-specific preferences
      if (type === 'order_update' && !preferences.order_updates) return;
      if (type === 'payment_reminder' && !preferences.payment_reminders) return;
      if (type === 'promotional' && !preferences.promotional_emails) return;

      const emailOptions = {
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: title,
        html: this.generateEmailTemplate(user.full_name, title, message, type)
      };

      await this.emailTransporter.sendMail(emailOptions);
      console.log(`Email notification sent to ${user.email}`);
    } catch (error) {
      console.error('Send email notification error:', error);
    }
  }

  // Generate email template
  generateEmailTemplate = (userName, title, message, type) => {
    const typeColors = {
      info: '#3498db',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      reminder: '#9b59b6'
    };

    const color = typeColors[type] || '#3498db';

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
              .header { background: ${color}; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { background: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
              .button { background: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Rental Management</h1>
                  <h2>${title}</h2>
              </div>
              <div class="content">
                  <p>Dear ${userName},</p>
                  <p>${message}</p>
                  <p>Best regards,<br>Rental Management Team</p>
              </div>
              <div class="footer">
                  <p>© 2024 Rental Management System. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Send pickup reminders (automated job)
  sendPickupReminders = async () => {
    try {
      const reminderDays = parseInt(process.env.REMINDER_DAYS_BEFORE_RETURN) || 2;
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + reminderDays);

      const upcomingPickups = await Pickup.findAll({
        where: {
          scheduled_time: {
            [Op.between]: [new Date(), reminderDate]
          },
          status: 'scheduled'
        },
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

      for (const pickup of upcomingPickups) {
        const customer = pickup.order.customer;
        const pickupTime = new Date(pickup.scheduled_time).toLocaleString();
        
        const title = 'Upcoming Pickup Reminder';
        const message = `Your rental pickup is scheduled for ${pickupTime}. Please ensure you are available at the scheduled time.`;

        await this.createNotification(customer.user_id, title, message, 'reminder', {
          pickup_id: pickup.pickup_id,
          order_id: pickup.order_id,
          scheduled_time: pickup.scheduled_time
        });

        // Send to staff as well
        if (pickup.assigned_staff_id) {
          const staffMessage = `Pickup scheduled for ${pickupTime} - Customer: ${customer.full_name} (${customer.phone_number})`;
          await this.createNotification(pickup.assigned_staff_id, 'Staff: Pickup Assignment', staffMessage, 'order_update', {
            pickup_id: pickup.pickup_id,
            customer_name: customer.full_name,
            customer_phone: customer.phone_number
          });
        }
      }

      console.log(`Sent ${upcomingPickups.length} pickup reminders`);
      return upcomingPickups.length;
    } catch (error) {
      console.error('Send pickup reminders error:', error);
      throw error;
    }
  }

  // Send return reminders (automated job)
  sendReturnReminders = async () => {
    try {
      const reminderDays = parseInt(process.env.REMINDER_DAYS_BEFORE_RETURN) || 2;
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + reminderDays);

      const upcomingReturns = await Return.findAll({
        where: {
          expected_return_date: {
            [Op.between]: [new Date(), reminderDate]
          },
          status: 'scheduled'
        },
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

      for (const returnRecord of upcomingReturns) {
        const customer = returnRecord.order.customer;
        const returnDate = new Date(returnRecord.expected_return_date).toLocaleDateString();
        
        const title = 'Upcoming Return Reminder';
        const message = `Your rental return is due on ${returnDate}. Please prepare your items for collection to avoid late fees.`;

        await this.createNotification(customer.user_id, title, message, 'reminder', {
          return_id: returnRecord.return_id,
          order_id: returnRecord.order_id,
          expected_return_date: returnRecord.expected_return_date
        });

        // Send to staff as well
        if (returnRecord.assigned_staff_id) {
          const staffMessage = `Return due ${returnDate} - Customer: ${customer.full_name} (${customer.phone_number})`;
          await this.createNotification(returnRecord.assigned_staff_id, 'Staff: Return Collection', staffMessage, 'order_update', {
            return_id: returnRecord.return_id,
            customer_name: customer.full_name,
            customer_phone: customer.phone_number
          });
        }
      }

      console.log(`Sent ${upcomingReturns.length} return reminders`);
      return upcomingReturns.length;
    } catch (error) {
      console.error('Send return reminders error:', error);
      throw error;
    }
  }

  // Send overdue notifications
  sendOverdueNotifications = async () => {
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

      for (const returnRecord of overdueReturns) {
        const customer = returnRecord.order.customer;
        const daysOverdue = Math.ceil((new Date() - new Date(returnRecord.expected_return_date)) / (1000 * 60 * 60 * 24));
        const lateFeePerDay = parseFloat(process.env.LATE_FEE_PER_DAY) || 50;
        const totalLateFee = daysOverdue * lateFeePerDay;

        const title = 'Overdue Return Notice';
        const message = `Your rental return is ${daysOverdue} day(s) overdue. A late fee of ₹${totalLateFee} applies. Please return the items immediately.`;

        await this.createNotification(customer.user_id, title, message, 'warning', {
          return_id: returnRecord.return_id,
          order_id: returnRecord.order_id,
          days_overdue: daysOverdue,
          late_fee: totalLateFee
        });
      }

      console.log(`Sent ${overdueReturns.length} overdue notifications`);
      return overdueReturns.length;
    } catch (error) {
      console.error('Send overdue notifications error:', error);
      throw error;
    }
  }

  // Order status change notifications
  notifyOrderStatusChange = async (orderId, newStatus, userId) => {
    try {
      const statusMessages = {
        confirmed: 'Your rental order has been confirmed. We will contact you soon for pickup scheduling.',
        in_progress: 'Your rental is now active. Enjoy your rented items!',
        completed: 'Your rental has been completed successfully. Thank you for choosing us!',
        cancelled: 'Your rental order has been cancelled. Please contact us if you have any questions.'
      };

      const title = 'Order Status Update';
      const message = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}`;

      await this.createNotification(userId, title, message, 'order_update', {
        order_id: orderId,
        new_status: newStatus
      });
    } catch (error) {
      console.error('Notify order status change error:', error);
    }
  }

  // Payment notifications
  notifyPaymentStatus = async (paymentId, status, userId, amount) => {
    try {
      const statusMessages = {
        success: `Payment of ₹${amount} has been successfully processed.`,
        failed: `Payment of ₹${amount} has failed. Please try again or contact support.`,
        pending: `Payment of ₹${amount} is being processed. You will be notified once completed.`
      };

      const title = 'Payment Status Update';
      const message = statusMessages[status] || `Payment status updated to ${status}`;

      await this.createNotification(userId, title, message, 'payment_reminder', {
        payment_id: paymentId,
        status,
        amount
      });
    } catch (error) {
      console.error('Notify payment status error:', error);
    }
  }

  // Run automated notification jobs
  runAutomatedJobs = async (req, res) => {
    try {
      const pickupReminders = await this.sendPickupReminders();
      const returnReminders = await this.sendReturnReminders();
      const overdueNotifications = await this.sendOverdueNotifications();

      res.json({
        success: true,
        message: 'Automated notification jobs completed',
        data: {
          pickup_reminders_sent: pickupReminders,
          return_reminders_sent: returnReminders,
          overdue_notifications_sent: overdueNotifications,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Run automated jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run automated notification jobs',
        error: error.message
      });
    }
  }

  // Get user notification preferences
  getNotificationPreferences = async (req, res) => {
    try {
      const userId = req.user.user_id;

      let preferences = await UserNotificationPreference.findOne({
        where: { user_id: userId }
      });

      if (!preferences) {
        // Create default preferences
        preferences = await UserNotificationPreference.create({
          user_id: userId,
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          order_updates: true,
          payment_reminders: true,
          promotional_emails: false
        });
      }

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      console.error('Get notification preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification preferences',
        error: error.message
      });
    }
  }

  // Update user notification preferences
  updateNotificationPreferences = async (req, res) => {
    try {
      const userId = req.user.user_id;
      const {
        email_notifications,
        sms_notifications,
        push_notifications,
        order_updates,
        payment_reminders,
        promotional_emails
      } = req.body;

      const [preferences, created] = await UserNotificationPreference.findOrCreate({
        where: { user_id: userId },
        defaults: {
          email_notifications: email_notifications !== undefined ? email_notifications : true,
          sms_notifications: sms_notifications !== undefined ? sms_notifications : false,
          push_notifications: push_notifications !== undefined ? push_notifications : true,
          order_updates: order_updates !== undefined ? order_updates : true,
          payment_reminders: payment_reminders !== undefined ? payment_reminders : true,
          promotional_emails: promotional_emails !== undefined ? promotional_emails : false
        }
      });

      if (!created) {
        await preferences.update({
          email_notifications: email_notifications !== undefined ? email_notifications : preferences.email_notifications,
          sms_notifications: sms_notifications !== undefined ? sms_notifications : preferences.sms_notifications,
          push_notifications: push_notifications !== undefined ? push_notifications : preferences.push_notifications,
          order_updates: order_updates !== undefined ? order_updates : preferences.order_updates,
          payment_reminders: payment_reminders !== undefined ? payment_reminders : preferences.payment_reminders,
          promotional_emails: promotional_emails !== undefined ? promotional_emails : preferences.promotional_emails
        });
      }

      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: { preferences }
      });
    } catch (error) {
      console.error('Update notification preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message
      });
    }
  }
}

const notificationController = new NotificationController();

module.exports = {
  getMyNotifications: notificationController.getMyNotifications,
  markAsRead: notificationController.markAsRead,
  markAllAsRead: notificationController.markAllAsRead,
  runAutomatedJobs: notificationController.runAutomatedJobs,
  getNotificationPreferences: notificationController.getNotificationPreferences,
  updateNotificationPreferences: notificationController.updateNotificationPreferences,
  
  // Export for internal use
  createNotification: notificationController.createNotification,
  notifyOrderStatusChange: notificationController.notifyOrderStatusChange,
  notifyPaymentStatus: notificationController.notifyPaymentStatus
};