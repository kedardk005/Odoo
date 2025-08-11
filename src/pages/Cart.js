import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Heart, Trash2, ShoppingCart, User, MessageCircle, ChevronDown } from 'lucide-react';

const Cart = () => {
  const [couponCode, setCouponCode] = useState('');
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Product Name',
      price: 0,
      quantity: 1,
      image: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Product Name',
      price: 0,
      quantity: 1,
      image: '/api/placeholder/80/80'
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = 4000;
  const deliveryCharge = 0;
  const taxes = 30;
  const total = subtotal + deliveryCharge + taxes;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-black">
                Rental Management System
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link to="/shop" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 font-medium">
                  Rental Shop
                </Link>
                <Link to="/shop/wishlist" className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all duration-200 font-medium">
                  Wishlist
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-gray-100 text-black px-3 py-2 rounded-full hover:bg-gray-200 transition-all duration-200">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">admin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-900 font-bold">Review Order</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">Delivery</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">payment</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-black">Order Overview</h1>
            
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                      <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <div className="w-10 h-8 bg-gray-300 rounded flex items-center justify-center">
                          <span className="text-gray-500 text-xs font-medium">IMG</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                      <p className="text-2xl font-bold text-black">₹{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-gray-700">Qty</span>
                        <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[60px] font-medium bg-gray-50">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                        <Heart size={20} />
                      </button>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 text-lg">Delivery Charge</h2>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              <p className="text-right text-lg font-bold text-black mb-6">-</p>
              
              <h2 className="font-bold text-black text-lg mb-2">Sub Total</h2>
              <p className="text-right text-2xl font-bold text-black mb-6">₹{subtotal}</p>
              
              <h2 className="font-bold text-black text-lg mb-2">Taxes</h2>
              <p className="text-right text-lg font-bold text-black mb-6">₹{taxes}</p>
              
              <div className="border-t border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-black text-lg">Total</h2>
                  <p className="text-2xl font-bold text-black">₹{total}</p>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Apply Coupon</label>
                <div className="flex overflow-hidden rounded-lg border border-gray-400">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon Code"
                    className="flex-1 px-4 py-3 focus:outline-none bg-gray-50"
                  />
                  <button className="bg-black text-white px-6 py-3 hover:bg-gray-700 transition-colors font-medium">
                    Apply
                  </button>
                </div>
              </div>

              <Link to="/shop/checkout">
                <button className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-bold text-lg shadow-sm">
                  Proceed to checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
