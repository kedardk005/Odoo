import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationHeader from "@/components/NavigationHeader";
import { 
  Package, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Bell,
  Calendar,
  ShoppingBag,
  Settings,
  BarChart3,
  MapPin,
  Clock,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export default function AdminHome() {
  const [, setLocation] = useLocation();

  // Mock current user - replace with real authentication
  const currentUser = {
    firstName: "Admin",
    lastName: "User", 
    email: "admin@rentpro.com",
    profileImageUrl: undefined
  };

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: () => api.getDashboardMetrics(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: () => api.getOrders(),
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", "admin"],
    queryFn: () => api.getNotifications("admin-id"),
  });

  const pendingOrders = orders?.filter(order => order.status === "pending") || [];
  const recentOrders = orders?.slice(0, 5) || [];

  const quickActions = [
    {
      icon: Package,
      label: "Manage Products",
      description: "Add or edit rental items",
      action: () => setLocation("/admin/products"),
      color: "bg-blue-500"
    },
    {
      icon: ShoppingBag,
      label: "View Orders",
      description: "Process customer orders",
      action: () => setLocation("/admin/orders"),
      color: "bg-green-500"
    },
    {
      icon: Users,
      label: "Manage Customers",
      description: "View customer accounts",
      action: () => setLocation("/admin/customers"),
      color: "bg-purple-500"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      description: "View business insights",
      action: () => setLocation("/admin/dashboard"),
      color: "bg-orange-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "returned": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="admin" currentUser={currentUser} />
      
      {/* Welcome Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser.firstName}! Manage your rental business operations</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setLocation("/admin/products")}>
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
              <Button onClick={() => setLocation("/admin/orders")}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{metricsLoading ? "..." : metrics?.totalRevenue?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs text-green-600">
                    +12% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {ordersLoading ? "..." : orders?.length || 0}
                  </p>
                  <p className="text-xs text-green-600">
                    +18% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? "..." : metrics?.activeRentals || 0}
                  </p>
                  <p className="text-xs text-green-600">
                    +15% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? "..." : "247"}
                  </p>
                  <p className="text-xs text-green-600">
                    +22% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                Pending Orders
                {pendingOrders.length > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                    {pendingOrders.length}
                  </Badge>
                )}
              </CardTitle>
              {pendingOrders.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin/orders")}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending orders</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All orders are up to date. Great job!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Order #{order.orderNumber}</h4>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {order.customer?.firstName} {order.customer?.lastName}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          ₹{parseFloat(order.totalAmount).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Orders
              </CardTitle>
              {recentOrders.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin/orders")}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Orders will appear here once customers start renting.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">#{order.orderNumber}</h4>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {order.customer?.firstName} {order.customer?.lastName}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          ₹{parseFloat(order.totalAmount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {notifications && notifications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}