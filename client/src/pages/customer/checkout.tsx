import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Clock,
  ShoppingBag,
  CheckCircle,
  ArrowLeft,
  Truck,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CustomerCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState({
    startDate: "",
    endDate: "",
    notes: "",
    deliveryAddress: "",
    phone: "",
    customerName: "John Doe",
    customerEmail: "john@example.com"
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    // Load cart items from localStorage
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      setCartItems(JSON.parse(stored));
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.dailyRate) * item.quantity * getRentalDays()), 0);
  };

  const calculateSecurityDeposit = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.securityDeposit || "0") * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateSecurityDeposit();
  };

  const createRazorpayOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/razorpay/create-order", orderData);
      return response;
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/razorpay/verify-payment", paymentData);
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your rental order has been confirmed. You'll receive an email confirmation shortly.",
      });
      localStorage.removeItem("cartItems");
      setLocation("/customer/orders");
    },
    onError: (error: any) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Payment verification failed. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = async () => {
    if (!orderDetails.startDate || !orderDetails.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including rental dates.",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: cartItems,
      customerDetails: orderDetails,
      totalAmount: calculateTotal(),
      securityDeposit: calculateSecurityDeposit()
    };

    try {
      const razorpayOrder = await createRazorpayOrderMutation.mutateAsync(orderData);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "RentPro",
        description: "Equipment Rental Payment",
        order_id: razorpayOrder.id,
        handler: function (response: any) {
          verifyPaymentMutation.mutate({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData
          });
        },
        prefill: {
          name: orderDetails.customerName,
          email: orderDetails.customerEmail,
          contact: orderDetails.phone
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment Cancelled",
              description: "Payment was cancelled. You can try again anytime.",
              variant: "destructive",
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  const getRentalDays = () => {
    if (!orderDetails.startDate || !orderDetails.endDate) return 1;
    const start = new Date(orderDetails.startDate);
    const end = new Date(orderDetails.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/customer/cart")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                <p className="text-gray-600">Complete your rental order</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rental Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Rental Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={orderDetails.startDate}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={orderDetails.endDate}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, endDate: e.target.value }))}
                      min={orderDetails.startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                {orderDetails.startDate && orderDetails.endDate && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Rental Duration: {getRentalDays()} {getRentalDays() === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    value={orderDetails.customerName}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={orderDetails.deliveryAddress}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Enter complete delivery address"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={orderDetails.notes}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special delivery instructions or notes"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items in cart</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add some equipment to your cart to continue.
                    </p>
                    <Button className="mt-4" onClick={() => setLocation("/customer/products")}>
                      Browse Equipment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {getRentalDays()} days
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{(parseFloat(item.dailyRate) * item.quantity * getRentalDays()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            {cartItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rental Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center">
                        Security Deposit
                        <Shield className="w-3 h-3 ml-1" />
                      </span>
                      <span>₹{calculateSecurityDeposit().toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Security deposit will be refunded after equipment return in good condition
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={createRazorpayOrderMutation.isPending || verifyPaymentMutation.isPending}
                  >
                    {createRazorpayOrderMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Setting up payment...
                      </>
                    ) : verifyPaymentMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Processing order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ₹{calculateTotal().toLocaleString()}
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Secure payment powered by Razorpay
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}