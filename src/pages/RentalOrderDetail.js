import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';

const RentalOrderDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('order-lines');

  // Mock data
  const order = {
    id: 'R0001',
    customer: 'Customer 1',
    invoiceAddress: '123 Main St, City, Country',
    deliveryAddress: '123 Main St, City, Country',
    rentalTemplate: 'Standard Rental',
    expiration: '2024-02-15',
    rentalOrderDate: '2024-01-15',
    products: [
      {
        id: 1,
        name: 'Product 1',
        quantity: 5,
        unitPrice: 200,
        tax: 0,
        subTotal: 1000
      }
    ],
    untaxedTotal: 1000,
    tax: 0,
    total: 1000,
    status: 'confirmed'
  };

  const workflowSteps = [
    { name: 'Quotation', status: 'completed', color: 'bg-blue-500' },
    { name: 'Quotation Sent', status: 'completed', color: 'bg-blue-500' },
    { name: 'Rental Order', status: 'current', color: 'bg-yellow-500' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/rental" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.id}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`status-badge ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">1/80</span>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft size={16} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="btn-secondary">Smart Delivery</button>
        <button className="btn-secondary">Delivery</button>
        <button className="btn-secondary flex items-center space-x-1">
          <Edit size={16} />
          <span>Edit</span>
        </button>
        <button className="btn-secondary flex items-center space-x-1">
          <Trash2 size={16} />
          <span>Cancel</span>
        </button>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          {workflowSteps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${step.color}`}></div>
              <span className={`ml-2 text-sm ${step.status === 'current' ? 'font-medium' : ''}`}>
                {step.name}
              </span>
              {index < workflowSteps.length - 1 && (
                <ChevronRight className="mx-4 text-gray-400" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Customer:</span> {order.customer}</p>
                  <p><span className="font-medium">Invoice Address:</span> {order.invoiceAddress}</p>
                  <p><span className="font-medium">Delivery Address:</span> {order.deliveryAddress}</p>
                  <p><span className="font-medium">Rental Template:</span> {order.rentalTemplate}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Expiration:</span> {order.expiration}</p>
                  <p><span className="font-medium">Rental Order Date:</span> {order.rentalOrderDate}</p>
                  <p><span className="font-medium">Products:</span> {order.products.length}</p>
                  <p><span className="font-medium">Rental Period:</span> 30 days</p>
                  <p><span className="font-medium">Rental Duration:</span> Daily</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['order-lines', 'other-details', 'rental-details'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'order-lines' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-3">Product</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Unit Price</th>
                        <th className="pb-3">Tax</th>
                        <th className="pb-3">Sub Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products.map((product) => (
                        <tr key={product.id} className="border-t border-gray-200">
                          <td className="py-3">{product.name}</td>
                          <td className="py-3">{product.quantity}</td>
                          <td className="py-3">₹{product.unitPrice}</td>
                          <td className="py-3">₹{product.tax}</td>
                          <td className="py-3">₹{product.subTotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-3">Terms & Conditions</h3>
            <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
              Standard rental terms and conditions apply. Please review the rental agreement for complete terms.
            </div>
          </div>
        </div>

        {/* Right Column - Totals */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Order Total</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Untaxed Total:</span>
                <span>₹{order.untaxedTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
                <span>Total:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          <button className="w-full btn-primary">Update Prices</button>
        </div>
      </div>
    </div>
  );
};

export default RentalOrderDetail;
