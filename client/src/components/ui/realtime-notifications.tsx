import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { useRealtime, RealtimeEvent } from '@/hooks/use-realtime';
import { cn } from '@/lib/utils';

interface NotificationItem extends RealtimeEvent {
  id: string;
  read: boolean;
}

interface RealtimeNotificationsProps {
  userId?: string;
  isAdmin?: boolean;
  productIds?: string[];
  orderIds?: string[];
  className?: string;
}

export function RealtimeNotifications({ 
  userId, 
  isAdmin = false, 
  productIds = [], 
  orderIds = [],
  className 
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected, connectionError } = useRealtime({
    userId,
    isAdmin,
    productIds,
    orderIds,
    onOrderStatusChange: handleRealtimeEvent,
    onProductAvailabilityChange: handleRealtimeEvent,
    onNewOrder: handleRealtimeEvent,
    onPaymentStatusChange: handleRealtimeEvent,
    onDeliveryUpdate: handleRealtimeEvent,
    onNotification: handleRealtimeEvent,
    enableNotifications: false // We'll handle notifications manually
  });

  function handleRealtimeEvent(event: RealtimeEvent) {
    const notification: NotificationItem = {
      ...event,
      id: `${event.type}-${Date.now()}-${Math.random()}`,
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
    setUnreadCount(prev => prev + 1);
  }

  function markAsRead(id: string) {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  function removeNotification(id: string) {
    setNotifications(prev => {
      const newNotifications = prev.filter(n => n.id !== id);
      const newUnreadCount = newNotifications.filter(n => !n.read).length;
      setUnreadCount(newUnreadCount);
      return newNotifications;
    });
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'order_status_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'product_availability':
        return <Info className="h-4 w-4 text-green-500" />;
      case 'new_order':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'payment_status':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivery_update':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'notification':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  }

  function getNotificationColor(type: string) {
    switch (type) {
      case 'order_status_change':
        return 'border-blue-200 bg-blue-50';
      case 'product_availability':
        return 'border-green-200 bg-green-50';
      case 'new_order':
        return 'border-purple-200 bg-purple-50';
      case 'payment_status':
        return 'border-green-200 bg-green-50';
      case 'delivery_update':
        return 'border-orange-200 bg-orange-50';
      case 'notification':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  }

  function formatTimestamp(timestamp: Date) {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {connectionError && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </Button>

      {/* Connection Status */}
      {connectionError && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
          Connection error: {connectionError}
        </div>
      )}

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1 h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors",
                      getNotificationColor(notification.type),
                      notification.read ? "opacity-75" : ""
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.data.message || notification.data.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="p-1 h-6 w-6 ml-2"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {notification.data.data && (
                          <p className="text-xs text-gray-600 mt-1">
                            {JSON.stringify(notification.data.data)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
