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
      const userId = (req.query.userId as string) || req.body.userId;
      if (!userId) {
        return res.status(401).json({ message: "Missing userId. Please sign up or log in." });
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
      const userId = (req.query.userId as string) || req.body.userId;
      if (!userId) {
        return res.status(401).json({ message: "Missing userId. Please sign up or log in." });
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

  // Logout route
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // In a real app, you would invalidate the JWT token or session here
      // For now, we'll just return a success response
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Removed /api/create-test-user route (not needed)

  // Customer-specific routes
  app.get("/api/customer/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]); // Not logged in -> empty
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
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]); // Not logged in -> empty
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
      const { items = [], customerId, customerDetails, totalAmount, securityDeposit, notes } = req.body || {};
      
      console.log("Creating order with data:", JSON.stringify(req.body, null, 2));
      
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "At least one item is required" });

      // Validate all product IDs exist before creating order to avoid FK errors
      const invalidProductIds: string[] = [];
      for (const it of items) {
        if (!it?.productId) {
          invalidProductIds.push('(missing)');
          continue;
        }
        const product = await storage.getProduct(it.productId);
        if (!product) invalidProductIds.push(it.productId);
      }
      if (invalidProductIds.length > 0) {
        return res.status(400).json({ 
          message: "One or more product IDs are invalid. Please refresh products and try again.",
          invalidProductIds
        });
      }

      // Resolve/ensure a valid customerId (support guest checkout)
      let finalCustomerId: string | undefined = customerId;
      let customerRecord = finalCustomerId ? await storage.getUser(finalCustomerId) : undefined;

      // If provided customerId doesn't exist, try by email or create a lightweight guest
      if (!customerRecord) {
        const email = customerDetails?.email as string | undefined;
        if (email) {
          const byEmail = await storage.getUserByEmail(email);
          if (byEmail) {
            customerRecord = byEmail;
            finalCustomerId = byEmail.id;
          }
        }
      }

      if (!customerRecord) {
        // Create minimal guest customer from provided details
        const firstName = customerDetails?.firstName || "Guest";
        const lastName = customerDetails?.lastName || "User";
        const email = customerDetails?.email || `guest_${Date.now()}@example.com`;
        const usernameBase = (email.split("@")[0] || "guest").replace(/[^a-zA-Z0-9_\-]/g, "");
        const username = `${usernameBase}_${Math.random().toString(36).slice(2, 6)}`;
        const password = crypto.randomBytes(8).toString('hex');

        try {
          const created = await storage.createUser({
            username,
            email,
            password,
            firstName,
            lastName,
            phone: customerDetails?.phone,
            address: customerDetails?.address,
            city: customerDetails?.city,
            state: customerDetails?.state,
            pincode: customerDetails?.pincode,
            role: 'customer',
          } as any);
          customerRecord = created;
          finalCustomerId = created.id;
          console.log("Created guest customer:", { id: created.id, email: created.email, username: created.username });
        } catch (e: any) {
          console.error("Failed to create guest customer:", e);
          return res.status(400).json({ message: "Invalid customer and unable to create guest customer", details: e.message });
        }
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Use provided totals or calculate them
      let totalAmountNum = totalAmount ? parseFloat(totalAmount.toString()) : 0;
      let securityDepositNum = securityDeposit ? parseFloat(securityDeposit.toString()) : 0;

      // If totals not provided, calculate them
      if (!totalAmount || !securityDeposit) {
        totalAmountNum = 0;
        securityDepositNum = 0;
        
        for (const item of items) {
          const qty = Number(item.quantity || 1);
          const itemTotal = parseFloat(item.totalAmount?.toString() || "0");
          totalAmountNum += itemTotal;

          const product = await storage.getProduct(item.productId);
          if (product?.securityDeposit) {
            securityDepositNum += parseFloat(product.securityDeposit.toString()) * qty;
          }
        }
      }

      // Get start and end dates from first item or use defaults
      const firstItem = items[0];
      console.log("First item for date extraction:", JSON.stringify(firstItem, null, 2));
      
      let startDate, endDate;
      
      if (firstItem?.startDate) {
        startDate = new Date(firstItem.startDate);
        console.log("Parsed startDate:", startDate);
      } else {
        startDate = new Date();
        console.log("Using default startDate:", startDate);
      }
      
      if (firstItem?.endDate) {
        endDate = new Date(firstItem.endDate);
        console.log("Parsed endDate:", endDate);
      } else {
        endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log("Using default endDate:", endDate);
      }

      const orderInfo = insertOrderSchema.parse({
        orderNumber,
        customerId: finalCustomerId!, // ensure resolved/created customer is used
        status: 'pending',
        startDate,
        endDate,
        totalAmount: totalAmountNum.toFixed(2),
        securityDeposit: securityDepositNum.toFixed(2),
        paidAmount: '0.00',
        remainingAmount: totalAmountNum.toFixed(2),
        notes: notes || '',
      });
      
      console.log("Creating order with info:", orderInfo);
      
      // Create the order
      const order = await storage.createOrder(orderInfo);
      
      console.log("Order created:", order);
      
      // Create order items
      for (const item of items) {
        const dailyRateNum = parseFloat(item.dailyRate?.toString() || "0");
        const unitPrice = dailyRateNum > 0 ? dailyRateNum : parseFloat(item.totalAmount?.toString() || "0") / Number(item.quantity || 1);
        
        const orderItemData = insertOrderItemSchema.parse({
          orderId: order.id,
          productId: item.productId,
          quantity: Number(item.quantity || 1),
          unitPrice: unitPrice.toFixed(2),
          totalAmount: parseFloat(item.totalAmount?.toString() || "0").toFixed(2),
        });
        
        console.log("Creating order item:", orderItemData);
        await storage.createOrderItem(orderItemData);
        
        // Update product availability
        const product = await storage.getProduct(item.productId);
        if (product) {
          const oldQuantity = product.availableQuantity;
          const newQuantity = product.availableQuantity - Number(item.quantity || 1);
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
      console.error('❌ Order creation error:', error);
      res.status(400).json({ 
        message: error?.message || 'Order creation failed',
        details: error?.issues || undefined,
        stack: process.env.NODE_ENV !== 'production' ? error?.stack : undefined
      });
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

  app.get("/api/quotations/:id", async (req, res) => {
    try {
      const quotation = await storage.getQuotation(req.params.id);
      if (!quotation) {
        return res.status(404).json({ message: "Quotation not found" });
      }
      res.json(quotation);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quotations", async (req, res) => {
    try {
      const { items = [], customerId, customerDetails, totalAmount, securityDeposit, notes, validUntil } = req.body || {};
      
      console.log("Creating quotation with data:", JSON.stringify(req.body, null, 2));
      
      if (!customerId) return res.status(400).json({ message: "customerId is required" });
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "At least one item is required" });

      // Generate quotation number
      const quotationNumber = `QUO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Use provided totals or calculate them
      let totalAmountNum = totalAmount ? parseFloat(totalAmount.toString()) : 0;
      let securityDepositNum = securityDeposit ? parseFloat(securityDeposit.toString()) : 0;

      // If totals not provided, calculate them
      if (!totalAmount || !securityDeposit) {
        totalAmountNum = 0;
        securityDepositNum = 0;
        
        for (const item of items) {
          const qty = Number(item.quantity || 1);
          const itemTotal = parseFloat(item.totalAmount?.toString() || "0");
          totalAmountNum += itemTotal;

          const product = await storage.getProduct(item.productId);
          if (product?.securityDeposit) {
            securityDepositNum += parseFloat(product.securityDeposit.toString()) * qty;
          }
        }
      }

      // Get start and end dates from first item or use defaults
      const firstItem = items[0];
      const startDate = firstItem?.startDate ? new Date(firstItem.startDate) : new Date();
      const endDate = firstItem?.endDate ? new Date(firstItem.endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const quotationInfo = insertQuotationSchema.parse({
        quotationNumber,
        customerId,
        status: 'draft',
        startDate,
        endDate,
        totalAmount: totalAmountNum.toFixed(2),
        securityDeposit: securityDepositNum.toFixed(2),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: notes || '',
      });
      
      console.log("Creating quotation with info:", quotationInfo);
      
      // Create the quotation
      const quotation = await storage.createQuotation(quotationInfo);
      
      console.log("Quotation created:", quotation);
      
      // Create quotation items
      for (const item of items) {
        const dailyRateNum = parseFloat(item.dailyRate?.toString() || "0");
        const unitPrice = dailyRateNum > 0 ? dailyRateNum : parseFloat(item.totalAmount?.toString() || "0") / Number(item.quantity || 1);
        
        const quotationItemData = insertQuotationItemSchema.parse({
          quotationId: quotation.id,
          productId: item.productId,
          quantity: Number(item.quantity || 1),
          rate: unitPrice.toFixed(2),
          totalAmount: parseFloat(item.totalAmount?.toString() || "0").toFixed(2),
          pricingType: item.pricingType || 'daily',
        });
        
        console.log("Creating quotation item:", quotationItemData);
        await storage.createQuotationItem(quotationItemData);
      }
      
      res.status(201).json(quotation);
    } catch (error: any) {
      console.error("Quotation creation error:", error);
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

  // Customer routes
  app.get("/api/customers", async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      // Strip password field before sending
      const sanitized = customers.map(({ password, ...rest }: any) => rest);
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add customer
  app.post("/api/customers", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, phone, address, city, state, pincode } = req.body || {};
      const parsed = insertUserSchema.parse({ username, email, password, firstName, lastName, phone, address, city, state, pincode, role: 'customer' });
      const existing = await storage.getUserByEmail(parsed.email);
      if (existing) return res.status(400).json({ message: 'Email already in use' });
      const created = await storage.createUser(parsed);
      const { password: _pw, ...safe } = created as any;
      res.status(201).json(safe);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete customer (cleanup dummy data path too)
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteUser(id);
      const { password, ...safe } = deleted as any;
      res.json(safe);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

  // Razorpay webhook handler
  app.post("/api/razorpay/webhook", async (req, res) => {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'];
      const webhookBody = JSON.stringify(req.body);
      
      // Verify webhook signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
        .update(webhookBody)
        .digest('hex');
      
      if (webhookSignature === expectedSignature) {
        const event = req.body;
        
        // Handle different webhook events
        switch (event.event) {
          case 'payment.captured':
            console.log('Payment captured:', event.payload.payment.entity);
            // Update payment status in database
            break;
          case 'payment.failed':
            console.log('Payment failed:', event.payload.payment.entity);
            // Handle payment failure
            break;
          default:
            console.log('Unhandled webhook event:', event.event);
        }
        
        res.json({ status: 'ok' });
      } else {
        res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
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
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, amount } = req.body;
      
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
            amount: amount ? amount.toString() : "0",
            paymentMethod: "razorpay",
            paymentGateway: "razorpay",
            transactionId: razorpay_payment_id,
            gatewayPaymentId: razorpay_payment_id,
            status: "paid",
          });
          
          // Update order status to confirmed after successful payment
          await storage.updateOrderStatus(order_id, 'confirmed');
          
          // Send real-time notification for payment status change
          realtimeService.notifyPaymentStatusChange(
            order_id,
            'unknown', // Customer ID not available in this context
            'pending',
            'completed',
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
