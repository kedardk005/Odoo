import * as cron from 'node-cron';
import { storage } from './storage';
import { emailService } from './email';
import { db } from './db';
import { orders, users, lateFeeConfig } from '@shared/schema';
import { eq, and, lte, gte, isNull } from 'drizzle-orm';

export class CronService {
  private reminderJob: cron.ScheduledTask | null = null;
  private overdueJob: cron.ScheduledTask | null = null;
  private lateFeeJob: cron.ScheduledTask | null = null;

  constructor() {
    this.initializeJobs();
  }

  private initializeJobs() {
    // Run reminder job daily at 9:00 AM
    this.reminderJob = cron.schedule('0 9 * * *', () => {
      this.processReturnReminders();
    }, {
      scheduled: false
    });

    // Run overdue job daily at 10:00 AM
    this.overdueJob = cron.schedule('0 10 * * *', () => {
      this.processOverdueOrders();
    }, {
      scheduled: false
    });

    // Run late fee calculation every hour
    this.lateFeeJob = cron.schedule('0 * * * *', () => {
      this.calculateLateFees();
    }, {
      scheduled: false
    });
  }

  start() {
    console.log('Starting cron services...');
    this.reminderJob?.start();
    this.overdueJob?.start();
    this.lateFeeJob?.start();
    console.log('Cron services started successfully');
  }

  stop() {
    console.log('Stopping cron services...');
    this.reminderJob?.stop();
    this.overdueJob?.stop();
    this.lateFeeJob?.stop();
    console.log('Cron services stopped');
  }

  // Process return reminders (N days before return)
  async processReturnReminders() {
    try {
      console.log('Processing return reminders...');
      const reminderDays = parseInt(process.env.REMINDER_DAYS_BEFORE_RETURN || '2');
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + reminderDays);

      // Get orders that need reminders
      const ordersNeedingReminders = await db
        .select({
          order: orders,
          customer: users
        })
        .from(orders)
        .leftJoin(users, eq(orders.customerId, users.id))
        .where(
          and(
            eq(orders.status, 'delivered'),
            lte(orders.endDate, reminderDate),
            gte(orders.endDate, new Date())
          )
        );

      for (const { order, customer } of ordersNeedingReminders) {
        if (customer) {
          const daysRemaining = Math.ceil((new Date(order.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysRemaining <= reminderDays && daysRemaining > 0) {
            await emailService.sendReturnReminderEmail(order, customer, daysRemaining);
            console.log(`Reminder sent for order ${order.orderNumber}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing return reminders:', error);
    }
  }

  // Process overdue orders
  async processOverdueOrders() {
    try {
      console.log('Processing overdue orders...');
      const today = new Date();
      
      // Get overdue orders
      const overdueOrders = await db
        .select({
          order: orders,
          customer: users
        })
        .from(orders)
        .leftJoin(users, eq(orders.customerId, users.id))
        .where(
          and(
            eq(orders.status, 'delivered'),
            lte(orders.endDate, today)
          )
        );

      for (const { order, customer } of overdueOrders) {
        if (customer) {
          const daysOverdue = Math.ceil((today.getTime() - new Date(order.endDate).getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysOverdue > 0) {
            // Update order status to overdue
            await storage.updateOrderStatus(order.id, 'overdue');
            
            // Calculate late fee
            const lateFee = await this.calculateOrderLateFee(order, daysOverdue);
            
            // Send overdue notification
            await emailService.sendOverdueNotificationEmail(order, customer, daysOverdue, lateFee);
            console.log(`Overdue notification sent for order ${order.orderNumber}`);
          }
        }
      }
    } catch (error) {
      console.error('Error processing overdue orders:', error);
    }
  }

  // Calculate and apply late fees
  async calculateLateFees() {
    try {
      console.log('Calculating late fees...');
      const today = new Date();
      
      // Get late fee configuration
      const [lateFeeConfiguration] = await db
        .select()
        .from(lateFeeConfig)
        .where(eq(lateFeeConfig.isActive, true))
        .limit(1);

      if (!lateFeeConfiguration) {
        console.log('No active late fee configuration found');
        return;
      }

      // Get overdue orders
      const overdueOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.status, 'overdue'),
            lte(orders.endDate, today)
          )
        );

      for (const order of overdueOrders) {
        const daysOverdue = Math.ceil((today.getTime() - new Date(order.endDate).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          const lateFee = await this.calculateOrderLateFee(order, daysOverdue, lateFeeConfiguration);
          
          // Update order with calculated late fee
          await db
            .update(orders)
            .set({ 
              lateFee: lateFee.toString(),
              remainingAmount: (parseFloat(order.remainingAmount) + lateFee).toString()
            })
            .where(eq(orders.id, order.id));
        }
      }
    } catch (error) {
      console.error('Error calculating late fees:', error);
    }
  }

  // Calculate late fee for a specific order
  private async calculateOrderLateFee(order: any, daysOverdue: number, config?: any): Promise<number> {
    if (!config) {
      const [lateFeeConfiguration] = await db
        .select()
        .from(lateFeeConfig)
        .where(eq(lateFeeConfig.isActive, true))
        .limit(1);
      
      if (!lateFeeConfiguration) {
        return parseFloat(process.env.LATE_FEE_PER_DAY || '50') * daysOverdue;
      }
      config = lateFeeConfiguration;
    }

    const totalAmount = parseFloat(order.totalAmount);
    const dailyFeePercentage = parseFloat(config.dailyFeePercentage) / 100;
    const maxFeePercentage = parseFloat(config.maxFeePercentage) / 100;
    const gracePeriodHours = parseInt(config.gracePeriodHours);
    
    // Check if still within grace period
    const gracePeriodDays = gracePeriodHours / 24;
    if (daysOverdue <= gracePeriodDays) {
      return 0;
    }

    // Calculate daily late fee
    const dailyLateFee = totalAmount * dailyFeePercentage;
    const totalLateFee = dailyLateFee * (daysOverdue - gracePeriodDays);
    
    // Apply maximum fee cap
    const maxLateFee = totalAmount * maxFeePercentage;
    
    return Math.min(totalLateFee, maxLateFee);
  }

  // Manual trigger methods for testing
  async triggerReturnReminders() {
    await this.processReturnReminders();
  }

  async triggerOverdueProcessing() {
    await this.processOverdueOrders();
  }

  async triggerLateFeeCalculation() {
    await this.calculateLateFees();
  }
}

export const cronService = new CronService();