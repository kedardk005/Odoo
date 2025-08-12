import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function TestCart() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
      setCartItems(cart);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    }
  };

  const addTestItem = () => {
    const testItem = {
      id: "test-" + Date.now(),
      name: "Test Product",
      imageUrl: "",
      quantity: 1,
      startDate: "2025-01-15",
      endDate: "2025-01-17",
      pricingType: "daily",
      rate: 100,
      totalAmount: 300,
      securityDeposit: 200
    };

    const existingCart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
    existingCart.push(testItem);
    localStorage.setItem("rentalCart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("storage"));
    
    loadCart();
    toast({
      title: "Test Item Added",
      description: "Test item has been added to cart"
    });
  };

  const clearCart = () => {
    localStorage.setItem("rentalCart", "[]");
    window.dispatchEvent(new Event("storage"));
    loadCart();
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cart Testing Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={addTestItem}>Add Test Item</Button>
              <Button onClick={clearCart} variant="outline">Clear Cart</Button>
              <Button onClick={loadCart} variant="outline">Reload Cart</Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Cart Items ({cartItems.length})</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(cartItems, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">LocalStorage Data</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {localStorage.getItem("rentalCart") || "[]"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}