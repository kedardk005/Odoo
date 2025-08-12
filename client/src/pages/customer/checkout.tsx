import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Phone, Mail, CreditCard, Truck, Check } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  startDate: string;
  endDate: string;
  pricingType: string;
  rate: number;
  totalAmount: number;
  securityDeposit: number;
}

export default function CustomerCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
    
    // Migrate cart items to ensure all required fields exist
    const migratedCart = cart.map((item: any) => ({
      ...item,
      totalAmount: item.totalAmount || 0,
      securityDeposit: item.securityDeposit || 0,
      rate: item.rate || 0,
      quantity: item.quantity || 1,
    }));
    
    setCartItems(migratedCart);
    
    // Load user data if available
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.firstName) {
      setCustomerDetails(prev => ({
        ...prev,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
      }));
    }
    
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        let detail = "";
        try { detail = await response.text(); } catch {}
        throw new Error(`Failed to create order: ${response.status} ${detail}`);
      }
      return response.json();
    },
  });

  const createRazorpayOrderMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error("Failed to create Razorpay order");
      return response.json();
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (verificationData: any) => {
      const response = await fetch("/api/razorpay/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });
      if (!response.ok) throw new Error("Payment verification failed");
      return response.json();
    },
  });

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  };

  const calculateSecurityDeposit = () => {
    return cartItems.reduce((sum, item) => sum + ((item.securityDeposit || 0) * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateSecurityDeposit();
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const handlePayment = async () => {
    if (!customerDetails.firstName || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer details",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const customerId = userData.id || "guest-" + Date.now();

      // First create the order
      const orderData = {
        customerId,
        customerDetails,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          startDate: item.startDate,
          endDate: item.endDate,
          dailyRate: item.rate / item.quantity,
          totalAmount: item.totalAmount,
        })),
        totalAmount: calculateSubtotal(),
        securityDeposit: calculateSecurityDeposit(),
        notes: customerDetails.notes,
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Create Razorpay order
      const razorpayOrderData = {
        amount: calculateTotal(),
        currency: "INR",
        receipt: `order_${order.orderNumber}`,
        notes: {
          order_id: order.id,
          customer_email: customerDetails.email,
          customer_name: `${customerDetails.firstName} ${customerDetails.lastName}`,
        },
      };

      const razorpayOrder = await createRazorpayOrderMutation.mutateAsync(razorpayOrderData);

      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_4QjuyHe6sBhG9a",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "RentPro Equipment Rental",
        description: `Rental Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: `${customerDetails.firstName} ${customerDetails.lastName}`,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async function(response: any) {
          try {
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order.id,
              amount: calculateTotal(),
            };

            await verifyPaymentMutation.mutateAsync(verificationData);

            // Store payment details for success page
            localStorage.setItem("lastPaymentAmount", calculateTotal().toString());

            // Clear cart and redirect
            localStorage.removeItem("rentalCart");
            window.dispatchEvent(new Event("storage"));

            toast({
              title: "Payment Successful!",
              description: `Your rental order ${order.orderNumber} has been confirmed.`,
            });

            // Redirect to payment success page with details
            setLocation(`/customer/payment-success?orderId=${order.id}&paymentId=${response.razorpay_payment_id}&orderNumber=${order.orderNumber}`);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if the amount was deducted.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process. Your cart items are still saved.",
              variant: "destructive",
            });
          }
        },
        error: {
          callback: function(error: any) {
            setIsProcessing(false);
            console.error("Razorpay error:", error);
            toast({
              title: "Payment Error",
              description: "There was an error processing your payment. Please try again.",
              variant: "destructive",
            });
            setLocation("/customer/payment-failed");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader userType="customer" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some equipment to your rental cart to proceed with checkout.</p>
            <Button onClick={() => setLocation("/customer/products")}>
              Browse Equipment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Review your rental order and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Customer Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerDetails.firstName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerDetails.lastName}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery/Pickup Address</Label>
                  <Textarea
                    id="address"
                    value={customerDetails.address}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your complete address for equipment delivery or pickup location"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={customerDetails.notes}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements or notes for this rental..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-start space-x-4">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(item.startDate), "MMM d")} - {format(new Date(item.endDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p>Duration: {getDuration(item.startDate, item.endDate)}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Rate: ₹{(item.rate || 0).toFixed(2)} ({item.pricingType})</p>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Rental Amount:</span>
                            <span>₹{(item.totalAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Security Deposit:</span>
                            <span>₹{((item.securityDeposit || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Rental Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span>₹{calculateSecurityDeposit().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Delivery Information</p>
                      <p className="text-blue-700">
                        Equipment will be delivered on the start date or available for pickup.
                        Security deposit will be refunded after safe return of equipment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">Payment Method</p>
                      <p className="text-green-700">
                        Secure payment via Razorpay - supports UPI, Cards, Net Banking, and Wallets
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing || createOrderMutation.isPending || createRazorpayOrderMutation.isPending}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : `Pay ₹${calculateTotal().toFixed(2)}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}