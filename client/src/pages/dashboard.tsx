import { useQuery } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { ProductGrid } from "@/components/products/product-grid";
import { DeliveryScheduler } from "@/components/delivery/delivery-scheduler";
import { RealtimeDemo } from "@/components/realtime-demo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Bell, Plus, Download } from "lucide-react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: () => api.getDashboardMetrics(),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-orders"],
    queryFn: () => api.getRecentOrders(),
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", "admin-user-id"],
    queryFn: () => api.getNotifications("admin-user-id"),
  });

  const { data: deliveries } = useQuery({
    queryKey: ["/api/deliveries"],
    queryFn: () => api.getDeliveries(),
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.getOrders(),
  });

  const quickActions = [
    {
      icon: Plus,
      label: "Create New Order",
      action: "createOrder",
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      icon: Plus,
      label: "Add Customer",
      action: "addCustomer", 
      bgColor: "bg-green-100",
      iconColor: "text-success",
    },
    {
      icon: CalendarDays,
      label: "Schedule Delivery",
      action: "scheduleDelivery",
      bgColor: "bg-purple-100",
      iconColor: "text-secondary",
    },
    {
      icon: Download,
      label: "Generate Report",
      action: "generateReport",
      bgColor: "bg-amber-100",
      iconColor: "text-warning",
    },
  ];

  const upcomingDeliveries = deliveries?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="flex space-x-2">
              <Select defaultValue="7days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <MetricsCards metrics={metrics} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity & Product Catalog */}
          <div className="lg:col-span-2 space-y-8">
            <RecentOrders orders={recentOrders || []} isLoading={ordersLoading} />
          </div>

          {/* Right Column - Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 ${action.bgColor} rounded-lg mr-3`}>
                        <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.label}</span>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Notifications Center */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Button variant="ghost" size="sm">
                  Mark All Read
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`flex items-start space-x-3 p-3 border rounded-lg ${
                      notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      notification.type === 'success' ? 'bg-green-50 border-green-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex-shrink-0">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'warning' ? 'bg-warning' :
                          notification.type === 'success' ? 'bg-success' :
                          'bg-primary'
                        }`}>
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Bell className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No new notifications</p>
                  </div>
                )}
                <Button variant="ghost" className="w-full">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeliveries.length > 0 ? (
                  upcomingDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarDays className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{delivery.orderId.slice(-6)}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(delivery.scheduledDate).toLocaleDateString()} at {delivery.scheduledTime}
                          </p>
                        </div>
                      </div>
                      <Badge className={`status-${delivery.type}`}>
                        {delivery.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No scheduled deliveries</p>
                  </div>
                )}
                <Button variant="ghost" className="w-full">
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Real-time Demo Section */}
        <div className="mt-8">
          <RealtimeDemo />
        </div>

        {/* Delivery Management Section */}
        <DeliveryScheduler 
          orders={orders || []} 
          deliveries={deliveries || []}
          onScheduleDelivery={() => {}}
          onUpdateDeliveryStatus={() => {}}
        />
      </div>
    </div>
  );
}
