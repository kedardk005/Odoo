import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CustomerCart() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
    setCartItems(cart);
  }, []);

  const updateCart = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem("rentalCart", JSON.stringify(newCart));
  };

  const removeItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    updateCart(newCart);
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newCart = [...cartItems];
    const item = newCart[index];
    
    // Recalculate total based on new quantity
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let price = 0;
    if (item.rentalPeriod === "daily") {
      price = parseFloat(item.product.dailyRate) * days;
    } else if (item.rentalPeriod === "weekly") {
      price = parseFloat(item.product.weeklyRate) * Math.ceil(days / 7);
    } else {
      price = parseFloat(item.product.monthlyRate) * Math.ceil(days / 30);
    }
    
    newCart[index] = {
      ...item,
      quantity: newQuantity,
      total: price * newQuantity
    };
    
    updateCart(newCart);
  };

  const calculateGrandTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before proceeding",
        variant: "destructive"
      });
      return;
    }

    // Store cart for checkout
    localStorage.setItem("checkoutData", JSON.stringify({
      items: cartItems,
      total: calculateGrandTotal()
    }));

    setLocation("/customer/checkout");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/customer/products")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Rental Cart</h1>
              </div>
            </div>
            <Badge variant="secondary">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add some equipment to your cart to get started
            </p>
            <Button className="mt-4" onClick={() => setLocation("/customer/products")}>
              Browse Equipment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
              
              {cartItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.product.imageUrl || "/api/placeholder/200/150"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{item.product.name}</h3>
                            <p className="text-sm text-gray-600">{item.product.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Rental Period:</span>
                            <span className="ml-2 capitalize">{item.rentalPeriod}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2">
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= item.product.availableQuantity}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold">₹{item.total.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">
                              ₹{(item.total / item.quantity).toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate mr-2">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>₹{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateGrandTotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service Fee:</span>
                      <span>₹{Math.round(calculateGrandTotal() * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax (18% GST):</span>
                      <span>₹{Math.round(calculateGrandTotal() * 0.18).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{Math.round(calculateGrandTotal() * 1.23).toLocaleString()}</span>
                  </div>
                  
                  <Button onClick={handleProceedToCheckout} className="w-full" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Security deposit will be calculated during checkout
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}