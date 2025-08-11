import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react";

interface MetricsCardsProps {
  metrics: {
    totalRevenue: number;
    activeRentals: number;
    newCustomers: number;
    pendingOrders: number;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Active Rentals",
      value: (metrics.activeRentals || 0).toString(),
      change: "+3.2%",
      changeType: "positive" as const,
      icon: Package,
    },
    {
      title: "New Customers",
      value: (metrics.newCustomers || 0).toString(),
      change: "+8.1%",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Pending Orders",
      value: (metrics.pendingOrders || 0).toString(),
      change: "-2.4%",
      changeType: "negative" as const,
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {card.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    card.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {card.change}
                </span>
                <span className="text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}