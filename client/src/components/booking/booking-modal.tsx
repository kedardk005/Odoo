import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, User, ShoppingCart, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface BookingItem {
  productId: string;
  product: any;
  quantity: number;
  dailyRate: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: BookingItem[];
  onCreateOrder: (orderData: any) => void;
  isLoading?: boolean;
}

export function BookingModal({ isOpen, onClose, selectedItems, onCreateOrder, isLoading }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [location, navigate] = useLocation();
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderData, setCreatedOrderData] = useState<any>(null);
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [rentalDates, setRentalDates] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [notes, setNotes] = useState("");

  const steps = [
    { number: 1, title: "Customer Info", icon: User },
    { number: 2, title: "Select Items", icon: ShoppingCart },
    { number: 3, title: "Dates & Notes", icon: CalendarIcon },
    { number: 4, title: "Review & Confirm", icon: CreditCard },
  ];

  const calculateDays = () => {
    if (!rentalDates.startDate || !rentalDates.endDate) return 1;
    const diffTime = Math.abs(rentalDates.endDate.getTime() - rentalDates.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    return selectedItems.reduce((total, item) => {
      return total + (parseFloat(item.dailyRate) * item.quantity * days);
    }, 0);
  };

  const calculateSecurityDeposit = () => {
    return selectedItems.reduce((total, item) => {
      const deposit = parseFloat(item.product.securityDeposit || "0");
      return total + (deposit * item.quantity);
    }, 0);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!rentalDates.startDate || !rentalDates.endDate) return;

    const days = calculateDays();
    const totalAmount = calculateTotal();
    const securityDeposit = calculateSecurityDeposit();

    const orderData = {
      customerId: "temp-customer-id", // This would be resolved by creating/finding customer
      startDate: rentalDates.startDate.toISOString(),
      endDate: rentalDates.endDate.toISOString(),
      totalAmount: totalAmount.toString(),
      securityDeposit: securityDeposit.toString(),
      notes,
      customer: customerData,
      days,
      items: selectedItems,
    };

    setCreatedOrderData(orderData);
    setOrderCreated(true);
    onCreateOrder(orderData);
  };

  const handleProceedToPayment = () => {
    onClose();
    navigate("/checkout");
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return customerData.firstName && customerData.lastName && customerData.email;
      case 2:
        return selectedItems.length > 0;
      case 3:
        return rentalDates.startDate && rentalDates.endDate;
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new rental booking for the selected items.
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep >= step.number 
                    ? "bg-primary text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? "text-primary" : "text-gray-500"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step.number ? "bg-primary" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={customerData.firstName}
                    onChange={(e) => setCustomerData({ ...customerData, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={customerData.lastName}
                    onChange={(e) => setCustomerData({ ...customerData, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Textarea
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  placeholder="Enter complete delivery address"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">{item.product.category?.name}</p>
                        <p className="text-sm font-medium text-primary">${item.dailyRate}/day</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">×{item.quantity}</div>
                      <div className="text-sm text-gray-500">
                        ${(parseFloat(item.dailyRate) * item.quantity).toFixed(2)}/day
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Rental Dates & Notes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !rentalDates.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rentalDates.startDate ? format(rentalDates.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={rentalDates.startDate}
                        onSelect={(date) => setRentalDates({ ...rentalDates, startDate: date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !rentalDates.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rentalDates.endDate ? format(rentalDates.endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={rentalDates.endDate}
                        onSelect={(date) => setRentalDates({ ...rentalDates, endDate: date })}
                        disabled={(date) => date < (rentalDates.startDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  rows={4}
                />
              </div>

              {rentalDates.startDate && rentalDates.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Rental Summary</h4>
                  <div className="text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{calculateDays()} day{calculateDays() !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Review & Confirm</h3>
              
              {/* Customer Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-700">
                    <div>{customerData.firstName} {customerData.lastName}</div>
                    <div>{customerData.email}</div>
                    {customerData.phone && <div>{customerData.phone}</div>}
                    {customerData.address && <div className="mt-2">{customerData.address}</div>}
                  </div>
                </div>
              </div>

              {/* Rental Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rental Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span>
                        {rentalDates.startDate && format(rentalDates.startDate, "MMM dd")} - {" "}
                        {rentalDates.endDate && format(rentalDates.endDate, "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{calculateDays()} day{calculateDays() !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Items ({selectedItems.length})</h4>
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.product.name}</span>
                        <span className="text-gray-500 ml-2">×{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <div>${(parseFloat(item.dailyRate) * item.quantity * calculateDays()).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          ${item.dailyRate}/day × {item.quantity} × {calculateDays()} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit:</span>
                  <span>${calculateSecurityDeposit().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>${(calculateTotal() + calculateSecurityDeposit()).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 4 ? (
              <Button 
                onClick={handleNextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next Step
              </Button>
            ) : orderCreated ? (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Create Another Order
                </Button>
                <Button 
                  onClick={handleProceedToPayment}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid(currentStep)}
              >
                {isLoading ? "Creating Order..." : "Create Order"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
