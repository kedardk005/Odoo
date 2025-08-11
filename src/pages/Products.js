import React, { useState } from 'react';
import { Plus, Edit } from 'lucide-react';

const Products = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => alert('Create New Product - This would open a form to create a new product')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
          <button
            onClick={() => alert('Update Stock - This would open a dialog to update product stock levels')}
            className="btn-secondary"
          >
            Update Stock
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">1/50</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['general', 'rental-pricing'].map((tab) => (
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
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Product Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
                      <option>Select category</option>
                      <option>Equipment</option>
                      <option>Furniture</option>
                      <option>Electronics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Enter product description"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Upload product image</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rental-pricing' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Pricing</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="pb-3">Rental Period</th>
                      <th className="pb-3">Pricelist</th>
                      <th className="pb-3">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">Daily</td>
                      <td className="py-3">Standard</td>
                      <td className="py-3">₹100</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">Weekly</td>
                      <td className="py-3">Standard</td>
                      <td className="py-3">₹600</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">Monthly</td>
                      <td className="py-3">Standard</td>
                      <td className="py-3">₹2000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Rental Reservation charges</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Extra Hour:</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Extra Days:</span>
                    <span>₹100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Extra Hour:</span>
                    <span>₹50</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
