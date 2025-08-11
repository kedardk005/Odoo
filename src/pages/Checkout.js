import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShoppingCart, User, MessageCircle } from 'lucide-react';

const Checkout = () => {
  const [step, setStep] = useState('delivery'); // 'delivery' or 'payment'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [invoiceAddress, setInvoiceAddress] = useState('');
  const [sameAddress, setSameAddress] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });
  const [saveCard, setSaveCard] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const orderSummary = {
    items: 2,
    subtotal: 4000,
    deliveryCharge: 0,
    taxes: 30,
    total: 4030
  };

  if (step === 'payment') {
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
                  <Link to="/shop" className="px-4 py-2 bg-black text-white rounded-full font-medium">
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
              <span className="text-gray-600">Review Order</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-600">Delivery</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-900 font-bold">payment</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-3xl font-bold text-black">Confirm Order</h1>
              
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Choose a payment method</h2>
                
                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-4">
                    {[
                      { value: 'credit-card', label: 'Credit Card' },
                      { value: 'debit-card', label: 'Debit Card' },
                      { value: 'upi', label: 'UPI Pay' },
                      { value: 'paypal', label: 'Paypal' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-black focus:ring-gray-500"
                        />
                        <span className="text-lg font-medium group-hover:text-black transition-colors">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Card Details */}
                  {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
                    <div className="space-y-6 mt-8 p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Name on Card</label>
                        <input
                          type="text"
                          placeholder="Placeholder"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="•••• •••• •••• ••••"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Expiration Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Security Code</label>
                          <input
                            type="text"
                            placeholder="CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-5 h-5 text-black rounded focus:ring-gray-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Save my card details</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{orderSummary.items} Items - ₹{orderSummary.subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-bold text-black">Delivery Charge</span>
                    <span className="font-bold text-black">-</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-bold text-black">Sub Total</span>
                    <span className="font-bold text-black">₹{orderSummary.subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-bold text-black">Taxes</span>
                    <span className="font-bold text-black">₹{orderSummary.taxes}</span>
                  </div>

                  <div className="flex justify-between border-t border-gray-300 pt-4 text-lg">
                    <span className="font-bold text-black">Total</span>
                    <span className="font-bold text-black">₹{orderSummary.total}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Apply Coupon</label>
                  <div className="flex overflow-hidden rounded-lg border border-gray-300">
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

                <button className="w-full mt-6 bg-black text-white py-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-bold text-lg shadow-sm">
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <Link to="/shop" className="px-4 py-2 bg-black text-white rounded-full font-medium">
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
            <span className="text-gray-600">Review Order</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-900 font-bold">Delivery</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">payment</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold text-black">Delivery Address</h1>
            
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-lg font-bold text-black mb-3">Delivery Address</label>
                <textarea
                  rows="4"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200 resize-none"
                  placeholder="Enter your complete delivery address"
                />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-black mb-3">Invoice Address</label>
                <textarea
                  rows="4"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-gray-400 transition-all duration-200 resize-none"
                  placeholder="Enter your billing address"
                />
              </div>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-200 ${sameAddress ? 'bg-black' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${sameAddress ? 'translate-x-6 ml-1' : 'translate-x-1'}`}></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">Billing address same as delivery address</span>
              </label>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Choose Delivery Method</label>
                <div className="relative">
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black appearance-none hover:border-gray-400 transition-all duration-200"
                  >
                    <option value="">Please Pick Something</option>
                    <option value="home-delivery">Home Delivery</option>
                    <option value="pickup">Store Pickup</option>
                    <option value="express">Express Delivery</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{orderSummary.items} Items - ₹{orderSummary.subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-bold text-black">Delivery Charge</span>
                  <span className="font-bold text-black">-</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold text-black">Sub Total</span>
                  <span className="font-bold text-black">₹{orderSummary.subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-bold text-black">Taxes</span>
                  <span className="font-bold text-black">₹{orderSummary.taxes}</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-300 pt-4 text-lg">
                  <span className="font-bold text-black">Total</span>
                  <span className="font-bold text-black">₹{orderSummary.total}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Apply Coupon</label>
                <div className="flex overflow-hidden rounded-lg border border-gray-300">
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

              <button 
                onClick={() => setStep('payment')}
                className="w-full mt-6 bg-black text-white py-4 rounded-lg hover:bg-gray-700 transition-all duration-200 font-bold text-lg shadow-sm"
              >
                Confirm
              </button>
              
              <Link to="/shop/cart">
                <button className="w-full mt-4 border border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium">
                  &lt; back to Cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
