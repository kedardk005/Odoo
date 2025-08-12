import { 
  type User, type InsertUser, type Product, type InsertProduct, type Category, type InsertCategory, 
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Delivery, type InsertDelivery, 
  type Payment, type InsertPayment, type Notification, type InsertNotification, 
  type Quotation, type InsertQuotation, type QuotationItem, type InsertQuotationItem,
  type CustomerSegment, type InsertCustomerSegment, type PricingRule, type InsertPricingRule,
  type LateFeeConfig, type InsertLateFeeConfig, type ProductReservation, type InsertProductReservation,
  type OrderWithDetails, type ProductWithCategory, type QuotationWithDetails, type ProductWithAvailability,
  type DashboardMetrics, type ReportData
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, ilike, sql, gte, lte, between, sum, count } from "drizzle-orm";
import { 
  users, categories, products, orders, orderItems, deliveries, payments, notifications,
  quotations, quotationItems, customerSegments, pricingRules, lateFeeConfig, productReservations
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  getCustomers(): Promise<User[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(categoryId?: string): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<Product>;

  // Order operations
  getOrders(customerId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  getRecentOrders(limit?: number): Promise<Order[]>;

  // Order item operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  // Delivery operations
  getDeliveries(orderId?: string): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;

  // Payment operations
  getPayments(orderId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Dashboard operations
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Quotation operations
  getQuotations(customerId?: string): Promise<Quotation[]>;
  getQuotation(id: string): Promise<Quotation | undefined>;
  getQuotationsByCustomer(customerId: string): Promise<Quotation[]>;
  getQuotationItems(quotationId: string): Promise<QuotationItem[]>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  createQuotationItem(quotationItem: InsertQuotationItem): Promise<QuotationItem>;
  updateQuotationStatus(id: string, status: string): Promise<Quotation>;
  convertQuotationToOrder(quotationId: string): Promise<Order>;

  // Product availability operations
  updateProductAvailability(productId: string, quantity: number): Promise<Product>;

  // Delivery operations
  updateDeliveryStatus(id: string, status: string): Promise<Delivery>;

  // Notification operations
  markNotificationRead(id: string): Promise<Notification>;

  // Pricing rules operations
  getPricingRules(productId?: string, categoryId?: string): Promise<PricingRule[]>;
  createPricingRule(rule: InsertPricingRule): Promise<PricingRule>;

  // Product availability check
  checkProductAvailability(productId: string, startDate: Date, endDate: Date, quantity: number): Promise<{ available: boolean; availableQuantity: number; }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async getCustomers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  // Product operations
  async getProducts(categoryId?: string): Promise<ProductWithCategory[]> {
    const query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        hourlyRate: products.hourlyRate,
        dailyRate: products.dailyRate,
        weeklyRate: products.weeklyRate,
        monthlyRate: products.monthlyRate,
        securityDeposit: products.securityDeposit,
        quantity: products.quantity,
        availableQuantity: products.availableQuantity,
        reservedQuantity: products.reservedQuantity,
        status: products.status,
        imageUrl: products.imageUrl,
        specifications: products.specifications,
        minRentalPeriod: products.minRentalPeriod,
        maxRentalPeriod: products.maxRentalPeriod,
        createdAt: products.createdAt,
        category: categories
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    if (categoryId) {
      query.where(eq(products.categoryId, categoryId));
    }

    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        hourlyRate: products.hourlyRate,
        dailyRate: products.dailyRate,
        weeklyRate: products.weeklyRate,
        monthlyRate: products.monthlyRate,
        securityDeposit: products.securityDeposit,
        quantity: products.quantity,
        availableQuantity: products.availableQuantity,
        reservedQuantity: products.reservedQuantity,
        status: products.status,
        imageUrl: products.imageUrl,
        specifications: products.specifications,
        minRentalPeriod: products.minRentalPeriod,
        maxRentalPeriod: products.maxRentalPeriod,
        createdAt: products.createdAt,
        category: categories
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values({
      ...productData,
      availableQuantity: productData.quantity || 1
    }).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(productData).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<Product> {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deleted) {
      throw new Error("Product not found");
    }
    return deleted;
  }

  // Order operations
  async getOrders(customerId?: string): Promise<Order[]> {
    const query = db.select().from(orders);
    
    if (customerId) {
      query.where(eq(orders.customerId, customerId));
    }
    
    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const [order] = await db.insert(orders).values({
      ...orderData,
      orderNumber
    }).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db.update(orders).set({ status: status as any }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  }

  // Order item operations
  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(orderItemData).returning();
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Delivery operations
  async getDeliveries(orderId?: string): Promise<Delivery[]> {
    const query = db.select().from(deliveries);
    
    if (orderId) {
      query.where(eq(deliveries.orderId, orderId));
    }
    
    return await query.orderBy(desc(deliveries.createdAt));
  }

  async createDelivery(deliveryData: InsertDelivery): Promise<Delivery> {
    const [delivery] = await db.insert(deliveries).values(deliveryData).returning();
    return delivery;
  }

  // Payment operations
  async getPayments(orderId?: string): Promise<Payment[]> {
    const query = db.select().from(payments);
    
    if (orderId) {
      query.where(eq(payments.orderId, orderId));
    }
    
    return await query.orderBy(desc(payments.createdAt));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  // Dashboard operations
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Get basic counts
    const [totalOrdersResult] = await db.select({ count: count() }).from(orders);
    const [totalProductsResult] = await db.select({ count: count() }).from(products);
    const [totalCustomersResult] = await db.select({ count: count() }).from(users).where(eq(users.role, 'customer'));
    
    // Get revenue
    const [revenueResult] = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.status, 'confirmed'));

    // Get active rentals
    const [activeRentalsResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'delivered'));

    return {
      totalRevenue: parseFloat(revenueResult?.total || '0'),
      activeRentals: activeRentalsResult?.count || 0,
      newCustomers: totalCustomersResult?.count || 0,
      inventoryUtilization: 0, // Calculate based on products
      overdueOrders: 0, // Calculate based on return dates
      pendingQuotations: 0 // Calculate from quotations table
    };
  }

  // Quotation operations
  async getQuotations(customerId?: string): Promise<Quotation[]> {
    const query = db.select().from(quotations);
    
    if (customerId) {
      query.where(eq(quotations.customerId, customerId));
    }
    
    return await query.orderBy(desc(quotations.createdAt));
  }

  async createQuotation(quotationData: InsertQuotation): Promise<Quotation> {
    const quotationNumber = `QUO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const [quotation] = await db.insert(quotations).values({
      ...quotationData,
      quotationNumber
    }).returning();
    return quotation;
  }

  async createQuotationItem(quotationItemData: InsertQuotationItem): Promise<QuotationItem> {
    const [quotationItem] = await db.insert(quotationItems).values(quotationItemData).returning();
    return quotationItem;
  }

  async getQuotationsByCustomer(customerId: string): Promise<Quotation[]> {
    return await db.select().from(quotations).where(eq(quotations.customerId, customerId)).orderBy(desc(quotations.createdAt));
  }

  async getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
    return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId));
  }

  async getQuotation(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async updateQuotationStatus(id: string, status: string): Promise<Quotation> {
    const [quotation] = await db.update(quotations).set({ status: status as any }).where(eq(quotations.id, id)).returning();
    return quotation;
  }

  async convertQuotationToOrder(quotationId: string): Promise<Order> {
    // Get quotation details
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId));
    if (!quotation) {
      throw new Error("Quotation not found");
    }

    // Get quotation items
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId));

    // Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const [order] = await db.insert(orders).values({
      customerId: quotation.customerId,
      orderNumber,
      startDate: quotation.startDate,
      endDate: quotation.endDate,
      totalAmount: quotation.totalAmount,
      status: 'pending',
      notes: `Converted from quotation ${quotation.quotationNumber}`
    }).returning();

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      });
    }

    // Update quotation status
    await db.update(quotations).set({ status: 'converted' }).where(eq(quotations.id, quotationId));

    return order;
  }

  // Product availability operations
  async updateProductAvailability(productId: string, quantity: number): Promise<Product> {
    const [product] = await db.update(products).set({ availableQuantity: quantity }).where(eq(products.id, productId)).returning();
    return product;
  }

  // Delivery operations
  async updateDeliveryStatus(id: string, status: string): Promise<Delivery> {
    const [delivery] = await db.update(deliveries).set({ status: status as any }).where(eq(deliveries.id, id)).returning();
    return delivery;
  }

  // Notification operations
  async markNotificationRead(id: string): Promise<Notification> {
    const [notification] = await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).returning();
    return notification;
  }

  // Pricing rules operations
  async getPricingRules(productId?: string, categoryId?: string): Promise<PricingRule[]> {
    let query = db.select().from(pricingRules).where(eq(pricingRules.isActive, true));
    
    if (productId) {
      query = query.where(eq(pricingRules.productId, productId));
    }
    
    if (categoryId) {
      query = query.where(eq(pricingRules.categoryId, categoryId));
    }
    
    return await query.orderBy(desc(pricingRules.createdAt));
  }

  async createPricingRule(ruleData: InsertPricingRule): Promise<PricingRule> {
    const [rule] = await db.insert(pricingRules).values(ruleData).returning();
    return rule;
  }

  // Product availability check
  async checkProductAvailability(
    productId: string, 
    startDate: Date, 
    endDate: Date, 
    quantity: number
  ): Promise<{ available: boolean; availableQuantity: number; }> {
    // Get product information
    const product = await this.getProduct(productId);
    if (!product) {
      return { available: false, availableQuantity: 0 };
    }

    // Check existing reservations for the date range
    const conflictingReservations = await db
      .select({
        quantity: sum(productReservations.quantity)
      })
      .from(productReservations)
      .where(
        and(
          eq(productReservations.productId, productId),
          eq(productReservations.status, 'active'),
          // Check for date overlap
          or(
            and(
              gte(productReservations.startDate, startDate),
              lte(productReservations.startDate, endDate)
            ),
            and(
              gte(productReservations.endDate, startDate),
              lte(productReservations.endDate, endDate)
            ),
            and(
              lte(productReservations.startDate, startDate),
              gte(productReservations.endDate, endDate)
            )
          )
        )
      );

    const reservedQuantity = parseInt(conflictingReservations[0]?.quantity || '0');
    const availableQuantity = product.availableQuantity - reservedQuantity;
    const available = availableQuantity >= quantity;

    return { available, availableQuantity };
  }
}

// Use database storage for production
export const storage = new DatabaseStorage();