import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from './use-toast';

export interface RealtimeEvent {
  type: 'order_status_change' | 'product_availability' | 'new_order' | 'payment_status' | 'delivery_update' | 'notification';
  data: any;
  userId?: string;
  timestamp: Date;
}

export interface UseRealtimeOptions {
  userId?: string;
  isAdmin?: boolean;
  productIds?: string[];
  orderIds?: string[];
  onOrderStatusChange?: (event: RealtimeEvent) => void;
  onProductAvailabilityChange?: (event: RealtimeEvent) => void;
  onNewOrder?: (event: RealtimeEvent) => void;
  onPaymentStatusChange?: (event: RealtimeEvent) => void;
  onDeliveryUpdate?: (event: RealtimeEvent) => void;
  onNotification?: (event: RealtimeEvent) => void;
  enableNotifications?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    userId,
    isAdmin = false,
    productIds = [],
    orderIds = [],
    onOrderStatusChange,
    onProductAvailabilityChange,
    onNewOrder,
    onPaymentStatusChange,
    onDeliveryUpdate,
    onNotification,
    enableNotifications = true
  } = options;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Real-time connection established');

      // Authenticate user if userId is provided
      if (userId) {
        socket.emit('authenticate', userId);
      }

      // Join admin room if user is admin
      if (isAdmin) {
        socket.emit('join_admin');
      }

      // Join product rooms
      productIds.forEach(productId => {
        socket.emit('join_product', productId);
      });

      // Join order rooms
      orderIds.forEach(orderId => {
        socket.emit('join_order', orderId);
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Real-time connection disconnected');
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      console.error('Real-time connection error:', error);
    });

    // Real-time update events
    socket.on('realtime_update', (event: RealtimeEvent) => {
      console.log('Real-time update received:', event);

      // Handle different event types
      switch (event.type) {
        case 'order_status_change':
          if (onOrderStatusChange) {
            onOrderStatusChange(event);
          }
          if (enableNotifications) {
            toast({
              title: 'Order Status Updated',
              description: event.data.message,
              duration: 5000
            });
          }
          break;

        case 'product_availability':
          if (onProductAvailabilityChange) {
            onProductAvailabilityChange(event);
          }
          if (enableNotifications) {
            toast({
              title: 'Product Availability Changed',
              description: event.data.message,
              duration: 5000
            });
          }
          break;

        case 'new_order':
          if (onNewOrder) {
            onNewOrder(event);
          }
          if (enableNotifications && isAdmin) {
            toast({
              title: 'New Order Received',
              description: event.data.message,
              duration: 5000
            });
          }
          break;

        case 'payment_status':
          if (onPaymentStatusChange) {
            onPaymentStatusChange(event);
          }
          if (enableNotifications) {
            toast({
              title: 'Payment Status Updated',
              description: event.data.message,
              duration: 5000
            });
          }
          break;

        case 'delivery_update':
          if (onDeliveryUpdate) {
            onDeliveryUpdate(event);
          }
          if (enableNotifications) {
            toast({
              title: 'Delivery Status Updated',
              description: event.data.message,
              duration: 5000
            });
          }
          break;

        case 'notification':
          if (onNotification) {
            onNotification(event);
          }
          if (enableNotifications) {
            toast({
              title: event.data.title,
              description: event.data.message,
              duration: 5000
            });
          }
          break;
      }
    });

    return socket;
  }, [userId, isAdmin, productIds, orderIds, onOrderStatusChange, onProductAvailabilityChange, onNewOrder, onPaymentStatusChange, onDeliveryUpdate, onNotification, enableNotifications, toast]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Join product room
  const joinProduct = useCallback((productId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_product', productId);
    }
  }, []);

  // Leave product room
  const leaveProduct = useCallback((productId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.leave(`product:${productId}`);
    }
  }, []);

  // Join order room
  const joinOrder = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_order', orderId);
    }
  }, []);

  // Leave order room
  const leaveOrder = useCallback((orderId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.leave(`order:${orderId}`);
    }
  }, []);

  // Send custom event
  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Effect to establish connection
  useEffect(() => {
    const socket = connect();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [connect]);

  // Effect to handle product IDs changes
  useEffect(() => {
    if (socketRef.current?.connected) {
      // Leave all current product rooms
      productIds.forEach(productId => {
        socketRef.current?.emit('join_product', productId);
      });
    }
  }, [productIds]);

  // Effect to handle order IDs changes
  useEffect(() => {
    if (socketRef.current?.connected) {
      // Leave all current order rooms
      orderIds.forEach(orderId => {
        socketRef.current?.emit('join_order', orderId);
      });
    }
  }, [orderIds]);

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinProduct,
    leaveProduct,
    joinOrder,
    leaveOrder,
    emit
  };
}
