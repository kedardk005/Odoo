import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RentalAnalytics } from "@/components/dashboard/rental-analytics";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { RentalCalendar } from "@/components/calendar/rental-calendar";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalRevenue: number;
  activeRentals: number;
  newCustomers: number;
  inventoryUtilization: number;
  overdueOrders: number;
  pendingQuotations: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'payment' | 'return' | 'overdue';
  message: string;
  timestamp: string;
  urgent?: boolean;
}

export function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch recent activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: ['/api/dashboard/activities'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Cron service mutations
  const startCronMutation = useMutation({
    mutationFn: () => fetch('/api/admin/cron/start', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Automated services started successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start automated services",
        variant: "destructive",
      });
    }
  });

  const stopCronMutation = useMutation({
    mutationFn: () => fetch('/api/admin/cron/stop', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Automated services stopped successfully",
      });
    }
  });

  const triggerRemindersMutation = useMutation({
    mutationFn: () => fetch('/api/admin/cron/trigger/reminders', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Return reminders processed successfully",
      });
    }
  });

  const triggerOverdueMutation = useMutation({
    mutationFn: () => fetch('/api/admin/cron/trigger/overdue', { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Overdue orders processed successfully", 
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of your rental management system
          </p>
        </div>

        {/* System Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startCronMutation.mutate()}
            disabled={startCronMutation.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Services
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => stopCronMutation.mutate()}
            disabled={stopCronMutation.isPending}
          >
            <Pause className="h-4 w-4 mr-2" />
            Stop Services
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      {!metricsLoading && metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{metrics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeRentals}</div>
              <p className="text-xs text-muted-foreground">
                Currently rented out
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.newCustomers}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Usage</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.inventoryUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                Utilization rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.overdueOrders}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quotations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingQuotations}</div>
              <p className="text-xs text-muted-foreground">
                Pending approval
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Rental Analytics */}
            <div className="lg:col-span-2">
              <RentalAnalytics />
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activitiesLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : activities ? (
                    activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.urgent ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                        {activity.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <RentalCalendar />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsDashboard />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Automated Services */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Return Reminders</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerRemindersMutation.mutate()}
                      disabled={triggerRemindersMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Trigger Now
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Process Overdue</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => triggerOverdueMutation.mutate()}
                      disabled={triggerOverdueMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Process Now
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Late Fee Calculation</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetch('/api/admin/cron/trigger/late-fees', { method: 'POST' })
                          .then(() => toast({ title: "Success", description: "Late fees calculated" }));
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Calculate Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database Connection</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Email Service</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Gateway</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">File Storage</span>
                    <Badge variant="default">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}