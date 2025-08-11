import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Clock, 
  CreditCard, 
  Bell, 
  Calendar,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Star
} from "lucide-react";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export default function CustomerHome() {
  const [, setLocation] = useLocation();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", "customer"],
    queryFn: () => api.getOrders(),
  });

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", "customer"],
    queryFn: () => api.getNotifications("customer-id"),
  });

  const activeRentals = orders?.filter(order => 
    order.status === "confirmed" || order.status === "delivered"
  ) || [];

  const recentOrders = orders?.slice(0, 5) || [];

  const totalSpent = orders?.reduce((sum, order) => 
    sum + parseFloat(order.totalAmount || "0"), 0
  ) || 0;

  const quickActions = [
    {
      icon: Package,
      label: "Browse Equipment",
      description: "Explore our rental catalog",
      action: () => setLocation("/customer/products"),
      color: "bg-blue-500"
    },
    {
      icon: ShoppingBag,
      label: "View Cart",
      description: "Check your selected items",
      action: () => setLocation("/customer/cart"),
      color: "bg-green-500"
    },
    {
      icon: Calendar,
      label: "My Orders",
      description: "Track your rental history",
      action: () => setLocation("/customer/orders"),
      color: "bg-purple-500"
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "View updates and alerts",
      action: () => setLocation("/customer/notifications"),
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
              <p className="text-gray-600 mt-1">Manage your equipment rentals and discover new gear</p>
            </div>
            <Button onClick={() => setLocation("/customer/products")}>
              <Package className="w-4 h-4 mr-2" />
              Browse Equipment
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
                  <p className="text-2xl font-bold text-gray-900">{activeRentals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
                  <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                  <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
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
          {/* Active Rentals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Active Rentals
              </CardTitle>
              {activeRentals.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/customer/orders")}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {activeRentals.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active rentals</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start browsing our equipment catalog to place your first order.
                  </p>
                  <Button className="mt-4" onClick={() => setLocation("/customer/products")}>
                    Browse Equipment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRentals.map((rental) => (
                    <div key={rental.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Order #{rental.orderNumber}</h4>
                        <Badge className={getStatusColor(rental.status)}>
                          {rental.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          ₹{parseFloat(rental.totalAmount).toLocaleString()}
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
                <ShoppingBag className="w-5 h-5 mr-2" />
                Recent Orders
              </CardTitle>
              {recentOrders.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setLocation("/customer/orders")}>
                  View All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
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
                    Your order history will appear here once you make your first rental.
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
                      <div className="text-sm text-gray-600">
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="font-medium">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
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