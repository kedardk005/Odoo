import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Heart, Trash2 } from 'lucide-react';

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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-900 font-medium">Review Order</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">Delivery</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">payment</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Overview</h1>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">IMG</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-lg font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Qty</span>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 text-center min-w-[60px]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button className="p-2 text-gray-400 hover:text-red-500">
                        <Heart size={20} />
                      </button>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-medium text-gray-900 mb-4">Delivery Charge</h2>
              <p className="text-right">-</p>
              
              <h2 className="font-medium text-gray-900 mt-6 mb-4">Sub Total</h2>
              <p className="text-right text-lg font-semibold">₹{subtotal}</p>
              
              <h2 className="font-medium text-gray-900 mt-6 mb-4">Taxes</h2>
              <p className="text-right">₹{taxes}</p>
              
              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-medium text-gray-900">Total</h2>
                  <p className="text-xl font-bold">₹{total}</p>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Apply Coupon</label>
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

              <Link to="/shop/checkout">
                <button className="w-full mt-6 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors font-medium">
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
