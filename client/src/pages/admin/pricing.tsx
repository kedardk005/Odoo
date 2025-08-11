import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, Users, Calendar, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/NavigationHeader";

export default function PricingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    categoryId: "",
    productId: "",
    customerSegment: "",
    discountPercentage: "0",
    fixedDiscount: "0",
    validFrom: "",
    validUntil: "",
  });

  const { data: pricingRules = [], isLoading } = useQuery({
    queryKey: ["/api/pricing-rules"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      await apiRequest("POST", "/api/pricing-rules", ruleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
      setIsCreateRuleOpen(false);
      setNewRule({
        name: "",
        categoryId: "",
        productId: "",
        customerSegment: "",
        discountPercentage: "0",
        fixedDiscount: "0",
        validFrom: "",
        validUntil: "",
      });
      toast({
        title: "Success",
        description: "Pricing rule created successfully",
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

  const toggleRuleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await apiRequest("PUT", `/api/pricing-rules/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-rules"] });
      toast({
        title: "Success",
        description: "Pricing rule updated successfully",
      });
    },
  });

  const getSegmentBadge = (segment: string) => {
    const segmentConfig = {
      standard: { color: "bg-gray-500", label: "Standard" },
      vip: { color: "bg-purple-500", label: "VIP" },
      corporate: { color: "bg-blue-500", label: "Corporate" },
      seasonal: { color: "bg-green-500", label: "Seasonal" },
    };

    const config = segmentConfig[segment as keyof typeof segmentConfig] || segmentConfig.standard;

    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const handleCreateRule = () => {
    createRuleMutation.mutate({
      ...newRule,
      validFrom: newRule.validFrom ? new Date(newRule.validFrom).toISOString() : new Date().toISOString(),
      validUntil: newRule.validUntil ? new Date(newRule.validUntil).toISOString() : null,
    });
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
              <p className="text-gray-600">Configure pricing rules and customer segments</p>
            </div>
            <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Pricing Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Pricing Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      placeholder="VIP Customer Discount"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select value={newRule.categoryId} onValueChange={(value) => setNewRule({ ...newRule, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="customerSegment">Customer Segment</Label>
                    <Select value={newRule.customerSegment} onValueChange={(value) => setNewRule({ ...newRule, customerSegment: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newRule.discountPercentage}
                      onChange={(e) => setNewRule({ ...newRule, discountPercentage: e.target.value })}
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fixedDiscount">Fixed Discount (₹)</Label>
                    <Input
                      id="fixedDiscount"
                      type="number"
                      value={newRule.fixedDiscount}
                      onChange={(e) => setNewRule({ ...newRule, fixedDiscount: e.target.value })}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={newRule.validUntil}
                      onChange={(e) => setNewRule({ ...newRule, validUntil: e.target.value })}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateRule} 
                    disabled={createRuleMutation.isPending || !newRule.name}
                    className="w-full"
                  >
                    Create Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pricingRules.filter((rule: any) => rule.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Customer Segments</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Seasonal Rules</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pricingRules.filter((rule: any) => rule.customerSegment === 'seasonal').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rules</p>
                    <p className="text-2xl font-bold text-gray-900">{pricingRules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Rules List */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {pricingRules.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules found</h3>
                  <p className="text-gray-600">Create your first pricing rule to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricingRules.map((rule: any) => (
                    <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{rule.name}</h3>
                            {getSegmentBadge(rule.customerSegment)}
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Discount:</span>{" "}
                              {rule.discountPercentage > 0 && `${rule.discountPercentage}%`}
                              {rule.fixedDiscount > 0 && `₹${rule.fixedDiscount}`}
                              {rule.discountPercentage === "0" && rule.fixedDiscount === "0" && "None"}
                            </div>
                            <div>
                              <span className="font-medium">Valid From:</span>{" "}
                              {new Date(rule.validFrom).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Valid Until:</span>{" "}
                              {rule.validUntil ? new Date(rule.validUntil).toLocaleDateString() : "Indefinite"}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRuleStatusMutation.mutate({ 
                            id: rule.id, 
                            isActive: !rule.isActive 
                          })}
                          disabled={toggleRuleStatusMutation.isPending}
                        >
                          {rule.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}