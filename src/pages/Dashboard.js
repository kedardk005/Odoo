import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');

  // Mock data
  const stats = {
    quotations: 30,
    rentals: 26,
    revenue: 10000
  };

  const topCategories = [
    { category: 'Rental - Service', ordered: 25, revenue: 2400 },
    { category: 'Equipment', ordered: 10, revenue: 3052 },
    { category: 'Furniture', ordered: 8, revenue: 1004 },
    { category: 'Electronics', ordered: 6, revenue: 3009 }
  ];

  const topProducts = [
    { product: 'Wheelchairs', ordered: 10, revenue: 3052 },
    { product: 'Tables', ordered: 8, revenue: 1004 },
    { product: 'Chairs', ordered: 6, revenue: 3009 }
  ];

  const topCustomers = [
    { customer: 'Customer1', ordered: 10, revenue: 3052 },
    { customer: 'Customer2', ordered: 8, revenue: 1004 },
    { customer: 'Customer3', ordered: 6, revenue: 3009 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-300"
            >
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-300"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Quotations</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.quotations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Rentals</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rentals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Tables Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Product Categories */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Product Categories</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCategories.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.ordered}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.product}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.ordered}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers - First Row, Full Width in Second Column */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCustomers.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.customer}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.ordered}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Table - To complete 2x2 grid */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">New Rental Order</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="status-badge bg-green-100 text-green-800">Completed</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Product Return</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">4 hours ago</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="status-badge bg-blue-100 text-blue-800">Processing</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Stock Update</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">6 hours ago</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="status-badge bg-yellow-100 text-yellow-800">Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
