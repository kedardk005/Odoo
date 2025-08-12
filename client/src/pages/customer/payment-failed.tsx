import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import NavigationHeader from "@/components/NavigationHeader";

export default function PaymentFailed() {
  const [, setLocation] = useLocation();

  const handleRetryPayment = () => {
    setLocation("/customer/checkout");
  };

  const handleGoToCart = () => {
    setLocation("/customer/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">We couldn't process your payment. Please try again or contact support.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>What went wrong?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Common reasons for payment failure:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Insufficient balance in your account</li>
                  <li>Network connectivity issues</li>
                  <li>Incorrect payment details</li>
                  <li>Bank server temporarily unavailable</li>
                  <li>Payment cancelled by user</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What can you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Check your payment details</p>
                  <p className="text-sm text-gray-600">Ensure your card details, UPI ID, or bank account information is correct.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Try a different payment method</p>
                  <p className="text-sm text-gray-600">Use UPI, different card, or net banking as an alternative.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Contact your bank</p>
                  <p className="text-sm text-gray-600">If the issue persists, check with your bank for any restrictions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleRetryPayment}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Payment
          </Button>
          
          <Button 
            onClick={handleGoToCart}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Your cart items are still saved. You can try payment again anytime.
          </p>
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@rentpro.com" className="text-blue-600 hover:underline">
              support@rentpro.com
            </a>{" "}
            or call{" "}
            <a href="tel:+911234567890" className="text-blue-600 hover:underline">
              +91 12345 67890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}