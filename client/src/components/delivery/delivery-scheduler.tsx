import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Truck, Calendar as CalendarIcon, Clock, MapPin, User, Phone } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Delivery, OrderWithDetails } from "@shared/schema";

interface DeliverySchedulerProps {
  orders: OrderWithDetails[];
  deliveries: Delivery[];
  onScheduleDelivery: (deliveryData: any) => void;
  onUpdateDeliveryStatus: (id: string, status: string) => void;
}

export function DeliveryScheduler({ 
  orders, 
  deliveries, 
  onScheduleDelivery, 
  onUpdateDeliveryStatus 
}: DeliverySchedulerProps) {
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "return">("pickup");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [notes, setNotes] = useState("");

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>;
      case "delivered":
        return <Badge variant="success" className="bg-green-100 text-green-800">Delivered</Badge>;
      case "completed":
        return <Badge variant="success" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleScheduleDelivery = () => {
    if (!selectedOrder || !scheduledDate || !scheduledTime) return;

    const selectedOrderData = orders.find(order => order.id === selectedOrder);
    if (!selectedOrderData) return;

    const deliveryData = {
      orderId: selectedOrder,
      type: deliveryType,
      address: selectedOrderData.customer.address || "Address not provided",
      scheduledDate: scheduledDate.toISOString(),
      scheduledTime,
      driverName: driverName || null,
      driverPhone: driverPhone || null,
      notes: notes || null,
      status: "scheduled",
    };

    onScheduleDelivery(deliveryData);

    // Reset form
    setSelectedOrder("");
    setScheduledDate(undefined);
    setScheduledTime("");
    setDriverName("");
    setDriverPhone("");
    setNotes("");
  };

  const pendingOrders = orders?.filter(order => 
    order.status === "confirmed" || order.status === "delivered"
  ) || [];

  return (
    <div className="space-y-6">
      {/* Schedule New Delivery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Schedule Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent>
                  {pendingOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNumber} - {order.customer.firstName} {order.customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Delivery Type</Label>
              <Select value={deliveryType} onValueChange={(value: "pickup" | "return") => setDeliveryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup/Delivery</SelectItem>
                  <SelectItem value="return">Return/Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Scheduled Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Driver Name</Label>
              <Input
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </div>

            <div>
              <Label>Driver Phone</Label>
              <Input
                placeholder="Enter driver phone"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional delivery instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleScheduleDelivery}
            disabled={!selectedOrder || !scheduledDate || !scheduledTime}
            className="w-full md:w-auto"
          >
            Schedule Delivery
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries && deliveries.length > 0 ? (
            <div className="space-y-4">
              {deliveries.map((delivery) => {
                const order = orders.find(o => o.id === delivery.orderId);
                return (
                  <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={delivery.type === "pickup" ? "default" : "secondary"}>
                            {delivery.type === "pickup" ? "Pickup" : "Return"}
                          </Badge>
                          {getDeliveryStatusBadge(delivery.status)}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {order ? `${order.customer.firstName} ${order.customer.lastName}` : "Unknown Customer"}
                            </span>
                            <span className="text-gray-500">
                              ({order?.orderNumber || "Unknown Order"})
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span>
                              {format(new Date(delivery.scheduledDate), "PPP")} at {delivery.scheduledTime}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{delivery.address}</span>
                          </div>
                          
                          {delivery.driverName && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Truck className="w-4 h-4 text-gray-400" />
                              <span>{delivery.driverName}</span>
                              {delivery.driverPhone && (
                                <>
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{delivery.driverPhone}</span>
                                </>
                              )}
                            </div>
                          )}
                          
                          {delivery.notes && (
                            <div className="text-sm text-gray-600 mt-2">
                              <strong>Notes:</strong> {delivery.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {delivery.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => onUpdateDeliveryStatus(delivery.id, "in_transit")}
                          >
                            Start Delivery
                          </Button>
                        )}
                        {delivery.status === "in_transit" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateDeliveryStatus(delivery.id, "delivered")}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        {delivery.status === "delivered" && delivery.type === "pickup" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateDeliveryStatus(delivery.id, "completed")}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No deliveries scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}