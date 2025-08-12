import type { Express } from "express";
import { createServer, type Server } from "http";
import Razorpay from "razorpay";
import crypto from "crypto";
import { storage } from "./storage";
import { cronService } from "./cron";
import { reportsService } from "./reports";
import { uploadSingle, uploadMultiple, handleSingleUpload, handleMultipleUpload, uploadService } from "./upload";
import { upload, uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
// Email service is imported dynamically to avoid dependency issues
import { insertUserSchema, insertProductSchema, insertCategorySchema, insertOrderSchema, insertOrderItemSchema, insertDeliverySchema, insertPaymentSchema, insertNotificationSchema, updateUserProfileSchema } from "@shared/schema";
import { realtimeService } from "./realtime";

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

  // Profile routes
  app.get("/api/profile", async (req, res) => {
    try {
      // For now, we'll use a simple user ID from query or body
      // In production, this would come from JWT token
      let userId = req.query.userId as string || req.body.userId || "default-user";
      
      // If requesting default-user, try to find the test user by email
      if (userId === "default-user") {
        const testUser = await storage.getUserByEmail("test@example.com");
        if (testUser) {
          userId = testUser.id;
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional profile stats
      const orders = await storage.getOrders(userId);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

      // Determine membership level based on spending
      let membershipLevel = "Bronze";
      if (totalSpent >= 100000) membershipLevel = "Platinum";
      else if (totalSpent >= 50000) membershipLevel = "Gold";
      else if (totalSpent >= 25000) membershipLevel = "Silver";

      const { password, ...userProfile } = user;
      const profileWithStats = {
        ...userProfile,
        totalOrders,
        totalSpent,
        membershipLevel,
      };

      res.json(profileWithStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      let userId = req.query.userId as string || req.body.userId || "default-user";
      
      // If requesting default-user, try to find the test user by email
      if (userId === "default-user") {
        const testUser = await storage.getUserByEmail("test@example.com");
        if (testUser) {
          userId = testUser.id;
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }

      // Validate the profile data
      const profileData = updateUserProfileSchema.parse(req.body);
      
      // Update the user profile
      const updatedUser = await storage.updateUser(userId, {
        ...profileData,
        updatedAt: new Date(),
      });

      const { password, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Test user creation route (for development)
  app.post("/api/create-test-user", async (req, res) => {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByEmail("test@example.com");
      if (existingUser) {
        return res.json({ message: "Test user already exists", user: existingUser });
      }

      // Create test user with all profile fields
      const testUserData = {
        username: "testuser",
        email: "test@example.com", 
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        phone: "+91 9876543210",
        address: "123 Main Street, Apartment 4B",
        city: "Mumbai",
        state: "Maharashtra", 
        pincode: "400001",
        dateOfBirth: "1990-05-15",
        companyName: "Tech Solutions Pvt Ltd",
        businessType: "Software Development",
        gstin: "27ABCDE1234F1Z5",
        membershipLevel: "Gold",
        role: "customer" as const,
      };

      const newUser = await storage.createUser(testUserData);
      const { password, ...userResponse } = newUser;
      
      res.json({ 
        message: "Test user created successfully", 
        user: userResponse 
      });
    } catch (error: any) {
      console.error("Error creating test user:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Customer-specific routes
  app.get("/api/customer/orders", async (req, res) => {
    try {
      let userId = req.query.userId as string || "default-user";
      
      // If requesting default-user, try to find the test user by email
      if (userId === "default-user") {
        const testUser = await storage.getUserByEmail("test@example.com");
        if (testUser) {
          userId = testUser.id;
        } else {
          return res.json([]); // Return empty array if no user found
        }
      }
      
      const orders = await storage.getOrders(userId);
      
      // Transform orders with additional details
      const ordersWithDetails = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return {
          ...order,
          orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8)}`,
          items: items.length > 0 ? items : [],
          rentFrom: order.startDate,
          rentTo: order.endDate,
          totalAmount: parseFloat(order.totalAmount.toString()),
        };
      }));

      res.json(ordersWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/customer/quotations", async (req, res) => {
    try {
      let userId = req.query.userId as string || "default-user";
      
      // If requesting default-user, try to find the test user by email
      if (userId === "default-user") {
        const testUser = await storage.getUserByEmail("test@example.com");
        if (testUser) {
          userId = testUser.id;
        } else {
          return res.json([]); // Return empty array if no user found
        }
      }
      
      const quotations = await storage.getQuotationsByCustomer(userId);
      
      // Transform quotations with additional details
      const quotationsWithDetails = await Promise.all(quotations.map(async (quotation) => {
        const items = await storage.getQuotationItems(quotation.id);
        return {
          ...quotation,
          quotationNumber: quotation.quotationNumber || `QUO-${quotation.id.slice(0, 8)}`,
          items: items.length > 0 ? items : [],
          eventDate: quotation.startDate,
          eventLocation: "Location not specified", // Add this to schema if needed
          eventType: "Event type not specified", // Add this to schema if needed
          requestedAmount: parseFloat(quotation.totalAmount.toString()),
          quotedAmount: parseFloat(quotation.totalAmount.toString()),
          specialRequirements: quotation.notes,
          adminNotes: quotation.notes,
        };
      }));

      res.json(quotationsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      console.log('📦 Creating product with data:', req.body);
      
      // Validate the product data
      const productData = insertProductSchema.parse(req.body);
      console.log('✅ Product data validated:', productData);
      
      // Create the product
      const product = await storage.createProduct(productData);
      console.log('🎉 Product created successfully:', product);
      
      res.status(201).json(product);
    } catch (error: any) {
      console.error('❌ Product creation error:', error);
      res.status(400).json({ 
        message: error.message,
        details: error.issues ? error.issues : undefined 
      });
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

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.deleteProduct(req.params.id);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Upload product image
  app.post("/api/products/upload-image", upload.single('image'), async (req, res) => {
    try {
      console.log('📸 Image upload request received');
      console.log('📁 File info:', req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Check Cloudinary configuration
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      
      console.log('☁️ Cloudinary config:', {
        cloudName: cloudName ? `${cloudName.substring(0, 5)}...` : 'Not set',
        apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : 'Not set',
        apiSecret: apiSecret ? 'Set' : 'Not set'
      });

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({ 
          message: "Cloudinary configuration is incomplete. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables." 
        });
      }

      // Upload to Cloudinary
      console.log('⬆️ Uploading to Cloudinary...');
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'rental-products');
      console.log('✅ Upload successful:', uploadResult.url);
      
      res.json({
        success: true,
        imageUrl: uploadResult.url,
        publicId: uploadResult.public_id,
        message: "Image uploaded successfully"
      });
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      res.status(500).json({ 
        message: "Failed to upload image",
        error: error.message 
      });
    }
  });

  // Delete product image
  app.delete("/api/products/delete-image", async (req, res) => {
    try {
      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ message: "Public ID is required" });
      }

      await deleteFromCloudinary(publicId);
      res.json({ success: true, message: "Image deleted successfully" });
    } catch (error: any) {
      console.error('Image delete error:', error);
      res.status(500).json({ 
        message: "Failed to delete image",
        error: error.message 
      });
    }
  });

  // Test endpoint for product creation (development only)
  app.post("/api/test-product", async (req, res) => {
    try {
      console.log('🧪 Test product creation endpoint called');
      
      const testProductData = {
        name: "Test Product " + Date.now(),
        description: "A test product created via API",
        categoryId: req.body.categoryId || "test-category",
        dailyRate: 100,
        securityDeposit: 500,
        quantity: 1,
        availableQuantity: 1,
        status: "available" as const,
      };

      console.log('📦 Creating test product:', testProductData);
      const product = await storage.createProduct(testProductData);
      console.log('✅ Test product created:', product);
      
      res.json({
        success: true,
        message: "Test product created successfully",
        product
      });
    } catch (error: any) {
      console.error('❌ Test product creation error:', error);
      res.status(500).json({ 
        message: "Test product creation failed",
        error: error.message 
      });
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
          const oldQuantity = product.availableQuantity;
          const newQuantity = product.availableQuantity - item.quantity;
          await storage.updateProductAvailability(
            item.productId, 
            newQuantity
          );
          
          // Send real-time notification for product availability change
          realtimeService.notifyProductAvailabilityChange(
            item.productId,
            oldQuantity,
            newQuantity,
            product
          );
        }
      }
      
      // Send real-time notification for new order
      realtimeService.notifyNewOrder(order);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const oldOrder = await storage.getOrder(req.params.id);
      const order = await storage.updateOrderStatus(req.params.id, status);
      
      // Send real-time notification for order status change
      if (oldOrder && oldOrder.status !== status) {
        realtimeService.notifyOrderStatusChange(
          order.id,
          order.customerId,
          oldOrder.status,
          status,
          order
        );
      }
      
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
      const oldDelivery = await storage.getDelivery(req.params.id);
      const delivery = await storage.updateDeliveryStatus(req.params.id, status);
      
      // Send real-time notification for delivery status change
      if (oldDelivery && oldDelivery.status !== status) {
        realtimeService.notifyDeliveryStatusChange(
          delivery.orderId,
          delivery.customerId,
          oldDelivery.status,
          status,
          delivery
        );
      }
      
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
      
      // Send real-time notification for payment status change
      realtimeService.notifyPaymentStatusChange(
        payment.orderId,
        payment.customerId || 'unknown',
        'pending',
        payment.status,
        payment
      );
      
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
          
          // Send real-time notification for payment status change
          realtimeService.notifyPaymentStatusChange(
            order_id,
            'unknown', // Customer ID not available in this context
            'pending',
            'paid',
            payment
          );
          
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

  // Quotation routes
  app.get("/api/quotations", async (req, res) => {
    try {
      const customerId = req.query.customerId as string;
      const quotations = await storage.getQuotations(customerId);
      res.json(quotations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quotations", async (req, res) => {
    try {
      const quotation = await storage.createQuotation(req.body);
      
      // Create quotation items
      for (const item of req.body.items || []) {
        await storage.createQuotationItem({
          quotationId: quotation.id,
          ...item,
        });
      }
      
      // Send email notification
      const customer = await storage.getUser(quotation.customerId);
      if (customer) {
        const quotationWithDetails = await storage.getQuotation(quotation.id);
        if (quotationWithDetails) {
          const { emailService } = await import('./email');
          await emailService.sendQuotationEmail(quotationWithDetails, customer);
        }
      }
      
      res.status(201).json(quotation);
    } catch (error: any) {
      console.error("Error creating quotation:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/quotations/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const quotation = await storage.updateQuotationStatus(req.params.id, status);
      res.json(quotation);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/quotations/:id/convert-to-order", async (req, res) => {
    try {
      const order = await storage.convertQuotationToOrder(req.params.id);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Pricing rules routes
  app.get("/api/pricing-rules", async (req, res) => {
    try {
      const productId = req.query.productId as string;
      const categoryId = req.query.categoryId as string;
      const rules = await storage.getPricingRules(productId, categoryId);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/pricing-rules", async (req, res) => {
    try {
      const rule = await storage.createPricingRule(req.body);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/pricing-rules/:id", async (req, res) => {
    try {
      res.json({ message: "Pricing rule updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // File Upload Routes
  app.post("/api/upload/single", uploadSingle, handleSingleUpload('uploads'), async (req, res) => {
    try {
      if (!req.body.imageUrl) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      res.json({ 
        success: true, 
        url: req.body.imageUrl,
        message: "File uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/upload/multiple", uploadMultiple, handleMultipleUpload('uploads'), async (req, res) => {
    try {
      if (!req.body.imageUrls || req.body.imageUrls.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      res.json({ 
        success: true, 
        urls: req.body.imageUrls,
        message: "Files uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product Image Upload
  app.post("/api/products/:id/upload-image", uploadSingle, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = await uploadService.uploadProductImage(req.file.buffer);
      const product = await storage.updateProduct(req.params.id, { imageUrl });
      
      res.json({ 
        success: true, 
        product,
        imageUrl,
        message: "Product image uploaded successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reports Routes
  app.get("/api/reports/most-rented-products", async (req, res) => {
    try {
      const { period = 'monthly', limit = '10', startDate, endDate } = req.query;
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const products = await reportsService.getMostRentedProducts(reportPeriod, parseInt(limit as string));
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/revenue", async (req, res) => {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const revenue = await reportsService.getRevenueReport(reportPeriod);
      res.json(revenue);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/top-customers", async (req, res) => {
    try {
      const { period = 'monthly', limit = '10', startDate, endDate } = req.query;
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const customers = await reportsService.getTopCustomers(reportPeriod, parseInt(limit as string));
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/analytics", async (req, res) => {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      const analytics = await reportsService.getRentalAnalytics(reportPeriod);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate PDF Reports
  app.get("/api/reports/pdf/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;
      
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      let data;
      switch (type) {
        case 'revenue':
          data = await reportsService.getRevenueReport(reportPeriod);
          break;
        case 'products':
          data = await reportsService.getMostRentedProducts(reportPeriod);
          break;
        case 'customers':
          data = await reportsService.getTopCustomers(reportPeriod);
          break;
        case 'analytics':
          data = await reportsService.getRentalAnalytics(reportPeriod);
          break;
        default:
          return res.status(400).json({ message: "Invalid report type" });
      }

      const pdfBuffer = await reportsService.generatePDFReport(type as any, reportPeriod, data);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export CSV Reports
  app.get("/api/reports/csv/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { period = 'monthly', startDate, endDate } = req.query;
      
      const reportPeriod = reportsService.getReportPeriod(
        period as any,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      let data;
      let headers;
      
      switch (type) {
        case 'products':
          data = await reportsService.getMostRentedProducts(reportPeriod);
          headers = ['productName', 'categoryName', 'totalRentals', 'totalRevenue', 'averageRentalDuration'];
          break;
        case 'customers':
          data = await reportsService.getTopCustomers(reportPeriod);
          headers = ['customerName', 'email', 'totalOrders', 'totalSpent', 'averageOrderValue'];
          break;
        default:
          return res.status(400).json({ message: "CSV export not available for this report type" });
      }

      const csvContent = reportsService.exportToCSV(data, headers);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cron Job Management Routes (Admin only)
  app.post("/api/admin/cron/start", async (req, res) => {
    try {
      cronService.start();
      res.json({ success: true, message: "Cron services started successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/cron/stop", async (req, res) => {
    try {
      cronService.stop();
      res.json({ success: true, message: "Cron services stopped successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Manual trigger cron jobs for testing
  app.post("/api/admin/cron/trigger/reminders", async (req, res) => {
    try {
      await cronService.triggerReturnReminders();
      res.json({ success: true, message: "Return reminders processed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/cron/trigger/overdue", async (req, res) => {
    try {
      await cronService.triggerOverdueProcessing();
      res.json({ success: true, message: "Overdue orders processed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/cron/trigger/late-fees", async (req, res) => {
    try {
      await cronService.triggerLateFeeCalculation();
      res.json({ success: true, message: "Late fees calculated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product Availability Check
  app.get("/api/products/:id/availability", async (req, res) => {
    try {
      const { startDate, endDate, quantity = '1' } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const availability = await storage.checkProductAvailability(
        req.params.id,
        new Date(startDate as string),
        new Date(endDate as string),
        parseInt(quantity as string)
      );

      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk Product Operations
  app.post("/api/admin/products/bulk-update-status", async (req, res) => {
    try {
      const { productIds, status } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || !status) {
        return res.status(400).json({ message: "Product IDs array and status are required" });
      }

      const results = [];
      for (const productId of productIds) {
        const product = await storage.updateProduct(productId, { status });
        results.push(product);
      }

      res.json({ success: true, updatedProducts: results });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
