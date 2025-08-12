import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { log } from './vite';

export interface RealtimeEvent {
  type: 'order_status_change' | 'product_availability' | 'new_order' | 'payment_status' | 'delivery_update' | 'notification';
  data: any;
  userId?: string;
  timestamp: Date;
}

export class RealtimeService {
  private io: SocketIOServer;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'development' ? "http://localhost:3000" : "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
    log('Real-time service initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      log(`Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (userId: string) => {
        this.userSockets.set(userId, socket.id);
        socket.join(`user:${userId}`);
        log(`User ${userId} authenticated on socket ${socket.id}`);
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        // Remove user from mapping
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            log(`User ${userId} disconnected from socket ${socket.id}`);
            break;
          }
        }
      });

      // Handle join room (for admin notifications)
      socket.on('join_admin', () => {
        socket.join('admin');
        log(`Socket ${socket.id} joined admin room`);
      });

      // Handle join room (for specific product updates)
      socket.on('join_product', (productId: string) => {
        socket.join(`product:${productId}`);
        log(`Socket ${socket.id} joined product room: ${productId}`);
      });

      // Handle join room (for order updates)
      socket.on('join_order', (orderId: string) => {
        socket.join(`order:${orderId}`);
        log(`Socket ${socket.id} joined order room: ${orderId}`);
      });
    });
  }

  // Send event to specific user
  public sendToUser(userId: string, event: RealtimeEvent) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('realtime_update', event);
      log(`Sent ${event.type} to user ${userId}`);
    }
  }

  // Send event to all users in admin room
  public sendToAdmins(event: RealtimeEvent) {
    this.io.to('admin').emit('realtime_update', event);
    log(`Sent ${event.type} to all admins`);
  }

  // Send event to all users following a specific product
  public sendToProductFollowers(productId: string, event: RealtimeEvent) {
    this.io.to(`product:${productId}`).emit('realtime_update', event);
    log(`Sent ${event.type} to product ${productId} followers`);
  }

  // Send event to all users following a specific order
  public sendToOrderFollowers(orderId: string, event: RealtimeEvent) {
    this.io.to(`order:${orderId}`).emit('realtime_update', event);
    log(`Sent ${event.type} to order ${orderId} followers`);
  }

  // Send event to all connected clients
  public broadcast(event: RealtimeEvent) {
    this.io.emit('realtime_update', event);
    log(`Broadcasted ${event.type} to all clients`);
  }

  // Order status change notification
  public notifyOrderStatusChange(orderId: string, userId: string, oldStatus: string, newStatus: string, orderData: any) {
    const event: RealtimeEvent = {
      type: 'order_status_change',
      data: {
        orderId,
        oldStatus,
        newStatus,
        orderData,
        message: `Order status changed from ${oldStatus} to ${newStatus}`
      },
      userId,
      timestamp: new Date()
    };

    // Send to order owner
    this.sendToUser(userId, event);
    
    // Send to admins
    this.sendToAdmins(event);
    
    // Send to order followers
    this.sendToOrderFollowers(orderId, event);
  }

  // Product availability update
  public notifyProductAvailabilityChange(productId: string, oldQuantity: number, newQuantity: number, productData: any) {
    const event: RealtimeEvent = {
      type: 'product_availability',
      data: {
        productId,
        oldQuantity,
        newQuantity,
        productData,
        message: `Product availability changed from ${oldQuantity} to ${newQuantity}`
      },
      timestamp: new Date()
    };

    // Send to product followers
    this.sendToProductFollowers(productId, event);
    
    // Send to admins
    this.sendToAdmins(event);
  }

  // New order notification
  public notifyNewOrder(orderData: any) {
    const event: RealtimeEvent = {
      type: 'new_order',
      data: {
        order: orderData,
        message: `New order received: ${orderData.orderNumber}`
      },
      timestamp: new Date()
    };

    // Send to admins
    this.sendToAdmins(event);
    
    // Send to order followers
    this.sendToOrderFollowers(orderData.id, event);
  }

  // Payment status update
  public notifyPaymentStatusChange(orderId: string, userId: string, oldStatus: string, newStatus: string, paymentData: any) {
    const event: RealtimeEvent = {
      type: 'payment_status',
      data: {
        orderId,
        oldStatus,
        newStatus,
        paymentData,
        message: `Payment status changed from ${oldStatus} to ${newStatus}`
      },
      userId,
      timestamp: new Date()
    };

    // Send to order owner
    this.sendToUser(userId, event);
    
    // Send to admins
    this.sendToAdmins(event);
    
    // Send to order followers
    this.sendToOrderFollowers(orderId, event);
  }

  // Delivery status update
  public notifyDeliveryStatusChange(orderId: string, userId: string, oldStatus: string, newStatus: string, deliveryData: any) {
    const event: RealtimeEvent = {
      type: 'delivery_update',
      data: {
        orderId,
        oldStatus,
        newStatus,
        deliveryData,
        message: `Delivery status changed from ${oldStatus} to ${newStatus}`
      },
      userId,
      timestamp: new Date()
    };

    // Send to order owner
    this.sendToUser(userId, event);
    
    // Send to admins
    this.sendToAdmins(event);
    
    // Send to order followers
    this.sendToOrderFollowers(orderId, event);
  }

  // General notification
  public sendNotification(userId: string, title: string, message: string, data?: any) {
    const event: RealtimeEvent = {
      type: 'notification',
      data: {
        title,
        message,
        data
      },
      userId,
      timestamp: new Date()
    };

    this.sendToUser(userId, event);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.io.engine.clientsCount;
  }

  // Get user socket mapping
  public getUserSocketMapping(): Map<string, string> {
    return new Map(this.userSockets);
  }
}

export let realtimeService: RealtimeService;

export function initializeRealtimeService(server: HTTPServer) {
  realtimeService = new RealtimeService(server);
  return realtimeService;
}
