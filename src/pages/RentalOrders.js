import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const RentalOrders = () => {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState('ALL');

  // Mock data
  const orders = [
    {
      id: 'R0001',
      customer: 'Customer1',
      amount: 2000,
      status: 'confirmed',
      invoiceStatus: 'fully-invoiced',
      date: '2024-01-15'
    },
    {
      id: 'R0002',
      customer: 'Customer2',
      amount: 1000,
      status: 'reserved',
      invoiceStatus: 'nothing-to-invoice',
      date: '2024-01-14'
    },
    {
      id: 'R0003',
      customer: 'Customer3',
      amount: 3000,
      status: 'confirmed',
      invoiceStatus: 'to-invoice',
      date: '2024-01-13'
    },
    {
      id: 'R0004',
      customer: 'Customer4',
      amount: 1500,
      status: 'pending',
      invoiceStatus: 'fully-invoiced',
      date: '2024-01-12'
    }
  ];

  const statusCounts = {
    ALL: 12,
    confirmed: 8,
    reserved: 6,
    returned: 3,
    cancelled: 1
  };

  const invoiceStatusCounts = {
    'fully-invoiced': 5,
    'nothing-to-invoice': 4,
    'to-invoice': 3
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      reserved: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      returned: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getInvoiceStatusColor = (status) => {
    const colors = {
      'fully-invoiced': 'bg-green-100 text-green-800',
      'nothing-to-invoice': 'bg-gray-100 text-gray-800',
      'to-invoice': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const OrderCard = ({ order }) => (
    <Link to={`/rental/${order.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{order.id}</h3>
          <span className={`status-badge ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">Customer:</span> {order.customer}</p>
          <p><span className="font-medium">Amount:</span> ₹{order.amount}</p>
          <p><span className="font-medium">Date:</span> {order.date}</p>
        </div>
        <div className="mt-3">
          <span className={`status-badge ${getInvoiceStatusColor(order.invoiceStatus)}`}>
            {order.invoiceStatus.replace('-', ' ')}
          </span>
        </div>
      </div>
    </Link>
  );

  const OrderRow = ({ order }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <input type="checkbox" className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Link to={`/rental/${order.id}`} className="text-black font-medium hover:underline">
          {order.id}
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`status-badge ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.amount}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.amount}</td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rental Orders</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => alert('Create New Rental Order - This would open a form to create a new rental order')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">1/80</span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 ${viewMode === 'card' ? 'bg-gray-100' : ''}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <div className="w-64 space-y-6">
          {/* Rental Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">RENTAL STATUS</h3>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedStatus === status 
                      ? 'bg-gray-100 text-black font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{status === 'ALL' ? 'ALL' : status}</span>
                    <span>{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Invoice Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">INVOICE STATUS</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedInvoiceStatus('ALL')}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedInvoiceStatus === 'ALL' 
                    ? 'bg-gray-100 text-black font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between">
                  <span>ALL</span>
                  <span>12</span>
                </div>
              </button>
              {Object.entries(invoiceStatusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setSelectedInvoiceStatus(status)}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedInvoiceStatus === status 
                      ? 'bg-gray-100 text-black font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{status.replace('-', ' ')}</span>
                    <span>{count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Orders Display */}
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created by user</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalOrders;
