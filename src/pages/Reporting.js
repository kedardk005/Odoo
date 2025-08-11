import React, { useState } from 'react';
import { Calendar, Download, Filter, BarChart3, TrendingUp, Users, Package, DollarSign, RefreshCw } from 'lucide-react';

const Reporting = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportType, setReportType] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully!');
    }, 2000);
  };

  const handleDownloadReport = (format) => {
    alert(`Downloading report in ${format.toUpperCase()} format...`);
  };

  const handleRefreshData = () => {
    alert('Data refreshed successfully!');
  };

  const reports = [
    {
      id: 'rental-performance',
      name: 'Rental Performance Report',
      description: 'Detailed analysis of rental statistics and revenue',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      id: 'customer-analysis',
      name: 'Customer Analysis Report',
      description: 'Customer behavior and demographics insights',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'inventory-report',
      name: 'Inventory Management Report',
      description: 'Stock levels and product performance',
      icon: Package,
      color: 'bg-yellow-500'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Revenue, expenses and profit analysis',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  const kpis = [
    { label: 'Total Revenue', value: '₹2,45,000', change: '+12%', trend: 'up' },
    { label: 'Active Rentals', value: '156', change: '+8%', trend: 'up' },
    { label: 'New Customers', value: '42', change: '-3%', trend: 'down' },
    { label: 'Avg Order Value', value: '₹1,890', change: '+15%', trend: 'up' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reporting & Analytics</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefreshData}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={() => handleDownloadReport('pdf')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={() => handleDownloadReport('excel')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="overview">Overview Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="summary">Summary Report</option>
            </select>
          </div>
          
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <BarChart3 size={16} />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
              <div className={`flex items-center space-x-1 ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={16} className={kpi.trend === 'down' ? 'transform rotate-180' : ''} />
                <span className="text-sm font-medium">{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{report.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => alert(`Generating ${report.name}...`)}
                      className="btn-primary text-sm"
                    >
                      Generate
                    </button>
                    <button 
                      onClick={() => alert(`Viewing ${report.name}...`)}
                      className="btn-secondary text-sm"
                    >
                      View Last
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm">Daily</button>
            <button className="btn-primary text-sm">Weekly</button>
            <button className="btn-secondary text-sm">Monthly</button>
          </div>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">Chart visualization would appear here</p>
            <p className="text-sm text-gray-400">Integrate with Chart.js or similar library</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'Monthly Revenue Report - January 2024', date: '2024-01-31', status: 'completed' },
            { name: 'Customer Analysis Q4 2023', date: '2024-01-15', status: 'completed' },
            { name: 'Inventory Report - Week 3', date: '2024-01-20', status: 'pending' }
          ].map((report, index) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900">{report.name}</h4>
                <p className="text-sm text-gray-500">Generated on {report.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`status-badge ${
                  report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
                {report.status === 'completed' && (
                  <button 
                    onClick={() => handleDownloadReport('pdf')}
                    className="btn-secondary text-sm"
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reporting;
