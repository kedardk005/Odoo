import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const Transfer = () => {
  const [transferType, setTransferType] = useState('pickup');
  const [currentStep, setCurrentStep] = useState('draft');

  const steps = [
    { id: 'draft', name: 'Draft', color: 'bg-gray-300' },
    { id: 'waiting', name: 'Waiting', color: 'bg-yellow-500' },
    { id: 'ready', name: 'Ready', color: 'bg-blue-500' },
    { id: 'done', name: 'Done', color: 'bg-green-500' }
  ];

  const transferData = {
    id: transferType === 'pickup' ? 'PICKUP/OUT/0001' : 'Return/In/0001',
    customer: 'Customer 1',
    invoiceAddress: '123 Main St, City',
    deliveryAddress: '456 Oak Ave, City',
    sourceLocation: transferType === 'pickup' ? 'Warehouse A' : 'Customer Location',
    scheduleDate: '2024-01-20',
    responsible: 'Admin',
    transferType: transferType === 'pickup' ? 'Pickup' : 'Return'
  };

  const products = [
    {
      id: 1,
      name: 'Product 1',
      quantity: 5,
      unitPrice: 200,
      tax: 0,
      subTotal: 1000
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transfer</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">1/50</span>
        </div>
      </div>

      {/* Transfer Type Toggle */}
      <div className="flex space-x-4">
        <button
          onClick={() => setTransferType('pickup')}
          className={`px-4 py-2 rounded-md ${
            transferType === 'pickup' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Pickup
        </button>
        <button
          onClick={() => setTransferType('return')}
          className={`px-4 py-2 rounded-md ${
            transferType === 'return' 
              ? 'bg-black text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Return
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="btn-secondary">Check Availability</button>
        <button className="btn-secondary">Confirm</button>
        <button className="btn-secondary">Cancel</button>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`w-4 h-4 rounded-full ${
                  step.id === currentStep ? step.color : 'bg-gray-300'
                }`}
              ></div>
              <span className={`ml-2 text-sm ${
                step.id === currentStep ? 'font-medium' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-4 text-gray-400" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{transferData.id}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Customer:</span>
                  <span className="ml-2">{transferData.customer}</span>
                </div>
                <div>
                  <span className="font-medium">{transferType === 'pickup' ? 'Invoice' : 'Pickup'} Address:</span>
                  <span className="ml-2">{transferData.invoiceAddress}</span>
                </div>
                <div>
                  <span className="font-medium">{transferType === 'pickup' ? 'Delivery' : 'Destination'} Address:</span>
                  <span className="ml-2">{transferData.deliveryAddress}</span>
                </div>
                <div>
                  <span className="font-medium">Source Location:</span>
                  <span className="ml-2">{transferData.sourceLocation}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Schedule Date:</span>
                  <span className="ml-2">{transferData.scheduleDate}</span>
                </div>
                <div>
                  <span className="font-medium">Responsible:</span>
                  <span className="ml-2">{transferData.responsible}</span>
                </div>
                <div>
                  <span className="font-medium">Transfer Type:</span>
                  <span className="ml-2">{transferData.transferType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Lines */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="border-b border-gray-200 p-4">
              <div className="flex space-x-8">
                <button className="text-sm font-medium text-black border-b-2 border-black pb-2">
                  Transfer lines
                </button>
                <button className="text-sm font-medium text-gray-500 pb-2">
                  Other details
                </button>
                <button className="text-sm font-medium text-gray-500 pb-2">
                  Transfer Notes
                </button>
              </div>
            </div>
            
            <div className="p-6">
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
                    {products.map((product) => (
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
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4">Transfer Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Untaxed Total:</span>
                <span>₹1000</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 font-medium">
                <span>Total:</span>
                <span>₹1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
