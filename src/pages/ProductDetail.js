import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, Share, Calendar, Minus, Plus, ShoppingCart, User, MessageCircle } from 'lucide-react';

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
    description: 'Product description text would go here. This would include all the relevant details about the rental item, specifications, and usage instructions.',
    availability: 'In Stock',
    terms: 'Terms & conditions for this rental item would be listed here. Including damage policies, return conditions, and usage guidelines.'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/shop" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                🏠 Home
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Home
                </Link>
                <Link to="/shop" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Rental Shop
                </Link>
                <Link to="/shop/wishlist" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Wishlist
                </Link>
                <Link to="/shop/contact" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 font-medium">
                  Contact us
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-full hover:bg-blue-200 transition-all duration-200">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">admin</span>
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">📋</span>
                  </div>
                </button>
              </div>
              <Link to="/shop/contact" className="text-blue-600 hover:text-blue-800 transition-colors">
                <MessageCircle className="h-6 w-6" />
              </Link>
              <Link to="/shop/cart" className="relative bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/shop" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">All Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="w-40 h-32 bg-white rounded-xl flex items-center justify-center shadow-md">
                <div className="w-20 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                  <Bookmark className="w-8 h-8 text-gray-500" />
                </div>
              </div>
            </div>
            <button className="w-full text-center text-sm font-medium text-blue-600 border-2 border-blue-300 bg-blue-50 rounded-xl py-3 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200">
              Add to wish list
            </button>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">/ per unit</span>
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">From</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDateFrom}
                      onChange={(e) => setSelectedDateFrom(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDateTo}
                      onChange={(e) => setSelectedDateTo(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-bold text-gray-700">Qty</span>
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 text-center min-w-[80px] font-medium bg-gray-50">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                🛒 Add To Cart
              </button>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <label className="block text-sm font-bold text-gray-700 mb-3">Apply Coupon</label>
              <div className="flex overflow-hidden rounded-lg border-2 border-gray-300">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon Code"
                  className="flex-1 px-4 py-3 focus:outline-none bg-gray-50"
                />
                <button className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium">
                  Apply
                </button>
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Product description</h3>
              <p className="text-gray-600 mb-3 leading-relaxed">{product.description}</p>
              <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
                Read More &gt;
              </button>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Terms & Conditions</h3>
              <p className="text-gray-600 leading-relaxed">{product.terms}</p>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-700">Share:</span>
              <button className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200">
                <Share size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
