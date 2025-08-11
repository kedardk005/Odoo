import type { Express } from "express";
import { createServer, type Server } from "http";
import Razorpay from "razorpay";
import crypto from "crypto";
import { storage } from "./storage";
import { sendEmail, emailTemplates } from "./email";
import { insertUserSchema, insertProductSchema, insertCategorySchema, insertOrderSchema, insertOrderItemSchema, insertDeliverySchema, insertPaymentSchema, insertNotificationSchema } from "@shared/schema";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard/recent-orders", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const products = await storage.getProducts(categoryId);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const customerId = req.query.customerId as string;
      const orders = await storage.getOrders(customerId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      const orderInfo = insertOrderSchema.parse(orderData);
      
      // Create the order
      const order = await storage.createOrder(orderInfo);
      
      // Create order items
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          ...item,
          orderId: order.id,
        });
        await storage.createOrderItem(orderItemData);
        
        // Update product availability
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProductAvailability(
            item.productId, 
            product.availableQuantity - item.quantity
          );
        }
      }
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      // This would normally filter by role, but for simplicity we'll return all users
      const users = Array.from((storage as any).users.values()).filter((user: any) => user.role === 'customer');
      const customers = users.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delivery routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      const orderId = req.query.orderId as string;
      const deliveries = await storage.getDeliveries(orderId);
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const deliveryData = insertDeliverySchema.parse(req.body);
      const delivery = await storage.createDelivery(deliveryData);
      res.status(201).json(delivery);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/deliveries/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const delivery = await storage.updateDeliveryStatus(req.params.id, status);
      res.json(delivery);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const orderId = req.query.orderId as string;
      const payments = await storage.getPayments(orderId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Razorpay payment routes
  app.post("/api/razorpay/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt, notes } = req.body;
      
      const options = {
        amount: Math.round(amount * 100), // Convert to smallest currency unit (paise for INR)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || {},
      };

      const razorpayOrder = await razorpay.orders.create(options);
      res.json(razorpayOrder);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating Razorpay order: " + error.message });
    }
  });

  app.post("/api/razorpay/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
      
      // Verify the payment signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature === razorpay_signature) {
        // Payment is verified, update the order/payment status
        if (order_id) {
          // Update payment record
          const payment = await storage.createPayment({
            orderId: order_id,
            amount: "0", // Will be updated with actual amount
            paymentMethod: "razorpay",
            status: "paid",
            transactionId: razorpay_payment_id,
            paidAt: new Date(),
          });
          
          res.json({ 
            success: true, 
            message: "Payment verified successfully",
            payment_id: razorpay_payment_id 
          });
        } else {
          res.json({ 
            success: true, 
            message: "Payment verified successfully",
            payment_id: razorpay_payment_id 
          });
        }
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Payment verification failed" 
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Error verifying payment: " + error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
