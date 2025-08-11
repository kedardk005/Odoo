import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Truck, User, MapPin } from "lucide-react";
import { api } from "@/lib/api";

export function DeliveryScheduler() {
  const { data: deliveries } = useQuery({
    queryKey: ["/api/deliveries"],
    queryFn: () => api.getDeliveries(),
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.getOrders(),
  });

  // Mock driver data for demonstration
  const drivers = [
    { id: "1", name: "John Smith", initials: "JS", activeRoutes: 3 },
    { id: "2", name: "Mike Johnson", initials: "MJ", activeRoutes: 2 },
    { id: "3", name: "Sarah Wilson", initials: "SW", activeRoutes: 1 },
  ];

  const todaysDeliveries = deliveries?.filter(delivery => {
    const today = new Date();
    const deliveryDate = new Date(delivery.scheduledDate);
    return deliveryDate.toDateString() === today.toDateString();
  }) || [];

  // Group deliveries by driver (mock grouping)
  const deliveriesByDriver = todaysDeliveries.reduce((acc, delivery) => {
    const driverName = delivery.driverName || "Unassigned";
    if (!acc[driverName]) {
      acc[driverName] = [];
    }
    acc[driverName].push(delivery);
    return acc;
  }, {} as Record<string, typeof todaysDeliveries>);

  const formatTime = (time: string) => {
    return time; // Assuming time is already formatted
  };

  const formatAddress = (address: string) => {
    return address.length > 30 ? address.substring(0, 30) + "..." : address;
  };

  const getDeliveryTypeColor = (type: string) => {
    switch (type) {
      case 'pickup':
        return 'bg-blue-100 text-blue-800';
      case 'return':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate weekly calendar dates
  const getWeekDates = () => {
    const today = new Date();
    const week = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const today = new Date();

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Delivery Management</CardTitle>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button>
                <CalendarDays className="w-4 h-4 mr-2" />
                Schedule Delivery
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekly Calendar View */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h3>
            <div className="grid grid-cols-7 gap-4 mb-6">
              {weekDates.map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                return (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      {dayNames[index]}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday 
                        ? "text-primary bg-blue-100 rounded-lg py-1" 
                        : "text-gray-900"
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Routes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Routes</h3>
            
            {Object.keys(deliveriesByDriver).length > 0 ? (
              Object.entries(deliveriesByDriver).map(([driverName, driverDeliveries]) => {
                const driver = drivers.find(d => d.name === driverName) || {
                  name: driverName,
                  initials: driverName.split(' ').map(n => n[0]).join(''),
                  activeRoutes: driverDeliveries.length
                };

                return (
                  <div key={driverName} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {driver.initials}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-sm text-gray-500">
                            {driverDeliveries.length} deliveries scheduled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Button variant="outline" size="sm">
                          <Truck className="w-4 h-4 mr-1" />
                          Track Route
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {driverDeliveries.map((delivery) => {
                        const order = orders?.find(o => o.id === delivery.orderId);
                        
                        return (
                          <div key={delivery.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {formatTime(delivery.scheduledTime)} - {delivery.type}
                              </p>
                              <Badge className={getDeliveryTypeColor(delivery.type)}>
                                {delivery.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              #{order?.orderNumber || delivery.orderId.slice(-6)}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {formatAddress(delivery.address)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deliveries Scheduled</h3>
                <p className="text-gray-500 mb-4">No deliveries are scheduled for today.</p>
                <Button>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Schedule First Delivery
                </Button>
              </div>
            )}
          </div>

          {/* Driver Performance Summary */}
          {drivers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {driver.initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">
                          {driver.activeRoutes} active route{driver.activeRoutes !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
