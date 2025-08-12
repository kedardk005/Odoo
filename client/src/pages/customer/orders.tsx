import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, DollarSign, Eye, Download } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  rentFrom: string;
  rentTo: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    dailyRate: number;
    totalDays: number;
  }>;
}

export default function CustomerOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
    queryFn: async () => {
      const response = await fetch("/api/customer/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Badge variant="outline" className="text-sm">
          {orders?.length || 0} Orders
        </Badge>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any rental orders yet. Start browsing our products!
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Rental Period</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.rentFrom), "MMM d")} - {format(new Date(order.rentTo), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Items</p>
                      <p className="text-sm text-gray-500">
                        {order.items?.length || 0} product(s)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Total Amount</p>
                      <p className="text-sm font-semibold">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Order Items:</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.productName}</span>
                          <span className="text-gray-500">
                            {item.quantity} × ₹{item.dailyRate}/day × {item.totalDays} days
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}