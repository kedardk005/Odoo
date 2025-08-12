import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RazorpayPayment } from "@/components/payments/razorpay-payment";

export default function TestRazorpay() {
  const [amount, setAmount] = useState(100);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const handlePaymentSuccess = (paymentId: string) => {
    toast({
      title: "Payment Successful!",
      description: `Payment ID: ${paymentId}`,
    });
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
    setShowPayment(false);
  };

  const testDirectRazorpay = async () => {
    try {
      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        // Create Razorpay order
        const response = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            currency: "INR",
            receipt: `test_${Date.now()}`,
            notes: {
              test: "true",
              customer_email: "test@example.com",
            },
          }),
        });

        const razorpayOrder = await response.json();

        // Configure Razorpay options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_4QjuyHe6sBhG9a",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "RentPro - Test Payment",
          description: "Test payment integration",
          order_id: razorpayOrder.id,
          prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3B82F6",
          },
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await fetch("/api/razorpay/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amount,
                }),
              });

              const verifyResult = await verifyResponse.json();

              if (verifyResult.success) {
                toast({
                  title: "Payment Successful!",
                  description: `Payment ID: ${response.razorpay_payment_id}`,
                });
              } else {
                throw new Error(verifyResult.message || "Payment verification failed");
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Payment verification failed";
              toast({
                title: "Payment Verification Failed",
                description: errorMessage,
                variant: "destructive",
              });
            }
          },
          modal: {
            ondismiss: () => {
              toast({
                title: "Payment Cancelled",
                description: "You cancelled the payment process.",
                variant: "destructive",
              });
            },
          },
        };

        // Open Razorpay checkout
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Razorpay Integration Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={testDirectRazorpay}
                  className="w-full"
                >
                  Test Direct Razorpay Integration
                </Button>
                
                <Button 
                  onClick={() => setShowPayment(true)}
                  variant="outline"
                  className="w-full"
                >
                  Test Razorpay Component
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Component */}
          <div>
            {showPayment && (
              <RazorpayPayment
                amount={amount}
                orderNumber={`TEST-${Date.now()}`}
                customerEmail="test@example.com"
                customerPhone="9999999999"
                customerName="Test User"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </div>

        {/* Test Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Razorpay Test Credentials:</h4>
                <p className="text-sm text-gray-600">Key ID: rzp_test_4QjuyHe6sBhG9a</p>
                <p className="text-sm text-gray-600">Environment: Test Mode</p>
              </div>

              <div>
                <h4 className="font-semibold">Test Card Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Card Number: 4111 1111 1111 1111</p>
                  <p>Expiry: Any future date</p>
                  <p>CVV: Any 3 digits</p>
                  <p>Name: Any name</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold">Test UPI ID:</h4>
                <p className="text-sm text-gray-600">success@razorpay (for successful payments)</p>
                <p className="text-sm text-gray-600">failure@razorpay (for failed payments)</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a test environment. No real money will be charged.
                  All payments are simulated for testing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}