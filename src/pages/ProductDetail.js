import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share, Calendar, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedDateFrom, setSelectedDateFrom] = useState('');
  const [selectedDateTo, setSelectedDateTo] = useState('');
  const [couponCode, setCouponCode] = useState('');

  const product = {
    id: id,
    name: 'Product name',
    price: 8950,
    originalPrice: 10000,
    description: 'Product description text would go here. This would include all the relevant details about the rental item.',
    availability: 'In Stock',
    terms: 'Terms & conditions for this rental item would be listed here.'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/shop" className="text-xl font-bold">Rental Shop</Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/shop" className="text-gray-600 hover:text-gray-900">Rental Shop</Link>
                <Link to="/shop/wishlist" className="text-gray-600 hover:text-gray-900">Wishlist</Link>
                <Link to="/shop/contact" className="text-gray-600 hover:text-gray-900">Contact us</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/shop/cart" className="btn-primary">
                Cart (2)
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/shop" className="text-gray-600 hover:text-gray-900">All Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            <button className="w-full text-center text-sm text-gray-600 border border-gray-300 rounded-md py-2 hover:bg-gray-50">
              Add to wish list
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-600">/ per unit</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDateFrom}
                      onChange={(e) => setSelectedDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDateTo}
                      onChange={(e) => setSelectedDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Qty</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
                Add to Cart
              </button>
            </div>

            {/* Coupon */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Apply Coupon</label>
              <div className="flex">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button className="bg-black text-white px-4 py-2 rounded-r-md hover:bg-gray-800 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Product description</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
              <button className="text-black text-sm hover:underline">Read More &gt;</button>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Terms & Conditions</h3>
              <p className="text-gray-600 text-sm">{product.terms}</p>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Share:</span>
              <button className="text-gray-600 hover:text-gray-900">
                <Share size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
