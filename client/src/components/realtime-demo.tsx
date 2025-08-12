import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtime, RealtimeEvent } from '@/hooks/use-realtime';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Bell,
  Package,
  ShoppingCart,
  CreditCard,
  Truck,
  Clock
} from 'lucide-react';

export function RealtimeDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const { toast } = useToast();

  const { 
    isConnected, 
    connectionError, 
    joinProduct, 
    joinOrder,
    emit 
  } = useRealtime({
    userId: 'demo-user',
    isAdmin: true,
    productIds: ['demo-product-1', 'demo-product-2'],
    orderIds: ['demo-order-1'],
    onOrderStatusChange: handleRealtimeEvent,
    onProductAvailabilityChange: handleRealtimeEvent,
    onNewOrder: handleRealtimeEvent,
    onPaymentStatusChange: handleRealtimeEvent,
    onDeliveryUpdate: handleRealtimeEvent,
    onNotification: handleRealtimeEvent,
    enableNotifications: true
  });

  function handleRealtimeEvent(event: RealtimeEvent) {
    setEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  }

  function startDemo() {
    setIsRunning(true);
    toast({
      title: 'Demo Started',
      description: 'Real-time events will now be simulated',
    });
  }

  function stopDemo() {
    setIsRunning(false);
    toast({
      title: 'Demo Stopped',
      description: 'Real-time events simulation stopped',
    });
  }

  function resetDemo() {
    setEvents([]);
    toast({
      title: 'Demo Reset',
      description: 'All events cleared',
    });
  }

  function simulateEvent(eventType: string) {
    const eventData = {
      order_status_change: {
        orderId: 'demo-order-1',
        oldStatus: 'pending',
        newStatus: 'confirmed',
        orderData: { orderNumber: 'ORD-2024-001', totalAmount: 5000 }
      },
      product_availability: {
        productId: 'demo-product-1',
        oldQuantity: 5,
        newQuantity: 3,
        productData: { name: 'Professional Camera Kit', price: 1000 }
      },
      new_order: {
        order: { orderNumber: 'ORD-2024-002', totalAmount: 3000, customerName: 'John Doe' }
      },
      payment_status: {
        orderId: 'demo-order-1',
        oldStatus: 'pending',
        newStatus: 'paid',
        paymentData: { amount: 5000, method: 'credit_card' }
      },
      delivery_update: {
        orderId: 'demo-order-1',
        oldStatus: 'pending',
        newStatus: 'in_transit',
        deliveryData: { trackingNumber: 'TRK123456', estimatedDelivery: '2024-08-12' }
      }
    };

    const event: RealtimeEvent = {
      type: eventType as any,
      data: eventData[eventType as keyof typeof eventData],
      timestamp: new Date()
    };

    // Emit the event to trigger real-time updates
    emit('simulate_event', event);
    
    toast({
      title: 'Event Simulated',
      description: `${eventType.replace(/_/g, ' ')} event triggered`,
    });
  }

  function getEventIcon(type: string) {
    switch (type) {
      case 'order_status_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'product_availability':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'new_order':
        return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      case 'payment_status':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'delivery_update':
        return <Truck className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  }

  function getEventColor(type: string) {
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
      default:
        return 'border-gray-200 bg-gray-50';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-time Demo</h1>
        <p className="text-gray-600">
          Experience live updates and real-time notifications in action
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-3 w-3 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-sm">
                {isConnected ? 'Connected to real-time service' : 'Disconnected'}
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
          {connectionError && (
            <p className="text-sm text-red-600 mt-2">Error: {connectionError}</p>
          )}
        </CardContent>
      </Card>

      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Controls</CardTitle>
          <CardDescription>
            Control the real-time event simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={startDemo}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Demo
            </Button>
            <Button
              onClick={stopDemo}
              disabled={!isRunning}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Demo
            </Button>
            <Button
              onClick={resetDemo}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              onClick={() => simulateEvent('order_status_change')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Clock className="h-4 w-4" />
              <span className="text-xs">Order Status</span>
            </Button>
            <Button
              onClick={() => simulateEvent('product_availability')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Package className="h-4 w-4" />
              <span className="text-xs">Product Availability</span>
            </Button>
            <Button
              onClick={() => simulateEvent('new_order')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">New Order</span>
            </Button>
            <Button
              onClick={() => simulateEvent('payment_status')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs">Payment Status</span>
            </Button>
            <Button
              onClick={() => simulateEvent('delivery_update')}
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Truck className="h-4 w-4" />
              <span className="text-xs">Delivery Update</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Events */}
      <Card>
        <CardHeader>
          <CardTitle>Live Events</CardTitle>
          <CardDescription>
            Real-time events will appear here as they occur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No events yet. Start the demo to see real-time updates!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 border rounded-lg transition-all",
                    getEventColor(event.type)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getEventIcon(event.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {event.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.data.message || JSON.stringify(event.data)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
