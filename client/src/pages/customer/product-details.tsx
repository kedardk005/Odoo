import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, differenceInHours, addDays } from "date-fns";
import { CalendarIcon, ShoppingCart, Star, Info } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";

export default function ProductDetails() {
  const [match, params] = useRoute("/customer/products/:id");
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState(1);
  const [pricingType, setPricingType] = useState("daily");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", params?.id],
    queryFn: () => api.getProduct(params?.id!),
    enabled: !!params?.id,
  });

  const calculatePrice = () => {
    if (!product || !startDate || !endDate) return 0;
    
    const hours = differenceInHours(endDate, startDate);
    const days = Math.ceil(hours / 24);
    
    let rate = 0;
    switch (pricingType) {
      case "hourly":
        rate = parseFloat(product.hourlyRate || "0") * hours;
        break;
      case "daily":
        rate = parseFloat(product.dailyRate) * days;
        break;
      case "weekly":
        rate = parseFloat(product.weeklyRate || "0") * Math.ceil(days / 7);
        break;
      case "monthly":
        rate = parseFloat(product.monthlyRate || "0") * Math.ceil(days / 30);
        break;
    }
    
    return rate * quantity;
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return "";
    
    const hours = differenceInHours(endDate, startDate);
    const days = Math.ceil(hours / 24);
    
    if (hours < 24) return `${hours} hours`;
    if (days === 1) return "1 day";
    return `${days} days`;
  };

  const handleAddToCart = () => {
    if (!product || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select rental dates and quantity",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      quantity,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pricingType,
      rate: calculatePrice() / quantity,
      totalAmount: calculatePrice(),
      securityDeposit: parseFloat(product.securityDeposit),
    };

    const existingCart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
    const updatedCart = [...existingCart, cartItem];
    localStorage.setItem("rentalCart", JSON.stringify(updatedCart));
    
    // Trigger storage event for cart count update
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your rental cart`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader userType="customer" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader userType="customer" />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        </div>
      </div>
    );
  }

  const totalPrice = calculatePrice();
  const duration = calculateDuration();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={product.status === "available" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  {product.availableQuantity} available
                </span>
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Rental Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {product.hourlyRate && (
                  <div className="flex justify-between">
                    <span>Hourly:</span>
                    <span className="font-semibold">₹{product.hourlyRate}/hour</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Daily:</span>
                  <span className="font-semibold">₹{product.dailyRate}/day</span>
                </div>
                {product.weeklyRate && (
                  <div className="flex justify-between">
                    <span>Weekly:</span>
                    <span className="font-semibold">₹{product.weeklyRate}/week</span>
                  </div>
                )}
                {product.monthlyRate && (
                  <div className="flex justify-between">
                    <span>Monthly:</span>
                    <span className="font-semibold">₹{product.monthlyRate}/month</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span>Security Deposit:</span>
                  <span className="font-semibold">₹{product.securityDeposit}</span>
                </div>
              </CardContent>
            </Card>

            {/* Rental Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configure Rental</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Type */}
                <div>
                  <Label htmlFor="pricing-type">Pricing Type</Label>
                  <Select value={pricingType} onValueChange={setPricingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.hourlyRate && <SelectItem value="hourly">Hourly</SelectItem>}
                      <SelectItem value="daily">Daily</SelectItem>
                      {product.weeklyRate && <SelectItem value="weekly">Weekly</SelectItem>}
                      {product.monthlyRate && <SelectItem value="monthly">Monthly</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={product.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => !startDate || date <= startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Price Summary */}
                {startDate && endDate && (
                  <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-semibold">{duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-semibold">{quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rental Cost:</span>
                          <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Deposit:</span>
                          <span className="font-semibold">₹{(parseFloat(product.securityDeposit) * quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span>₹{(totalPrice + (parseFloat(product.securityDeposit) * quantity)).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="lg"
                  disabled={!startDate || !endDate || product.availableQuantity < quantity}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Rental Cart
                </Button>
              </CardContent>
            </Card>

            {/* Specifications */}
            {product.specifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{product.specifications}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}