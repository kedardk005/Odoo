import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RazorpayPaymentProps {
  amount: number;
  orderId?: string;
  orderNumber?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment({
  amount,
  orderId,
  orderNumber,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Create Razorpay order
      const orderResponse = await apiRequest("POST", "/api/razorpay/create-order", {
        amount,
        currency: "INR",
        receipt: orderNumber || `receipt_${Date.now()}`,
        notes: {
          order_id: orderId || "",
          customer_email: customerEmail || "",
        },
      });

      const razorpayOrder = await orderResponse.json();

      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "RentPro - Equipment Rental",
        description: orderNumber ? `Payment for Order ${orderNumber}` : "Equipment Rental Payment",
        order_id: razorpayOrder.id,
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verifyResponse = await apiRequest("POST", "/api/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              toast({
                title: "Payment Successful",
                description: "Your payment has been processed successfully.",
              });
              onSuccess?.(response.razorpay_payment_id);
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
            onError?.(errorMessage);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive",
            });
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize payment";
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold">₹{amount.toLocaleString()}</p>
          {orderNumber && (
            <p className="text-sm text-gray-600">Order: {orderNumber}</p>
          )}
        </div>
        
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Processing..." : "Pay with Razorpay"}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          Secure payment powered by Razorpay
        </div>
      </CardContent>
    </Card>
  );
}