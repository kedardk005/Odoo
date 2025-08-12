import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "staff"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "delivered", "returned", "cancelled", "overdue"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["scheduled", "in_transit", "delivered", "completed"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["pickup", "return"]);
export const productStatusEnum = pgEnum("product_status", ["available", "rented", "maintenance", "reserved"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "overdue", "refunded", "partial"]);
export const quotationStatusEnum = pgEnum("quotation_status", ["draft", "sent", "approved", "rejected", "expired"]);
export const pricingTypeEnum = pgEnum("pricing_type", ["hourly", "daily", "weekly", "monthly"]);
export const customerSegmentEnum = pgEnum("customer_segment", ["standard", "vip", "corporate", "seasonal"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  dateOfBirth: text("date_of_birth"),
  companyName: text("company_name"),
  businessType: text("business_type"),
  gstin: text("gstin"),
  profilePicture: text("profile_picture"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  membershipLevel: text("membership_level").default("bronze"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  lastLoginAt: timestamp("last_login_at"),
  role: userRoleEnum("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  weeklyRate: decimal("weekly_rate", { precision: 10, scale: 2 }),
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  status: productStatusEnum("status").default("available").notNull(),
  imageUrl: text("image_url"),
  specifications: text("specifications"),
  minRentalPeriod: integer("min_rental_period").default(1), // in hours
  maxRentalPeriod: integer("max_rental_period").default(720), // in hours (30 days)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quotations table
export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationNumber: text("quotation_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  status: quotationStatusEnum("status").default("draft").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).notNull(),
  validUntil: timestamp("valid_until").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  quotationId: varchar("quotation_id").references(() => quotations.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pickupTime: text("pickup_time"),
  returnTime: text("return_time"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lateFee: decimal("late_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  actualReturnDate: timestamp("actual_return_date"),
  notes: text("notes"),
  contractGenerated: boolean("contract_generated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deliveries table
export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  type: deliveryTypeEnum("type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  status: deliveryStatusEnum("status").default("scheduled").notNull(),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  address: text("address").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paymentMethod: text("payment_method"),
  paymentGateway: text("payment_gateway"),
  transactionId: text("transaction_id"),
  gatewayPaymentId: text("gateway_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, warning, error, success
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quotation items table
export const quotationItems = pgTable("quotation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").references(() => quotations.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  pricingType: pricingTypeEnum("pricing_type").notNull(),
});

// Customer segments and pricing rules
export const customerSegments = pgTable("customer_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  segment: customerSegmentEnum("segment").notNull(),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pricing rules table
export const pricingRules = pgTable("pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  categoryId: varchar("category_id").references(() => categories.id),
  productId: varchar("product_id").references(() => products.id),
  customerSegment: customerSegmentEnum("customer_segment"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0.00"),
  fixedDiscount: decimal("fixed_discount", { precision: 10, scale: 2 }).default("0.00"),
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Late fee configurations
export const lateFeeConfig = pgTable("late_fee_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  dailyFeePercentage: decimal("daily_fee_percentage", { precision: 5, scale: 2 }).default("5.00"),
  maxFeePercentage: decimal("max_fee_percentage", { precision: 5, scale: 2 }).default("50.00"),
  gracePeriodHours: integer("grace_period_hours").default(24),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product reservations for availability tracking
export const productReservations = pgTable("product_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  quotationId: varchar("quotation_id").references(() => quotations.id),
  quantity: integer("quantity").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(), // active, released, expired
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  totalSpent: true,
  lastLoginAt: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  email: true,
  password: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  totalSpent: true,
  lastLoginAt: true,
  isEmailVerified: true,
  isPhoneVerified: true,
  membershipLevel: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  availableQuantity: true,
}).extend({
  // Override decimal fields to accept numbers and convert to strings
  hourlyRate: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : undefined
  ),
  dailyRate: z.union([z.string(), z.number()]).transform(val => val.toString()),
  weeklyRate: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : undefined
  ),
  monthlyRate: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : undefined
  ),
  securityDeposit: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
}).extend({
  // Allow orderNumber to be provided
  orderNumber: z.string().optional(),
  // Override decimal fields to accept numbers and convert to strings
  totalAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
  securityDeposit: z.union([z.string(), z.number()]).transform(val => val.toString()),
  paidAmount: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : "0.00"
  ),
  remainingAmount: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : "0.00"
  ),
  lateFee: z.union([z.string(), z.number()]).optional().transform(val => 
    val !== undefined ? val.toString() : "0.00"
  ),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
}).extend({
  // Override decimal fields to accept numbers and convert to strings
  unitPrice: z.union([z.string(), z.number()]).transform(val => val.toString()),
  totalAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  // Override decimal fields to accept numbers and convert to strings
  amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
}).extend({
  // Allow quotationNumber to be provided
  quotationNumber: z.string().optional(),
  // Override decimal fields to accept numbers and convert to strings
  totalAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
  securityDeposit: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({
  id: true,
}).extend({
  // Override decimal fields to accept numbers and convert to strings
  rate: z.union([z.string(), z.number()]).transform(val => val.toString()),
  totalAmount: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertCustomerSegmentSchema = createInsertSchema(customerSegments).omit({
  id: true,
  createdAt: true,
});

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({
  id: true,
  createdAt: true,
});

export const insertLateFeeConfigSchema = createInsertSchema(lateFeeConfig).omit({
  id: true,
  createdAt: true,
});

export const insertProductReservationSchema = createInsertSchema(productReservations).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;

export type CustomerSegment = typeof customerSegments.$inferSelect;
export type InsertCustomerSegment = z.infer<typeof insertCustomerSegmentSchema>;

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;

export type LateFeeConfig = typeof lateFeeConfig.$inferSelect;
export type InsertLateFeeConfig = z.infer<typeof insertLateFeeConfigSchema>;

export type ProductReservation = typeof productReservations.$inferSelect;
export type InsertProductReservation = z.infer<typeof insertProductReservationSchema>;

// Extended types for frontend
export type OrderWithDetails = Order & {
  customer: User;
  items: (OrderItem & { product: Product })[];
  deliveries: Delivery[];
  payments: Payment[];
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

// Extended types for frontend
export type QuotationWithDetails = Quotation & {
  customer: User;
  items: (QuotationItem & { product: Product })[];
};

export type OrderWithReservations = OrderWithDetails & {
  reservations: ProductReservation[];
};

export type ProductWithAvailability = ProductWithCategory & {
  isAvailable: boolean;
  nextAvailableDate?: Date;
  reservations: ProductReservation[];
};

export type DashboardMetrics = {
  totalRevenue: number;
  activeRentals: number;
  totalCustomers: number; // total customers from DB
  pendingOrders: number; // pending orders count
  inventoryUtilization: number;
  overdueOrders: number;
  pendingQuotations: number; // keep for compatibility
  newCustomers?: number; // optional for backward-compat
};

export type ReportData = {
  mostRentedProducts: Array<{
    product: Product;
    totalRentals: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customer: User;
    totalOrders: number;
    totalRevenue: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
};
