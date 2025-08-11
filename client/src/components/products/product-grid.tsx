import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Plus, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import type { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  products?: ProductWithCategory[];
  showHeader?: boolean;
  onAddToCart?: (product: ProductWithCategory) => void;
  showAddToCart?: boolean;
}

export function ProductGrid({ products, showHeader = false, onAddToCart, showAddToCart = false }: ProductGridProps) {
  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => api.getProducts(),
    enabled: !products,
  });

  const displayProducts = products || fetchedProducts;

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(0)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'rented':
        return 'status-rented';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading && !products) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Equipment Catalog</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Equipment Catalog</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {displayProducts && displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {product.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <Badge className={`ml-2 ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </Badge>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(product.dailyRate)}/day
                        </span>
                        {product.availableQuantity !== product.quantity && (
                          <div className="text-xs text-gray-500 mt-1">
                            {product.availableQuantity} of {product.quantity} available
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {showAddToCart && onAddToCart && product.availableQuantity > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          disabled={product.status === 'maintenance'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showHeader && displayProducts.length >= 6 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{Math.min(6, displayProducts.length)}</span> of{' '}
                  <span className="font-medium">{displayProducts.length}</span> products
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No products found</div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
