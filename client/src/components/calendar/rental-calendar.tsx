import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Clock, Package, User, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface RentalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    orderId: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'returned' | 'overdue' | 'cancelled';
    products: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
    totalAmount: number;
    deliveryAddress?: string;
    pickupAddress?: string;
    notes?: string;
  };
}

interface RentalCalendarProps {
  productId?: string;
  customerId?: string;
  onEventClick?: (event: RentalEvent) => void;
  onSlotSelect?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
}

export function RentalCalendar({ 
  productId, 
  customerId, 
  onEventClick,
  onSlotSelect 
}: RentalCalendarProps) {
  const [currentView, setCurrentView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<RentalEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  // Fetch orders for calendar
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders', { productId, customerId }],
  });

  // Transform orders into calendar events
  const events: RentalEvent[] = useMemo(() => {
    if (!orders) return [];

    return orders.map((order: any) => ({
      id: order.id,
      title: `${order.orderNumber} - ${order.customer?.firstName} ${order.customer?.lastName}`,
      start: new Date(order.startDate),
      end: new Date(order.endDate),
      resource: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
        status: order.status,
        products: order.items || [],
        totalAmount: parseFloat(order.totalAmount),
        deliveryAddress: order.deliveryAddress,
        pickupAddress: order.pickupAddress,
        notes: order.notes,
      }
    }));
  }, [orders]);

  // Event style based on status
  const eventStyleGetter = (event: RentalEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (event.resource.status) {
      case 'pending':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case 'confirmed':
        backgroundColor = '#3b82f6';
        borderColor = '#2563eb';
        break;
      case 'delivered':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'returned':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
      case 'overdue':
        backgroundColor = '#ef4444';
        borderColor = '#dc2626';
        break;
      case 'cancelled':
        backgroundColor = '#9ca3af';
        borderColor = '#6b7280';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  };

  const handleEventSelect = (event: RentalEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
    onEventClick?.(event);
  };

  const handleSlotSelect = (slotInfo: any) => {
    onSlotSelect?.(slotInfo);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'returned': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rental Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Rental Calendar
            </CardTitle>
            
            <div className="flex gap-2">
              <Select 
                value={currentView} 
                onValueChange={(value: any) => setCurrentView(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Views.MONTH}>Month</SelectItem>
                  <SelectItem value={Views.WEEK}>Week</SelectItem>
                  <SelectItem value={Views.DAY}>Day</SelectItem>
                  <SelectItem value={Views.AGENDA}>Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-96 sm:h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectEvent={handleEventSelect}
              onSelectSlot={handleSlotSelect}
              selectable
              eventPropGetter={eventStyleGetter}
              className="rental-calendar"
              popup
              tooltipAccessor={(event: RentalEvent) => 
                `${event.resource.orderNumber} - ${event.resource.customerName}`
              }
            />
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-xs">Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs">Confirmed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Delivered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-xs">Returned</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rental Details</DialogTitle>
            <DialogDescription>
              View detailed information about this rental order.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.resource.orderNumber}</h3>
                  <p className="text-muted-foreground">
                    {moment(selectedEvent.start).format('MMM DD, YYYY')} - 
                    {moment(selectedEvent.end).format('MMM DD, YYYY')}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedEvent.resource.status)}>
                  {selectedEvent.resource.status.charAt(0).toUpperCase() + selectedEvent.resource.status.slice(1)}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{selectedEvent.resource.customerName}</p>
                  <p className="text-sm text-muted-foreground">Customer ID: {selectedEvent.resource.customerId}</p>
                </div>
              </div>

              {/* Products */}
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-2">Products Rented</p>
                  <div className="space-y-1">
                    {selectedEvent.resource.products.map((product) => (
                      <div key={product.id} className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                        <span>{product.name}</span>
                        <span className="font-medium">Qty: {product.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Addresses */}
              {(selectedEvent.resource.deliveryAddress || selectedEvent.resource.pickupAddress) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    {selectedEvent.resource.deliveryAddress && (
                      <div>
                        <p className="font-medium text-sm">Delivery Address</p>
                        <p className="text-sm text-muted-foreground">{selectedEvent.resource.deliveryAddress}</p>
                      </div>
                    )}
                    {selectedEvent.resource.pickupAddress && (
                      <div>
                        <p className="font-medium text-sm">Pickup Address</p>
                        <p className="text-sm text-muted-foreground">{selectedEvent.resource.pickupAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total Amount</span>
                <span className="text-lg font-bold">₹{selectedEvent.resource.totalAmount.toFixed(2)}</span>
              </div>

              {/* Notes */}
              {selectedEvent.resource.notes && (
                <div>
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedEvent.resource.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Calendar styles
const calendarStyles = `
.rental-calendar {
  font-family: inherit;
}

.rental-calendar .rbc-month-view .rbc-date-cell {
  padding: 8px;
}

.rental-calendar .rbc-event {
  padding: 2px 5px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  font-size: 0.85em;
}

.rental-calendar .rbc-event:hover {
  opacity: 0.8;
}

.rental-calendar .rbc-toolbar button {
  color: inherit;
  font-size: inherit;
  padding: 0.375rem 0.75rem;
}

.rental-calendar .rbc-toolbar button.rbc-active {
  background-color: hsl(var(--primary));
  border-color: hsl(var(--primary));
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = calendarStyles;
  document.head.appendChild(styleSheet);
}