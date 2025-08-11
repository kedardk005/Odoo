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
import { eq, desc, and, like, ilike, sql, gte, lte, between, sum, count } from "drizzle-orm";
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

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(categoryId?: string): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  getProductWithAvailability(id: string, startDate: Date, endDate: Date): Promise<ProductWithAvailability | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  updateProductAvailability(id: string, quantity: number): Promise<Product>;
  checkProductAvailability(productId: string, quantity: number, startDate: Date, endDate: Date): Promise<boolean>;

  // Quotation operations
  getQuotations(customerId?: string): Promise<QuotationWithDetails[]>;
  getQuotation(id: string): Promise<QuotationWithDetails | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotationStatus(id: string, status: string): Promise<Quotation>;
  createQuotationItem(quotationItem: InsertQuotationItem): Promise<QuotationItem>;
  convertQuotationToOrder(quotationId: string): Promise<Order>;

  // Order operations
  getOrders(customerId?: string): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  updateOrderPayment(id: string, paidAmount: number): Promise<Order>;
  calculateLateFees(orderId: string): Promise<number>;

  // Order item operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;

  // Delivery operations
  getDeliveries(orderId?: string): Promise<Delivery[]>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDeliveryStatus(id: string, status: string): Promise<Delivery>;
  generatePickupDocument(orderId: string): Promise<any>;
  generateReturnDocument(orderId: string): Promise<any>;

  // Payment operations
  getPayments(orderId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string): Promise<Payment>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification>;
  sendReminderNotifications(): Promise<void>;

  // Product reservation operations
  createReservation(reservation: InsertProductReservation): Promise<ProductReservation>;
  getReservations(productId?: string): Promise<ProductReservation[]>;
  releaseReservation(reservationId: string): Promise<void>;

  // Pricing operations
  getCustomerSegment(customerId: string): Promise<CustomerSegment | undefined>;
  createCustomerSegment(segment: InsertCustomerSegment): Promise<CustomerSegment>;
  getPricingRules(productId?: string, categoryId?: string): Promise<PricingRule[]>;
  createPricingRule(rule: InsertPricingRule): Promise<PricingRule>;
  calculateDynamicPrice(productId: string, customerId: string, duration: number, pricingType: string): Promise<number>;

  // Late fee operations
  getLateFeeConfig(): Promise<LateFeeConfig | undefined>;
  createLateFeeConfig(config: InsertLateFeeConfig): Promise<LateFeeConfig>;

  // Dashboard operations
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getRecentOrders(limit?: number): Promise<OrderWithDetails[]>;

  // Reports operations
  getMostRentedProducts(startDate: Date, endDate: Date): Promise<ReportData['mostRentedProducts']>;
  getTopCustomers(startDate: Date, endDate: Date): Promise<ReportData['topCustomers']>;
  getRevenueByPeriod(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month'): Promise<ReportData['revenueByPeriod']>;
  exportReport(type: 'pdf' | 'xlsx' | 'csv', data: any): Promise<Buffer>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private deliveries: Map<string, Delivery> = new Map();
  private payments: Map<string, Payment> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private quotations: Map<string, Quotation> = new Map();
  private quotationItems: Map<string, QuotationItem> = new Map();
  private customerSegments: Map<string, CustomerSegment> = new Map();
  private pricingRules: Map<string, PricingRule> = new Map();
  private lateFeeConfigs: Map<string, LateFeeConfig> = new Map();
  private productReservations: Map<string, ProductReservation> = new Map();

  constructor() {
    this.seedData();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error("User not found");
    
    const updatedUser: User = {
      ...existingUser,
      ...user,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  private seedData() {
    // Create real categories
    const photoCategory: Category = {
      id: randomUUID(),
      name: "Photography Equipment",
      description: "Professional cameras, lenses, and accessories",
      createdAt: new Date(),
    };

    const constructionCategory: Category = {
      id: randomUUID(),
      name: "Construction Tools",
      description: "Heavy machinery and construction equipment",
      createdAt: new Date(),
    };

    const audioCategory: Category = {
      id: randomUUID(),
      name: "Audio Equipment",
      description: "Microphones, speakers, and recording gear",
      createdAt: new Date(),
    };

    const lightingCategory: Category = {
      id: randomUUID(),
      name: "Lighting Equipment",
      description: "Professional lighting systems and accessories",
      createdAt: new Date(),
    };

    const eventCategory: Category = {
      id: randomUUID(),
      name: "Event Equipment",
      description: "Tables, chairs, tents, and event supplies",
      createdAt: new Date(),
    };

    this.categories.set(photoCategory.id, photoCategory);
    this.categories.set(constructionCategory.id, constructionCategory);
    this.categories.set(audioCategory.id, audioCategory);
    this.categories.set(eventCategory.id, eventCategory);
    this.categories.set(lightingCategory.id, lightingCategory);

    // Create real professional equipment products
    const products: Product[] = [
      // Photography Equipment
      {
        id: randomUUID(),
        name: "Canon EOS R5",
        description: "Professional full-frame mirrorless camera with 45MP sensor",
        categoryId: photoCategory.id,
        dailyRate: "2500.00",
        weeklyRate: "15000.00",
        monthlyRate: "50000.00",
        securityDeposit: "80000.00",
        quantity: 3,
        availableQuantity: 2,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "45MP full-frame sensor, 8K video recording, dual pixel autofocus",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Sony A7 IV",
        description: "Versatile full-frame mirrorless camera for professionals",
        categoryId: photoCategory.id,
        dailyRate: "2200.00",
        weeklyRate: "13000.00",
        monthlyRate: "45000.00",
        securityDeposit: "75000.00",
        quantity: 4,
        availableQuantity: 3,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "33MP sensor, 4K 60p video, 5-axis stabilization",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Canon 24-70mm f/2.8L",
        description: "Professional zoom lens for versatile photography",
        categoryId: photoCategory.id,
        dailyRate: "800.00",
        weeklyRate: "4500.00",
        monthlyRate: "15000.00",
        securityDeposit: "25000.00",
        quantity: 6,
        availableQuantity: 5,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "Constant f/2.8 aperture, weather sealed, image stabilization",
        createdAt: new Date(),
      },
      
      // Audio Equipment
      {
        id: randomUUID(),
        name: "Audio-Technica AT2020",
        description: "Professional studio condenser microphone",
        categoryId: audioCategory.id,
        dailyRate: "300.00",
        weeklyRate: "1800.00",
        monthlyRate: "6000.00",
        securityDeposit: "8000.00",
        quantity: 8,
        availableQuantity: 6,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "Cardioid polar pattern, 144 dB SPL maximum, low self-noise",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Shure SM7B",
        description: "Dynamic microphone for broadcast and recording",
        categoryId: audioCategory.id,
        dailyRate: "450.00",
        weeklyRate: "2500.00",
        monthlyRate: "8500.00",
        securityDeposit: "12000.00",
        quantity: 5,
        availableQuantity: 4,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "Dynamic cardioid, built-in pop filter, excellent for vocals",
        createdAt: new Date(),
      },
      
      // Lighting Equipment
      {
        id: randomUUID(),
        name: "Godox SL-60W LED Light",
        description: "Professional LED continuous light with Bowens mount",
        categoryId: lightingCategory.id,
        dailyRate: "400.00",
        weeklyRate: "2200.00",
        monthlyRate: "7500.00",
        securityDeposit: "10000.00",
        quantity: 8,
        availableQuantity: 6,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "60W LED, 5600K color temperature, remote control, quiet fan",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Aputure 300d Mark II",
        description: "High-power LED light for professional filming",
        categoryId: lightingCategory.id,
        dailyRate: "1200.00",
        weeklyRate: "7000.00",
        monthlyRate: "24000.00",
        securityDeposit: "35000.00",
        quantity: 4,
        availableQuantity: 3,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "300W COB LED, 5500K daylight balanced, wireless control",
        createdAt: new Date(),
      },
      
      // Construction Equipment
      {
        id: randomUUID(),
        name: "Makita DHP482 Drill",
        description: "Professional cordless hammer drill for construction",
        categoryId: constructionCategory.id,
        dailyRate: "200.00",
        weeklyRate: "1200.00",
        monthlyRate: "4000.00",
        securityDeposit: "6000.00",
        quantity: 10,
        availableQuantity: 8,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "18V battery, 62Nm torque, 13mm chuck, LED work light",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Angle Grinder 125mm",
        description: "Heavy duty angle grinder for cutting and grinding",
        categoryId: constructionCategory.id,
        dailyRate: "150.00",
        weeklyRate: "900.00",
        monthlyRate: "3000.00",
        securityDeposit: "4500.00",
        quantity: 12,
        availableQuantity: 10,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "125mm disc, 11000 RPM, safety guard, vibration control",
        createdAt: new Date(),
      },
      
      // Event Equipment
      {
        id: randomUUID(),
        name: "Round Dining Table",
        description: "Premium round table seating 8 people for events",
        categoryId: eventCategory.id,
        dailyRate: "120.00",
        weeklyRate: "700.00",
        monthlyRate: "2400.00",
        securityDeposit: "3000.00",
        quantity: 20,
        availableQuantity: 18,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "150cm diameter, seats 8, white tablecloth included",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Chiavari Chairs (Gold)",
        description: "Elegant gold Chiavari chairs for premium events",
        categoryId: eventCategory.id,
        dailyRate: "25.00",
        weeklyRate: "140.00",
        monthlyRate: "480.00",
        securityDeposit: "800.00",
        quantity: 100,
        availableQuantity: 95,
        status: "available",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        specifications: "Gold finish, cushioned seat, stackable design",
        createdAt: new Date(),
      },
    ];

    products.forEach(product => this.products.set(product.id, product));

    // Create sample admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      email: "admin@rentpro.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      phone: "+1-555-0100",
      address: "123 Admin Street, City, State 12345",
      role: "admin",
      createdAt: new Date(),
    };

    this.users.set(adminUser.id, adminUser);

    // Create default late fee configuration
    const defaultLateFeeConfig: LateFeeConfig = {
      id: randomUUID(),
      name: "Default Late Fee",
      dailyFeePercentage: "5.00",
      maxFeePercentage: "50.00",
      gracePeriodHours: 24,
      isActive: true,
      createdAt: new Date(),
    };
    this.lateFeeConfigs.set(defaultLateFeeConfig.id, defaultLateFeeConfig);

    // Create sample customer segments  
    const adminSegment: CustomerSegment = {
      id: randomUUID(),
      customerId: adminUser.id,
      segment: "vip",
      discountPercentage: "10.00",
      validFrom: new Date(),
      validUntil: null,
      createdAt: new Date(),
    };
    this.customerSegments.set(adminSegment.id, adminSegment);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      address: insertUser.address || null,
      role: insertUser.role || "customer",
      phone: insertUser.phone || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
      description: insertCategory.description || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(categoryId?: string): Promise<ProductWithCategory[]> {
    const products = Array.from(this.products.values());
    const filteredProducts = categoryId 
      ? products.filter(p => p.categoryId === categoryId)
      : products;

    return filteredProducts.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      availableQuantity: insertProduct.quantity || 0,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, productUpdate: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct = { ...product, ...productUpdate };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductAvailability(id: string, quantity: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    
    const updatedProduct = { ...product, availableQuantity: quantity };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getOrders(customerId?: string): Promise<OrderWithDetails[]> {
    const orders = Array.from(this.orders.values());
    const filteredOrders = customerId 
      ? orders.filter(o => o.customerId === customerId)
      : orders;

    return Promise.all(filteredOrders.map(async order => {
      const customer = this.users.get(order.customerId)!;
      const items = await this.getOrderItems(order.id);
      const deliveries = Array.from(this.deliveries.values()).filter(d => d.orderId === order.id);
      const payments = Array.from(this.payments.values()).filter(p => p.orderId === order.id);

      return {
        ...order,
        customer,
        items,
        deliveries,
        payments,
      };
    }));
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const customer = this.users.get(order.customerId)!;
    const items = await this.getOrderItems(order.id);
    const deliveries = Array.from(this.deliveries.values()).filter(d => d.orderId === order.id);
    const payments = Array.from(this.payments.values()).filter(p => p.orderId === order.id);

    return {
      ...order,
      customer,
      items,
      deliveries,
      payments,
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(this.orders.size + 1).padStart(3, '0')}`;
    
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      createdAt: new Date(),
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { ...order, status: status as any };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    const items = Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!,
    }));
  }

  async getDeliveries(orderId?: string): Promise<Delivery[]> {
    const deliveries = Array.from(this.deliveries.values());
    return orderId ? deliveries.filter(d => d.orderId === orderId) : deliveries;
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = randomUUID();
    const delivery: Delivery = {
      ...insertDelivery,
      id,
      createdAt: new Date(),
      status: insertDelivery.status || "scheduled",
      notes: insertDelivery.notes || null,
      driverName: insertDelivery.driverName || null,
      driverPhone: insertDelivery.driverPhone || null,
      estimatedArrival: insertDelivery.estimatedArrival || null,
      completedAt: insertDelivery.completedAt || null,
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDeliveryStatus(id: string, status: string): Promise<Delivery> {
    const delivery = this.deliveries.get(id);
    if (!delivery) throw new Error("Delivery not found");
    
    const updatedDelivery = { ...delivery, status: status as any };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  async getPayments(orderId?: string): Promise<Payment[]> {
    const payments = Array.from(this.payments.values());
    return orderId ? payments.filter(p => p.orderId === orderId) : payments;
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      status: insertPayment.status || "pending",
      transactionId: insertPayment.transactionId || null,
      paidAt: insertPayment.paidAt || null,
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    
    const updatedPayment = { ...payment, status: status as any };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
      read: insertNotification.read || false,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  // Add all missing storage methods
  async getQuotations(customerId?: string): Promise<QuotationWithDetails[]> {
    const quotations = Array.from(this.quotations.values());
    const filtered = customerId ? quotations.filter(q => q.customerId === customerId) : quotations;
    
    return filtered.map(quotation => ({
      ...quotation,
      customer: this.users.get(quotation.customerId)!,
      items: Array.from(this.quotationItems.values())
        .filter(item => item.quotationId === quotation.id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId)!
        }))
    }));
  }

  async getQuotation(id: string): Promise<QuotationWithDetails | undefined> {
    const quotation = this.quotations.get(id);
    if (!quotation) return undefined;

    return {
      ...quotation,
      customer: this.users.get(quotation.customerId)!,
      items: Array.from(this.quotationItems.values())
        .filter(item => item.quotationId === quotation.id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId)!
        }))
    };
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const newQuotation: Quotation = {
      id: randomUUID(),
      quotationNumber: `QT-${Date.now()}`,
      ...quotation,
      createdAt: new Date(),
    };
    this.quotations.set(newQuotation.id, newQuotation);
    return newQuotation;
  }

  async updateQuotationStatus(id: string, status: string): Promise<Quotation> {
    const quotation = this.quotations.get(id);
    if (!quotation) throw new Error("Quotation not found");
    
    const updatedQuotation = { ...quotation, status: status as any };
    this.quotations.set(id, updatedQuotation);
    return updatedQuotation;
  }

  async createQuotationItem(quotationItem: InsertQuotationItem): Promise<QuotationItem> {
    const newItem: QuotationItem = {
      id: randomUUID(),
      ...quotationItem,
    };
    this.quotationItems.set(newItem.id, newItem);
    return newItem;
  }

  async convertQuotationToOrder(quotationId: string): Promise<Order> {
    const quotation = await this.getQuotation(quotationId);
    if (!quotation) throw new Error("Quotation not found");

    const newOrder: Order = {
      id: randomUUID(),
      orderNumber: `ORD-${Date.now()}`,
      customerId: quotation.customerId,
      quotationId: quotation.id,
      status: "pending",
      startDate: quotation.startDate,
      endDate: quotation.endDate,
      pickupTime: null,
      returnTime: null,
      totalAmount: quotation.totalAmount,
      securityDeposit: quotation.securityDeposit,
      paidAmount: "0.00",
      remainingAmount: quotation.totalAmount,
      lateFee: "0.00",
      actualReturnDate: null,
      notes: quotation.notes,
      contractGenerated: false,
      createdAt: new Date(),
    };

    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async getProductWithAvailability(id: string, startDate: Date, endDate: Date): Promise<ProductWithAvailability | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;

    const reservations = await this.getReservations(id);
    return {
      ...product,
      isAvailable: true,
      reservations,
    };
  }

  async checkProductAvailability(productId: string, quantity: number, startDate: Date, endDate: Date): Promise<boolean> {
    const product = this.products.get(productId);
    return product ? product.availableQuantity >= quantity : false;
  }

  async updateOrderPayment(id: string, paidAmount: number): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");

    const updatedOrder = { ...order, paidAmount: paidAmount.toFixed(2) };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async calculateLateFees(orderId: string): Promise<number> {
    return 0; // Simplified implementation
  }

  async createReservation(reservation: InsertProductReservation): Promise<ProductReservation> {
    const newReservation: ProductReservation = {
      id: randomUUID(),
      ...reservation,
      createdAt: new Date(),
    };
    this.productReservations.set(newReservation.id, newReservation);
    return newReservation;
  }

  async getReservations(productId?: string): Promise<ProductReservation[]> {
    const reservations = Array.from(this.productReservations.values());
    return productId ? reservations.filter(r => r.productId === productId) : reservations;
  }

  async releaseReservation(reservationId: string): Promise<void> {
    this.productReservations.delete(reservationId);
  }

  async getCustomerSegment(customerId: string): Promise<CustomerSegment | undefined> {
    return Array.from(this.customerSegments.values())
      .find(segment => segment.customerId === customerId);
  }

  async createCustomerSegment(segment: InsertCustomerSegment): Promise<CustomerSegment> {
    const newSegment: CustomerSegment = {
      id: randomUUID(),
      ...segment,
      createdAt: new Date(),
    };
    this.customerSegments.set(newSegment.id, newSegment);
    return newSegment;
  }

  async getPricingRules(productId?: string, categoryId?: string): Promise<PricingRule[]> {
    return Array.from(this.pricingRules.values()).filter(rule => rule.isActive);
  }

  async createPricingRule(rule: InsertPricingRule): Promise<PricingRule> {
    const newRule: PricingRule = {
      id: randomUUID(),
      ...rule,
      createdAt: new Date(),
    };
    this.pricingRules.set(newRule.id, newRule);
    return newRule;
  }

  async calculateDynamicPrice(productId: string, customerId: string, duration: number, pricingType: string): Promise<number> {
    const product = this.products.get(productId);
    return product ? parseFloat(product.dailyRate) * duration : 0;
  }

  async getLateFeeConfig(): Promise<LateFeeConfig | undefined> {
    return Array.from(this.lateFeeConfigs.values()).find(config => config.isActive);
  }

  async createLateFeeConfig(config: InsertLateFeeConfig): Promise<LateFeeConfig> {
    const newConfig: LateFeeConfig = {
      id: randomUUID(),
      ...config,
      createdAt: new Date(),
    };
    this.lateFeeConfigs.set(newConfig.id, newConfig);
    return newConfig;
  }

  async generatePickupDocument(orderId: string): Promise<any> {
    const order = await this.getOrder(orderId);
    return { documentType: "pickup", order };
  }

  async generateReturnDocument(orderId: string): Promise<any> {
    const order = await this.getOrder(orderId);
    return { documentType: "return", order };
  }

  async sendReminderNotifications(): Promise<void> {
    // Implementation for sending reminders
  }

  async getMostRentedProducts(startDate: Date, endDate: Date): Promise<ReportData['mostRentedProducts']> {
    return [];
  }

  async getTopCustomers(startDate: Date, endDate: Date): Promise<ReportData['topCustomers']> {
    return [];
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month'): Promise<ReportData['revenueByPeriod']> {
    return [];
  }

  async exportReport(type: 'pdf' | 'xlsx' | 'csv', data: any): Promise<Buffer> {
    return Buffer.from(JSON.stringify(data));
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const orders = Array.from(this.orders.values());
    const payments = Array.from(this.payments.values());
    const products = Array.from(this.products.values());
    const users = Array.from(this.users.values());
    const quotations = Array.from(this.quotations.values());

    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const activeRentals = orders.filter(o => o.status === 'delivered').length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomers = users.filter(u => u.createdAt > thirtyDaysAgo && u.role === 'customer').length;

    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const rentedQuantity = products.reduce((sum, p) => sum + (p.quantity - p.availableQuantity), 0);
    const inventoryUtilization = totalQuantity > 0 ? Math.round((rentedQuantity / totalQuantity) * 100) : 0;

    const overdueOrders = orders.filter(o => 
      o.status === "delivered" && new Date(o.endDate) < new Date()
    ).length;

    const pendingQuotations = quotations.filter(q => q.status === "sent").length;

    return {
      totalRevenue,
      activeRentals,
      newCustomers,
      inventoryUtilization,
      overdueOrders,
      pendingQuotations,
    };
  }

  async getRecentOrders(limit: number = 10): Promise<OrderWithDetails[]> {
    const orders = await this.getOrders();
    return orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

// For now, keep using MemStorage but prepare for database integration
export const storage = new MemStorage();
