import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Eye, Edit, Plus, Minus } from "lucide-react";
import type { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  products: ProductWithCategory[];
  isLoading?: boolean;
  onAddToCart?: (product: ProductWithCategory, quantity: number) => void;
}

export function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
  const handleAddToCart = (product: ProductWithCategory) => {
    onAddToCart?.(product, 1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="success" className="bg-green-100 text-green-800">Available</Badge>;
      case "rented":
        return <Badge variant="destructive">Rented</Badge>;
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            <img
              src={product.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2">
              {getStatusBadge(product.status)}
            </div>
            <div className="absolute top-2 left-2">
              <Badge variant="outline" className="bg-white/90">
                {product.category?.name || 'Uncategorized'}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description || 'No description available'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    ₹{parseFloat(product.dailyRate).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">/day</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Available: {product.availableQuantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {product.quantity}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.status !== 'available' || product.availableQuantity === 0}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Rent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}