import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Download, FileText, BarChart3, Users, Package, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

interface ReportFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dateRange?: DateRange;
}

export function ReportsDashboard() {
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'monthly'
  });

  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'revenue' | 'analytics'>('revenue');

  // Fetch revenue report
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/reports/revenue', filters],
    enabled: activeTab === 'revenue'
  });

  // Fetch most rented products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/reports/most-rented-products', filters],
    enabled: activeTab === 'products'
  });

  // Fetch top customers
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/reports/top-customers', filters],
    enabled: activeTab === 'customers'
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/reports/analytics', filters],
    enabled: activeTab === 'analytics'
  });

  const handleExportPDF = (reportType: string) => {
    const params = new URLSearchParams();
    params.append('period', filters.period);
    if (filters.dateRange?.from) {
      params.append('startDate', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      params.append('endDate', filters.dateRange.to.toISOString());
    }
    
    const url = `/api/reports/pdf/${reportType}?${params.toString()}`;
    window.open(url, '_blank');
  };

  const handleExportCSV = (reportType: string) => {
    const params = new URLSearchParams();
    params.append('period', filters.period);
    if (filters.dateRange?.from) {
      params.append('startDate', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      params.append('endDate', filters.dateRange.to.toISOString());
    }
    
    const url = `/api/reports/csv/${reportType}?${params.toString()}`;
    window.open(url, '_blank');
  };

  const tabs = [
    { id: 'revenue', label: 'Revenue', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your rental business
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select
                value={filters.period}
                onValueChange={(value: any) => setFilters({ ...filters, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.period === 'custom' && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(dateRange) => setFilters({ ...filters, dateRange })}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {activeTab === 'revenue' && (
          <RevenueReport data={revenueData} isLoading={revenueLoading} onExport={handleExportPDF} />
        )}
        
        {activeTab === 'products' && (
          <ProductsReport data={productsData} isLoading={productsLoading} onExport={handleExportPDF} />
        )}
        
        {activeTab === 'customers' && (
          <CustomersReport data={customersData} isLoading={customersLoading} onExport={handleExportPDF} />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsReport data={analyticsData} isLoading={analyticsLoading} onExport={handleExportPDF} />
        )}
      </div>
    </div>
  );
}

function RevenueReport({ data, isLoading, onExport }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Loading revenue report...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Revenue Report</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('revenue')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.totalRevenue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">{data?.period || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.revenueByMonth?.reduce((sum: number, month: any) => sum + month.orderCount, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {data?.revenueByMonth && data.revenueByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.revenueByMonth.map((month: any) => (
                <div key={month.month} className="flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <div className="text-right">
                    <div className="font-semibold">₹{month.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{month.orderCount} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProductsReport({ data, isLoading, onExport }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Loading products report...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Most Rented Products</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('products')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCSV('products')}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Rentals</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-right p-4">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((product: any, index: number) => (
                  <tr key={product.productId} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{product.productName}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground">{product.categoryName}</span>
                    </td>
                    <td className="text-right p-4">{product.totalRentals}</td>
                    <td className="text-right p-4">₹{product.totalRevenue.toFixed(2)}</td>
                    <td className="text-right p-4">{product.averageRentalDuration.toFixed(1)} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersReport({ data, isLoading, onExport }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Loading customers report...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Top Customers</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('customers')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportCSV('customers')}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Customer</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-right p-4">Orders</th>
                  <th className="text-right p-4">Total Spent</th>
                  <th className="text-right p-4">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((customer: any) => (
                  <tr key={customer.customerId} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{customer.customerName}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground">{customer.email}</span>
                    </td>
                    <td className="text-right p-4">{customer.totalOrders}</td>
                    <td className="text-right p-4">₹{customer.totalSpent.toFixed(2)}</td>
                    <td className="text-right p-4">₹{customer.averageOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnalyticsReport({ data, isLoading, onExport }: any) {
  if (isLoading) {
    return <div className="animate-pulse">Loading analytics report...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Rental Analytics</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport('analytics')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalRentals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeRentals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.overdueRentals || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.completedRentals || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}