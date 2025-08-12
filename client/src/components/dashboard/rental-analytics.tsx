import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RentalAnalytics {
  totalRentals: number;
  activeRentals: number;
  overdueRentals: number;
  completedRentals: number;
  averageRentalDuration: number;
  mostPopularRentalPeriod: string;
  peakRentalDays: string[];
}

export function RentalAnalytics() {
  const { data: analytics, isLoading } = useQuery<RentalAnalytics>({
    queryKey: ['/api/reports/analytics'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const cards = [
    {
      title: "Total Rentals",
      value: analytics.totalRentals,
      description: "All time rentals",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Active Rentals",
      value: analytics.activeRentals,
      description: "Currently rented out",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Overdue Returns",
      value: analytics.overdueRentals,
      description: "Need immediate attention",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Completed Rentals",
      value: analytics.completedRentals,
      description: "Successfully returned",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rental Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Rental Duration</span>
              <Badge variant="outline">
                {analytics.averageRentalDuration.toFixed(1)} days
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Popular Period</span>
              <Badge variant="secondary">
                {analytics.mostPopularRentalPeriod}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Peak Rental Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.peakRentalDays.map((day) => (
                <Badge key={day} variant="outline">
                  {day}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Days with highest rental activity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}