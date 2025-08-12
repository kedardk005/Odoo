import { db } from './db';
import { orders, orderItems, products, users, categories, payments } from '@shared/schema';
import { eq, and, gte, lte, desc, sql, count, sum } from 'drizzle-orm';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
}

export interface MostRentedProduct {
  productId: string;
  productName: string;
  categoryName: string;
  totalRentals: number;
  totalRevenue: number;
  averageRentalDuration: number;
}

export interface RevenueReport {
  totalRevenue: number;
  period: string;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
  revenueByCategory: Array<{
    categoryName: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

export interface RentalAnalytics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  completedRentals: number;
  averageRentalDuration: number;
  mostPopularRentalPeriod: string;
  peakRentalDays: string[];
}

export class ReportsService {
  // Generate Most Rented Products Report
  async getMostRentedProducts(period: ReportPeriod, limit: number = 10): Promise<MostRentedProduct[]> {
    const results = await db
      .select({
        productId: products.id,
        productName: products.name,
        categoryName: categories.name,
        totalRentals: count(orderItems.id),
        totalRevenue: sum(orderItems.totalAmount),
        avgDuration: sql<number>`AVG(EXTRACT(DAY FROM (${orders.endDate} - ${orders.startDate})))`
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(products.id, products.name, categories.name)
      .orderBy(desc(count(orderItems.id)))
      .limit(limit);

    return results.map(result => ({
      productId: result.productId,
      productName: result.productName,
      categoryName: result.categoryName || 'Uncategorized',
      totalRentals: Number(result.totalRentals),
      totalRevenue: parseFloat(result.totalRevenue || '0'),
      averageRentalDuration: parseFloat(result.avgDuration?.toString() || '0')
    }));
  }

  // Generate Revenue Report
  async getRevenueReport(period: ReportPeriod): Promise<RevenueReport> {
    // Total revenue for the period
    const [totalRevenueResult] = await db
      .select({
        totalRevenue: sum(orders.totalAmount)
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      );

    // Monthly revenue breakdown
    const monthlyRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sum(orders.totalAmount),
        orderCount: count(orders.id)
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    // Revenue by category
    const categoryRevenue = await db
      .select({
        categoryName: categories.name,
        revenue: sum(orderItems.totalAmount)
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      )
      .groupBy(categories.name);

    const totalRevenue = parseFloat(totalRevenueResult?.totalRevenue || '0');
    
    return {
      totalRevenue,
      period: `${period.startDate.toISOString().split('T')[0]} to ${period.endDate.toISOString().split('T')[0]}`,
      revenueByMonth: monthlyRevenue.map(item => ({
        month: item.month,
        revenue: parseFloat(item.revenue || '0'),
        orderCount: Number(item.orderCount)
      })),
      revenueByCategory: categoryRevenue.map(item => ({
        categoryName: item.categoryName || 'Uncategorized',
        revenue: parseFloat(item.revenue || '0'),
        percentage: totalRevenue > 0 ? (parseFloat(item.revenue || '0') / totalRevenue) * 100 : 0
      }))
    };
  }

  // Generate Top Customers Report
  async getTopCustomers(period: ReportPeriod, limit: number = 10): Promise<TopCustomer[]> {
    const results = await db
      .select({
        customerId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        totalOrders: count(orders.id),
        totalSpent: sum(orders.totalAmount),
        lastOrderDate: sql<string>`MAX(${orders.createdAt})`
      })
      .from(orders)
      .innerJoin(users, eq(orders.customerId, users.id))
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate)
        )
      )
      .groupBy(users.id, users.firstName, users.lastName, users.email)
      .orderBy(desc(sum(orders.totalAmount)))
      .limit(limit);

    return results.map(result => ({
      customerId: result.customerId,
      customerName: `${result.firstName} ${result.lastName}`,
      email: result.email,
      totalOrders: Number(result.totalOrders),
      totalSpent: parseFloat(result.totalSpent || '0'),
      averageOrderValue: Number(result.totalOrders) > 0 ? parseFloat(result.totalSpent || '0') / Number(result.totalOrders) : 0,
      lastOrderDate: result.lastOrderDate
    }));
  }

  // Generate Rental Analytics
  async getRentalAnalytics(period: ReportPeriod): Promise<RentalAnalytics> {
    // Total rentals
    const [totalRentalsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate)
        )
      );

    // Active rentals
    const [activeRentalsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'delivered'));

    // Overdue rentals
    const [overdueRentalsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'overdue'));

    // Completed rentals
    const [completedRentalsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      );

    // Average rental duration
    const [avgDurationResult] = await db
      .select({
        avgDuration: sql<number>`AVG(EXTRACT(DAY FROM (${orders.endDate} - ${orders.startDate})))`
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate),
          eq(orders.status, 'completed')
        )
      );

    // Most popular rental days
    const popularDays = await db
      .select({
        dayOfWeek: sql<string>`TO_CHAR(${orders.startDate}, 'Day')`,
        count: count()
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, period.startDate),
          lte(orders.createdAt, period.endDate)
        )
      )
      .groupBy(sql`TO_CHAR(${orders.startDate}, 'Day')`)
      .orderBy(desc(count()));

    return {
      totalRentals: Number(totalRentalsResult?.count || 0),
      activeRentals: Number(activeRentalsResult?.count || 0),
      overdueRentals: Number(overdueRentalsResult?.count || 0),
      completedRentals: Number(completedRentalsResult?.count || 0),
      averageRentalDuration: parseFloat(avgDurationResult?.avgDuration?.toString() || '0'),
      mostPopularRentalPeriod: 'Daily', // This would need more complex logic
      peakRentalDays: popularDays.slice(0, 3).map(day => day.dayOfWeek.trim())
    };
  }

  // Generate PDF Report
  async generatePDFReport(
    reportType: 'revenue' | 'products' | 'customers' | 'analytics',
    period: ReportPeriod,
    data: any
  ): Promise<Buffer> {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));

    // Header
    doc.fontSize(20).text('Rental Management Report', 50, 50);
    doc.fontSize(14).text(`Report Type: ${reportType.toUpperCase()}`, 50, 80);
    doc.fontSize(12).text(`Period: ${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}`, 50, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 115);

    let yPosition = 150;

    switch (reportType) {
      case 'revenue':
        doc.fontSize(16).text('Revenue Report', 50, yPosition);
        yPosition += 30;
        doc.fontSize(12).text(`Total Revenue: ₹${data.totalRevenue.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
        
        doc.text('Monthly Breakdown:', 50, yPosition);
        yPosition += 15;
        data.revenueByMonth.forEach((month: any) => {
          doc.text(`${month.month}: ₹${month.revenue.toFixed(2)} (${month.orderCount} orders)`, 70, yPosition);
          yPosition += 15;
        });
        break;

      case 'products':
        doc.fontSize(16).text('Most Rented Products', 50, yPosition);
        yPosition += 30;
        data.forEach((product: MostRentedProduct, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${product.productName}`, 50, yPosition);
          doc.text(`   Category: ${product.categoryName}`, 50, yPosition + 12);
          doc.text(`   Rentals: ${product.totalRentals} | Revenue: ₹${product.totalRevenue.toFixed(2)}`, 50, yPosition + 24);
          yPosition += 45;
        });
        break;

      case 'customers':
        doc.fontSize(16).text('Top Customers', 50, yPosition);
        yPosition += 30;
        data.forEach((customer: TopCustomer, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${customer.customerName}`, 50, yPosition);
          doc.text(`   Email: ${customer.email}`, 50, yPosition + 12);
          doc.text(`   Orders: ${customer.totalOrders} | Total Spent: ₹${customer.totalSpent.toFixed(2)}`, 50, yPosition + 24);
          yPosition += 45;
        });
        break;

      case 'analytics':
        doc.fontSize(16).text('Rental Analytics', 50, yPosition);
        yPosition += 30;
        doc.fontSize(12).text(`Total Rentals: ${data.totalRentals}`, 50, yPosition);
        yPosition += 15;
        doc.text(`Active Rentals: ${data.activeRentals}`, 50, yPosition);
        yPosition += 15;
        doc.text(`Overdue Rentals: ${data.overdueRentals}`, 50, yPosition);
        yPosition += 15;
        doc.text(`Completed Rentals: ${data.completedRentals}`, 50, yPosition);
        yPosition += 15;
        doc.text(`Average Rental Duration: ${data.averageRentalDuration.toFixed(1)} days`, 50, yPosition);
        break;
    }

    doc.end();
    return Buffer.concat(buffers);
  }

  // Export to CSV
  exportToCSV(data: any[], headers: string[]): string {
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  // Get report period based on type
  getReportPeriod(periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom', customStart?: Date, customEnd?: Date): ReportPeriod {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (periodType) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        startDate = customStart || new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = customEnd || now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate,
      endDate,
      period: periodType
    };
  }
}

export const reportsService = new ReportsService();