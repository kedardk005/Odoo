import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, Users, BarChart3 } from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: metrics ? `$${metrics.totalRevenue.toLocaleString()}` : "$0",
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: TrendingUp,
      bgColor: "bg-green-100",
      iconColor: "text-success",
    },
    {
      title: "Active Rentals",
      value: metrics?.activeRentals.toString() || "0",
      change: "+8 pending returns",
      changeType: "neutral" as const,
      icon: ShoppingBag,
      bgColor: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "New Customers",
      value: metrics?.newCustomers.toString() || "0",
      change: "+15.2% from last week",
      changeType: "positive" as const,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-secondary",
    },
    {
      title: "Inventory Utilization",
      value: metrics ? `${metrics.inventoryUtilization}%` : "0%",
      change: "Available capacity",
      changeType: "neutral" as const,
      icon: BarChart3,
      bgColor: "bg-amber-100",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-sm ${
                  card.changeType === "positive" ? "text-success" : 
                  card.changeType === "negative" ? "text-destructive" : 
                  "text-gray-500"
                }`}>
                  {card.change}
                </p>
              </div>
              <div className={`p-3 ${card.bgColor} rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
