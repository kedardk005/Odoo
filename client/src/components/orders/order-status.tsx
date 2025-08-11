import { Badge } from "@/components/ui/badge";

interface OrderStatusProps {
  status: string;
}

export function OrderStatus({ status }: OrderStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", variant: "secondary" as const };
      case "confirmed":
        return { label: "Confirmed", variant: "default" as const };
      case "delivered":
        return { label: "Delivered", variant: "success" as const };
      case "returned":
        return { label: "Returned", variant: "outline" as const };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" as const };
      default:
        return { label: status, variant: "secondary" as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}