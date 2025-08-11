import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, differenceInHours, addDays } from "date-fns";
import { CalendarIcon, Plus, Minus, FileText, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";

interface QuotationItem {
  productId: string;
  productName: string;
  quantity: number;
  pricingType: string;
  rate: number;
  totalAmount: number;
}

export default function QuotationRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPricingType, setSelectedPricingType] = useState("daily");

  // Mock customer for now - in real app, get from auth context
  const customerId = "customer-id-123";

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const createQuotationMutation = useMutation({
    mutationFn: async (quotationData: any) => {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quotationData),
      });
      if (!response.ok) throw new Error("Failed to create quotation");
      return response.json();
    },
    onSuccess: (quotation) => {
      toast({
        title: "Quotation Created",
        description: `Quotation ${quotation.quotationNumber} has been sent for review`,
      });
      setLocation("/customer/home");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create quotation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItemToQuotation = () => {
    if (!selectedProductId || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select product, quantity, and dates",
        variant: "destructive",
      });
      return;
    }

    const product = products?.find(p => p.id === selectedProductId);
    if (!product) return;

    // Calculate pricing based on duration and type
    const hours = differenceInHours(endDate, startDate);
    const days = Math.ceil(hours / 24);
    
    let rate = 0;
    switch (selectedPricingType) {
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

    const newItem: QuotationItem = {
      productId: selectedProductId,
      productName: product.name,
      quantity: selectedQuantity,
      pricingType: selectedPricingType,
      rate: rate,
      totalAmount: rate * selectedQuantity,
    };

    setQuotationItems([...quotationItems, newItem]);
    setSelectedProductId("");
    setSelectedQuantity(1);
  };

  const removeItem = (index: number) => {
    setQuotationItems(quotationItems.filter((_, i) => i !== index));
  };

  const calculateTotalAmount = () => {
    return quotationItems.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const calculateSecurityDeposit = () => {
    if (!products) return 0;
    return quotationItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (parseFloat(product?.securityDeposit || "0") * item.quantity);
    }, 0);
  };

  const handleSubmitQuotation = () => {
    if (!startDate || !endDate || quotationItems.length === 0) {
      toast({
        title: "Invalid Quotation",
        description: "Please add items and select rental dates",
        variant: "destructive",
      });
      return;
    }

    const quotationData = {
      customerId,
      status: "sent",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalAmount: calculateTotalAmount().toFixed(2),
      securityDeposit: calculateSecurityDeposit().toFixed(2),
      validUntil: addDays(new Date(), 7).toISOString(), // Valid for 7 days
      notes,
      items: quotationItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        rate: item.rate.toFixed(2),
        totalAmount: item.totalAmount.toFixed(2),
      })),
    };

    createQuotationMutation.mutate(quotationData);
  };

  const duration = startDate && endDate ? 
    `${differenceInDays(endDate, startDate) + 1} days` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request Quotation</h1>
          <p className="text-gray-600 mt-2">Create a custom rental quotation for your equipment needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rental Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                {duration && (
                  <p className="text-sm text-gray-600">Duration: {duration}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Equipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Product</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.dailyRate}/day
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Pricing Type</Label>
                    <Select value={selectedPricingType} onValueChange={setSelectedPricingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addItemToQuotation} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Quotation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special requirements or notes for this rental..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quotation Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotationItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No items added yet. Select equipment from the left panel.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {quotationItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} | {item.pricingType} | ₹{item.rate.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">₹{item.totalAmount.toFixed(2)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Rental Amount:</span>
                        <span className="font-semibold">₹{calculateTotalAmount().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span className="font-semibold">₹{calculateSecurityDeposit().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>₹{(calculateTotalAmount() + calculateSecurityDeposit()).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSubmitQuotation} 
                      className="w-full"
                      disabled={createQuotationMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {createQuotationMutation.isPending ? "Sending..." : "Send Quotation Request"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {startDate && endDate && (
              <Card className="bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Quotation Details</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Rental Period: {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-blue-700">
                      Duration: {duration}
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