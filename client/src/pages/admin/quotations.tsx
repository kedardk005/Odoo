import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";

export default function QuotationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["/api/quotations"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/quotations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Success",
        description: "Quotation status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const convertToOrderMutation = useMutation({
    mutationFn: async (quotationId: string) => {
      await apiRequest("POST", `/api/quotations/${quotationId}/convert-to-order`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Quotation converted to order successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-500", icon: FileText },
      sent: { color: "bg-blue-500", icon: Clock },
      approved: { color: "bg-green-500", icon: CheckCircle },
      rejected: { color: "bg-red-500", icon: XCircle },
      expired: { color: "bg-orange-500", icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || FileText;

    return (
      <Badge className={`${config?.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredQuotations = quotations.filter((quotation: any) => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
              <p className="text-gray-600">Manage customer quotations and convert to orders</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Quotation
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by quotation number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotations List */}
          <div className="grid gap-6">
            {filteredQuotations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
                  <p className="text-gray-600">Create your first quotation to get started.</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quotation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredQuotations.map((quotation: any) => (
                <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Quotation #{quotation.quotationNumber}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          Customer: {quotation.customer?.firstName} {quotation.customer?.lastName}
                        </p>
                      </div>
                      {getStatusBadge(quotation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">
                          {new Date(quotation.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">
                          {new Date(quotation.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">₹{parseFloat(quotation.totalAmount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valid Until</p>
                        <p className="font-medium">
                          {new Date(quotation.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {quotation.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuotationMutation.mutate({ id: quotation.id, status: "sent" })}
                          disabled={updateQuotationMutation.isPending}
                        >
                          Send to Customer
                        </Button>
                      )}
                      
                      {quotation.status === "approved" && (
                        <Button
                          size="sm"
                          onClick={() => convertToOrderMutation.mutate(quotation.id)}
                          disabled={convertToOrderMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Convert to Order
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}