import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Calendar,
  Star,
  Plus,
  Eye,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import NavigationHeader from "@/components/NavigationHeader";

export default function CustomerHome() {
  const [, setLocation] = useLocation();

  // Get user ID from localStorage/sessionStorage
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  // Fetch user profile data
  const { data: userProfile } = useQuery({
    queryKey: ["/api/profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/profile?userId=${userId}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userId,
  });

  // Use profile data or fallback to default
  const customer = userProfile ? {
    firstName: userProfile.firstName || "User",
    lastName: userProfile.lastName || "",
    email: userProfile.email || ""
  } : {
    firstName: "User",
    lastName: "",
    email: ""
  };

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["/api/customer/orders", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/customer/orders?userId=${userId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!userId,
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const quickActions = [
    {
      title: "Browse Equipment",
      description: "Explore our rental catalog",
      icon: Package,
      action: () => setLocation("/customer/products"),
      color: "bg-blue-500"
    },
    {
      title: "Request Quote",
      description: "Get custom pricing",
      icon: FileText,
      action: () => setLocation("/customer/quotation"),
      color: "bg-green-500"
    },
    {
      title: "View Cart",
      description: "Review selected items",
      icon: ShoppingCart,
      action: () => setLocation("/customer/cart"),
      color: "bg-purple-500"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'delivered':
        return 'default';
      case 'returned':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {customer.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">Manage your equipment rentals and explore new products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={action.action}
                    >
                      <div className={`p-3 rounded-full ${action.color} text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {order.items?.length || 0} item(s) • ₹{order.totalAmount}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.startDate && format(new Date(order.startDate), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No rentals yet</h3>
                    <p className="text-gray-600 mb-4">Start by exploring our equipment catalog</p>
                    <Button onClick={() => setLocation("/customer/products")}>
                      Browse Equipment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Products */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                {featuredProducts && featuredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredProducts.slice(0, 4).map((product: any) => (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => setLocation(`/customer/products/${product.id}`)}>
                        <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">₹{product.dailyRate}/day</p>
                        <Badge variant={product.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Loading featured products...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Rentals</span>
                  <span className="font-semibold">
                    {recentOrders?.filter((order: any) => order.status === 'delivered').length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold">{recentOrders?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold">Jan 2025</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Valued Customer</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Rentals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Upcoming</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders?.filter((order: any) => 
                  order.status === 'confirmed' || order.status === 'pending'
                ).length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders
                      .filter((order: any) => order.status === 'confirmed' || order.status === 'pending')
                      .slice(0, 3)
                      .map((order: any) => (
                        <div key={order.id} className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-gray-600">
                            {order.startDate && format(new Date(order.startDate), "MMM d")}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming rentals</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Equipment Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Leave Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}