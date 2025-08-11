import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

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
              <span className="text-gray-600">Review Order</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-600">Delivery</span>
              <span className="text-gray-400">&gt;</span>
              <span className="text-gray-900 font-medium">payment</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Confirm Order</h1>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Choose a payment method</h2>
                
                <div className="space-y-4">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>Credit Card</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="debit-card"
                        checked={paymentMethod === 'debit-card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>Debit Card</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>UPI Pay</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span>Paypal</span>
                    </label>
                  </div>

                  {/* Card Details */}
                  {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
                    <div className="space-y-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                        <input
                          type="text"
                          placeholder="Placeholder"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="•••• •••• •••• ••••"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                          <input
                            type="text"
                            placeholder="CVV"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Save my card details</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-gray-900">Order Summary</h2>
                  <ChevronDown size={16} />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>{orderSummary.items} Items - ₹{orderSummary.subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>-</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Sub Total</span>
                    <span>₹{orderSummary.subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>₹{orderSummary.taxes}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
                    <span>Total</span>
                    <span>₹{orderSummary.total}</span>
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

                <button className="w-full mt-6 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors font-medium">
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
            <span className="text-gray-600">Review Order</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-900 font-medium">Delivery</span>
            <span className="text-gray-400">&gt;</span>
            <span className="text-gray-600">payment</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-red-500">Delivery Address</h1>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <textarea
                  rows="3"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter delivery address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Address</label>
                <textarea
                  rows="3"
                  value={invoiceAddress}
                  onChange={(e) => setInvoiceAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter invoice address"
                />
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => setSameAddress(e.target.checked)}
                  className="mr-2 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Billing address same as delivery address</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choose Delivery Method</label>
                <div className="relative">
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black appearance-none"
                  >
                    <option value="">Please Pick Something</option>
                    <option value="home-delivery">Home Delivery</option>
                    <option value="pickup">Store Pickup</option>
                    <option value="express">Express Delivery</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-gray-900">Order Summary</h2>
                <ChevronDown size={16} />
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{orderSummary.items} Items - ₹{orderSummary.subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>-</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Sub Total</span>
                  <span>₹{orderSummary.subtotal}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{orderSummary.taxes}</span>
                </div>
                
                <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
                  <span>Total</span>
                  <span>₹{orderSummary.total}</span>
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

              <button 
                onClick={() => setStep('payment')}
                className="w-full mt-6 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors font-medium"
              >
                Confirm
              </button>
              
              <Link to="/shop/cart">
                <button className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors">
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
