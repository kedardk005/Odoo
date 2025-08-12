import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, ShoppingCart, Calendar, Eye, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import NavigationHeader from "@/components/NavigationHeader";

export default function CustomerProducts() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState("daily");
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory && product.status === "available";
  }) || [];

  const getRentalPrice = (product: any) => {
    switch (rentalPeriod) {
      case "weekly":
        return parseFloat(product.weeklyRate);
      case "monthly":
        return parseFloat(product.monthlyRate);
      default:
        return parseFloat(product.dailyRate);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct || !startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    let price = 0;
    if (rentalPeriod === "daily") {
      price = parseFloat(selectedProduct.dailyRate) * days;
    } else if (rentalPeriod === "weekly") {
      price = parseFloat(selectedProduct.weeklyRate) * Math.ceil(days / 7);
    } else {
      price = parseFloat(selectedProduct.monthlyRate) * Math.ceil(days / 30);
    }
    
    return price * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all rental details",
        variant: "destructive"
      });
      return;
    }

    const total = calculateTotal();
    const cartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      imageUrl: selectedProduct.imageUrl,
      quantity,
      startDate,
      endDate,
      pricingType: rentalPeriod,
      rate: getRentalPrice(selectedProduct),
      totalAmount: total,
      securityDeposit: parseFloat(selectedProduct.securityDeposit || "0")
    };

    // Store in localStorage for now
    const existingCart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
    existingCart.push(cartItem);
    localStorage.setItem("rentalCart", JSON.stringify(existingCart));

    // Dispatch storage event to update cart count
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Added to Cart",
      description: `${selectedProduct.name} has been added to your cart`,
    });

    setSelectedProduct(null);
    setIsDialogOpen(false);
    // Reset form
    setRentalPeriod("daily");
    setQuantity(1);
    setStartDate("");
    setEndDate("");
  };

  const handleGoToCart = () => {
    setLocation("/customer/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userType="customer" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Equipment Rental</h1>
          <p className="text-gray-600 mt-2">Browse and rent professional equipment for your projects</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Find Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} equipment items available for rent
          </p>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.imageUrl || "/api/placeholder/400/300"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    Available
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Daily Rate:</span>
                      <span className="font-semibold">₹{parseFloat(product.dailyRate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weekly Rate:</span>
                      <span className="font-semibold">₹{parseFloat(product.weeklyRate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span>{product.availableQuantity} units</span>
                    </div>
                  </div>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Rent Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Rent {selectedProduct?.name}</DialogTitle>
                        <DialogDescription>
                          Select rental period, quantity, and dates for this item.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedProduct && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Rental Period</Label>
                              <Select value={rentalPeriod} onValueChange={setRentalPeriod}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Quantity</Label>
                              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: selectedProduct.availableQuantity }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                            
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Rate ({rentalPeriod}):</span>
                              <span>₹{getRentalPrice(selectedProduct).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span>{quantity}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg">
                              <span>Total:</span>
                              <span>₹{calculateTotal().toLocaleString()}</span>
                            </div>
                          </div>

                          <Button onClick={handleAddToCart} className="w-full">
                            Add to Cart
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}