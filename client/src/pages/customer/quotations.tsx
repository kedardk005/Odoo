import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, MessageSquare, Plus, Eye } from "lucide-react";
import { format } from "date-fns";

interface Quotation {
  id: number;
  quotationNumber: string;
  status: string;
  requestedAmount?: number;
  quotedAmount?: number;
  eventDate: string;
  eventLocation: string;
  eventType: string;
  specialRequirements?: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    category: string;
  }>;
  adminNotes?: string;
}

export default function CustomerQuotations() {
  const { data: quotations, isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/customer/quotations"],
    queryFn: async () => {
      const response = await fetch("/api/customer/quotations");
      if (!response.ok) {
        throw new Error("Failed to fetch quotations");
      }
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Awaiting review from our team';
      case 'quoted':
        return 'Quote provided - awaiting your approval';
      case 'approved':
        return 'Quote approved - ready to convert to order';
      case 'rejected':
        return 'Quote declined';
      case 'converted':
        return 'Successfully converted to rental order';
      default:
        return 'Status unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">My Quotations</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Quotations</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {quotations?.length || 0} Requests
          </Badge>
          <Button onClick={() => window.location.href = '/customer/quotation'}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {!quotations || quotations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No Quotation Requests</h3>
            <p className="text-gray-500 mb-6">
              You haven't requested any quotations yet. Need custom pricing for your event?
            </p>
            <Button onClick={() => window.location.href = '/customer/quotation'}>
              Request Quotation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Quotation #{quotation.quotationNumber}
                    </CardTitle>
                    <CardDescription>
                      Requested on {format(new Date(quotation.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {getStatusDescription(quotation.status)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Event Date</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(quotation.eventDate), "PPP")}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Event Type</p>
                      <p className="text-sm text-gray-600">{quotation.eventType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{quotation.eventLocation}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {quotation.requestedAmount && (
                      <div>
                        <p className="text-sm font-medium">Requested Budget</p>
                        <p className="text-sm text-gray-600">
                          ₹{quotation.requestedAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    {quotation.quotedAmount && (
                      <div>
                        <p className="text-sm font-medium text-green-700">Quoted Price</p>
                        <p className="text-lg font-semibold text-green-700">
                          ₹{quotation.quotedAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium">Items Requested</p>
                      <p className="text-sm text-gray-600">
                        {quotation.items?.length || 0} product(s)
                      </p>
                    </div>
                  </div>
                </div>

                {quotation.items && quotation.items.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-2">Requested Items:</p>
                      {quotation.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.productName}</span>
                          <div className="text-right text-gray-500">
                            <span className="block">Qty: {item.quantity}</span>
                            <span className="text-xs">{item.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {quotation.specialRequirements && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm font-medium mb-2">Special Requirements:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {quotation.specialRequirements}
                      </p>
                    </div>
                  </>
                )}

                {quotation.adminNotes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Admin Notes:
                      </p>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        {quotation.adminNotes}
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  {quotation.status.toLowerCase() === 'quoted' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Accept Quote
                    </Button>
                  )}
                  
                  {quotation.status.toLowerCase() === 'approved' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Convert to Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}