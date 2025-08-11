import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { NavigationHeader } from "@/components/navigation-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RazorpayPayment } from "@/components/payments/razorpay-payment";
import { ArrowLeft, Package, Calendar, MapPin, User } from "lucide-react";

interface CheckoutData {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  securityDeposit: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productName: string;
    quantity: number;
    dailyRate: number;
    duration: number;
  }>;
  startDate: string;
  endDate: string;
  deliveryAddress: string;
}

export default function Checkout() {
  const [location, navigate] = useLocation();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // In a real app, this would come from navigation state or API
    // For demo purposes, we'll create sample data
    const sampleData: CheckoutData = {
      orderId: "sample-order-id",
      orderNumber: "ORD-2024-001",
      totalAmount: 5000,
      securityDeposit: 1000,
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+91-9876543210",
      items: [
        {
          productName: "Professional Camera Kit",
          quantity: 1,
          dailyRate: 2000,
          duration: 2,
        },
        {
          productName: "Tripod Stand",
          quantity: 1,
          dailyRate: 500,
          duration: 2,
        },
      ],
      startDate: "2024-08-15",
      endDate: "2024-08-17",
      deliveryAddress: "123 Main Street, Mumbai, Maharashtra 400001",
    };
    setCheckoutData(sampleData);
  }, []);

  const handlePaymentSuccess = (paymentId: string) => {
    // Handle successful payment
    console.log("Payment successful:", paymentId);
    navigate("/orders");
  };

  const handlePaymentError = (error: string) => {
    // Handle payment error
    console.error("Payment error:", error);
    setShowPayment(false);
  };

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/booking")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Review your order and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {checkoutData.customerName}</p>
                  <p><strong>Email:</strong> {checkoutData.customerEmail}</p>
                  <p><strong>Phone:</strong> {checkoutData.customerPhone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Rental Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Rental Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkoutData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.dailyRate}/day × {item.duration} days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(item.quantity * item.dailyRate * item.duration).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rental Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Rental Period
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(checkoutData.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{new Date(checkoutData.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{checkoutData.deliveryAddress}</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Rental Amount</span>
                  <span>₹{checkoutData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span>₹{checkoutData.securityDeposit.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{(checkoutData.totalAmount + checkoutData.securityDeposit).toLocaleString()}</span>
                </div>
                
                {!showPayment ? (
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="w-full"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>
                ) : (
                  <div className="mt-6">
                    <RazorpayPayment
                      amount={checkoutData.totalAmount + checkoutData.securityDeposit}
                      orderId={checkoutData.orderId}
                      orderNumber={checkoutData.orderNumber}
                      customerEmail={checkoutData.customerEmail}
                      customerPhone={checkoutData.customerPhone}
                      customerName={checkoutData.customerName}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}