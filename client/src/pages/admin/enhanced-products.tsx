import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";
import { ProductAvailabilityChecker } from "@/components/products/product-availability-checker";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Download,
  Package,
  Calendar,
  DollarSign
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  hourlyRate: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  securityDeposit: number;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  status: 'active' | 'inactive' | 'maintenance';
  imageUrl?: string;
  specifications?: string;
  minRentalPeriod: number;
  maxRentalPeriod: number;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
}

export function EnhancedProductsPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    status: 'active',
    minRentalPeriod: 1,
    maxRentalPeriod: 365,
    quantity: 1
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { categoryId: selectedCategory }],
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: Partial<Product>) => 
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowAddDialog(false);
      setNewProduct({
        status: 'active',
        minRentalPeriod: 1,
        maxRentalPeriod: 365,
        quantity: 1
      });
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Product>) =>
      fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setShowEditDialog(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      formData.append('file', files[0]);
      
      const response = await fetch('/api/upload/single', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      return [result.url];
    }
  });

  // Handle file upload
  const handleFileUpload = async (files: File[]): Promise<string[]> => {
    return uploadImageMutation.mutateAsync(files);
  };

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your rental inventory and pricing
          </p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product with all the necessary details for rental.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={newProduct}
              categories={categories || []}
              onSubmit={(data) => createProductMutation.mutate(data)}
              onCancel={() => setShowAddDialog(false)}
              isLoading={createProductMutation.isPending}
              onFileUpload={handleFileUpload}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products Grid</TabsTrigger>
          <TabsTrigger value="table">Products Table</TabsTrigger>
        </TabsList>

        {/* Products Grid */}
        <TabsContent value="products">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Product Image */}
                  {product.imageUrl ? (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Rate:</span>
                      <span className="font-semibold">₹{product.dailyRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Weekly Rate:</span>
                      <span className="font-semibold">₹{product.weeklyRate}</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex justify-between items-center text-sm">
                    <span>Available:</span>
                    <span className={cn(
                      "font-semibold",
                      product.availableQuantity > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {product.availableQuantity} of {product.quantity}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowViewDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        if (!confirm("Delete this product? This action cannot be undone.")) return;
                        fetch(`/api/products/${product.id}`, { method: 'DELETE' })
                          .then((res) => {
                            if (!res.ok) throw new Error('Failed to delete product');
                            return res.json();
                          })
                          .then(() => {
                            queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                            toast({ title: 'Deleted', description: 'Product deleted successfully' });
                          })
                          .catch((err) => {
                            toast({ title: 'Delete failed', description: err.message || 'Could not delete product', variant: 'destructive' });
                          });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Products Table */}
        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-right p-4">Daily Rate</th>
                      <th className="text-right p-4">Available</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-center p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{product.category?.name || 'Uncategorized'}</td>
                        <td className="text-right p-4">₹{product.dailyRate}</td>
                        <td className="text-right p-4">
                          <span className={cn(
                            "font-medium",
                            product.availableQuantity > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {product.availableQuantity}/{product.quantity}
                          </span>
                        </td>
                        <td className="text-center p-4">
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="text-center p-4">
                          <div className="flex justify-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedProduct(product);
                              setShowViewDialog(true);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedProduct(product);
                              setShowEditDialog(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => {
                              if (!confirm("Delete this product? This action cannot be undone.")) return;
                              fetch(`/api/products/${product.id}`, { method: 'DELETE' })
                                .then((res) => {
                                  if (!res.ok) throw new Error('Failed to delete product');
                                  return res.json();
                                })
                                .then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/products'] });
                                  toast({ title: 'Deleted', description: 'Product deleted successfully' });
                                })
                                .catch((err) => {
                                  toast({ title: 'Delete failed', description: err.message || 'Could not delete product', variant: 'destructive' });
                                });
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductDetails 
              product={selectedProduct} 
              onClose={() => setShowViewDialog(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Modify the product information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              categories={categories || []}
              onSubmit={(data) => updateProductMutation.mutate({ id: selectedProduct.id, ...data })}
              onCancel={() => setShowEditDialog(false)}
              isLoading={updateProductMutation.isPending}
              onFileUpload={handleFileUpload}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Form Component
function ProductForm({ 
  product, 
  categories, 
  onSubmit, 
  onCancel, 
  isLoading,
  onFileUpload 
}: {
  product: Partial<Product>;
  categories: Category[];
  onSubmit: (data: Partial<Product>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onFileUpload: (files: File[]) => Promise<string[]>;
}) {
  const [formData, setFormData] = useState(product);

  const handleImageUpload = async (files: File[]) => {
    const urls = await onFileUpload(files);
    setFormData({ ...formData, imageUrl: urls[0] });
    return urls;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId || ''}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <Label>Product Image</Label>
        <FileUpload
          onUpload={handleImageUpload}
          accept="image/*"
          maxFiles={1}
          maxSize={5 * 1024 * 1024} // 5MB
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img
              src={formData.imageUrl}
              alt="Product preview"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
          <Input
            id="hourlyRate"
            type="number"
            step="0.01"
            value={formData.hourlyRate || ''}
            onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
          <Input
            id="dailyRate"
            type="number"
            step="0.01"
            value={formData.dailyRate || ''}
            onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weeklyRate">Weekly Rate (₹)</Label>
          <Input
            id="weeklyRate"
            type="number"
            step="0.01"
            value={formData.weeklyRate || ''}
            onChange={(e) => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyRate">Monthly Rate (₹)</Label>
          <Input
            id="monthlyRate"
            type="number"
            step="0.01"
            value={formData.monthlyRate || ''}
            onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="securityDeposit">Security Deposit (₹)</Label>
          <Input
            id="securityDeposit"
            type="number"
            step="0.01"
            value={formData.securityDeposit || ''}
            onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Total Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity || ''}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minRentalPeriod">Min Rental Period (days)</Label>
          <Input
            id="minRentalPeriod"
            type="number"
            min="1"
            value={formData.minRentalPeriod || ''}
            onChange={(e) => setFormData({ ...formData, minRentalPeriod: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxRentalPeriod">Max Rental Period (days)</Label>
          <Input
            id="maxRentalPeriod"
            type="number"
            min="1"
            value={formData.maxRentalPeriod || ''}
            onChange={(e) => setFormData({ ...formData, maxRentalPeriod: parseInt(e.target.value) || 365 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status || 'active'}
          onValueChange={(value: any) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={() => onSubmit(formData)}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </div>
  );
}

// Product Details Component
function ProductDetails({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Product Image */}
          {product.imageUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {product.name}</div>
                <div><strong>Category:</strong> {product.category?.name || 'Uncategorized'}</div>
                <div><strong>Status:</strong> {product.status}</div>
                <div><strong>Description:</strong> {product.description}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Inventory</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Total Quantity:</strong> {product.quantity}</div>
                <div><strong>Available:</strong> {product.availableQuantity}</div>
                <div><strong>Reserved:</strong> {product.reservedQuantity}</div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold mb-2">Pricing</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <div><strong>Hourly Rate:</strong> ₹{product.hourlyRate}</div>
                <div><strong>Daily Rate:</strong> ₹{product.dailyRate}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Weekly Rate:</strong> ₹{product.weeklyRate}</div>
                <div><strong>Monthly Rate:</strong> ₹{product.monthlyRate}</div>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <strong>Security Deposit:</strong> ₹{product.securityDeposit}
            </div>
          </div>

          {/* Rental Periods */}
          <div>
            <h3 className="font-semibold mb-2">Rental Periods</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div><strong>Minimum:</strong> {product.minRentalPeriod} days</div>
              <div><strong>Maximum:</strong> {product.maxRentalPeriod} days</div>
            </div>
          </div>

          {product.specifications && (
            <div>
              <h3 className="font-semibold mb-2">Specifications</h3>
              <p className="text-sm text-muted-foreground">{product.specifications}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability">
          <ProductAvailabilityChecker 
            productId={product.id}
            productName={product.name}
            totalQuantity={product.quantity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}