import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavigationHeader } from "@/components/navigation-header";
import { BookingModal } from "@/components/booking/booking-modal";
import { ProductGrid } from "@/components/products/product-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Calendar, User, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface BookingItem {
  productId: string;
  product: any;
  quantity: number;
  dailyRate: string;
}

export default function Booking() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<BookingItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => api.createOrder(orderData),
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "Your rental order has been successfully created.",
      });
      setSelectedItems([]);
      setIsBookingModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: any) => {
    const existingItem = selectedItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setSelectedItems(items =>
        items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems(items => [
        ...items,
        {
          productId: product.id,
          product,
          quantity: 1,
          dailyRate: product.dailyRate,
        }
      ]);
    }

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your booking.`,
    });
  };

  const removeFromCart = (productId: string) => {
    setSelectedItems(items => items.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setSelectedItems(items =>
      items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const calculateTotal = (days: number = 1) => {
    return selectedItems.reduce((total, item) => {
      return total + (parseFloat(item.dailyRate) * item.quantity * days);
    }, 0);
  };

  const handleCreateOrder = (orderData: any) => {
    const items = selectedItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      dailyRate: item.dailyRate,
      totalAmount: (parseFloat(item.dailyRate) * item.quantity * orderData.days).toString(),
    }));

    createOrderMutation.mutate({
      ...orderData,
      items,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Booking</h1>
          <p className="text-gray-600">Select equipment and create a rental order for your customer.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Available Equipment</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductGrid 
                  products={products?.filter(p => p.availableQuantity > 0)}
                  onAddToCart={addToCart}
                  showAddToCart
                />
              </CardContent>
            </Card>
          </div>

          {/* Booking Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Booking Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItems.length > 0 ? (
                  <div className="space-y-4">
                    {selectedItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ${item.dailyRate}/day
                          </p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                            >
                              -
                            </button>
                            <span className="mx-3 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Subtotal (1 day):</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total Items:</span>
                        <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setIsBookingModalOpen(true)}
                    >
                      Continue to Booking
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm">
                      Select equipment to start building your rental order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Process Steps */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Booking Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-3">
                    1
                  </div>
                  <span>Select Equipment</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                    2
                  </div>
                  <span>Customer Info</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                    3
                  </div>
                  <span>Rental Dates</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                    4
                  </div>
                  <span>Confirmation</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          selectedItems={selectedItems}
          onCreateOrder={handleCreateOrder}
          isLoading={createOrderMutation.isPending}
        />
      )}
    </div>
  );
}
