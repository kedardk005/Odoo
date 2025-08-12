import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface ProductAvailabilityCheckerProps {
  productId: string;
  productName?: string;
  totalQuantity?: number;
}

interface AvailabilityResult {
  available: boolean;
  availableQuantity: number;
}

export function ProductAvailabilityChecker({ 
  productId, 
  productName,
  totalQuantity 
}: ProductAvailabilityCheckerProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState<number>(1);
  const [checkAvailability, setCheckAvailability] = useState(false);

  const { data: availability, isLoading, error } = useQuery<AvailabilityResult>({
    queryKey: [`/api/products/${productId}/availability`, { startDate, endDate, quantity }],
    enabled: checkAvailability && !!startDate && !!endDate && quantity > 0,
    retry: false,
  });

  const handleCheckAvailability = () => {
    if (startDate && endDate && quantity > 0) {
      setCheckAvailability(true);
    }
  };

  const resetCheck = () => {
    setCheckAvailability(false);
  };

  const isFormValid = startDate && endDate && quantity > 0 && startDate < endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Check Availability</CardTitle>
        {productName && (
          <p className="text-sm text-muted-foreground">
            For: {productName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    resetCheck();
                  }}
                  disabled={(date) => date < new Date() || (endDate && date >= endDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    resetCheck();
                  }}
                  disabled={(date) => date <= new Date() || (startDate && date <= startDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="space-y-2">
          <Label>Quantity Required</Label>
          <Input
            type="number"
            min="1"
            max={totalQuantity || 999}
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value) || 1);
              resetCheck();
            }}
            placeholder="Enter quantity needed"
          />
          {totalQuantity && (
            <p className="text-xs text-muted-foreground">
              Total available: {totalQuantity} units
            </p>
          )}
        </div>

        {/* Check Button */}
        <Button 
          onClick={handleCheckAvailability}
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? 'Checking...' : 'Check Availability'}
        </Button>

        {/* Results */}
        {checkAvailability && !isLoading && (
          <div className="space-y-3">
            {error ? (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error checking availability</p>
                  <p className="text-xs text-destructive/80">Please try again later</p>
                </div>
              </div>
            ) : availability ? (
              <div className={cn(
                "flex items-center gap-2 p-3 border rounded-md",
                availability.available 
                  ? "bg-green-50 border-green-200 text-green-800" 
                  : "bg-red-50 border-red-200 text-red-800"
              )}>
                {availability.available ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {availability.available ? 'Available!' : 'Not Available'}
                  </p>
                  <p className="text-xs">
                    {availability.available 
                      ? `${availability.availableQuantity} units available for your selected dates`
                      : `Only ${availability.availableQuantity} units available (${quantity} requested)`
                    }
                  </p>
                </div>
              </div>
            ) : null}

            {/* Additional Info */}
            {availability && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-muted rounded-md">
                  <div className="text-sm font-medium">Requested</div>
                  <div className="text-lg font-bold">{quantity}</div>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <div className="text-sm font-medium">Available</div>
                  <div className={cn(
                    "text-lg font-bold",
                    availability.available ? "text-green-600" : "text-red-600"
                  )}>
                    {availability.availableQuantity}
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-lg font-bold">
                    {startDate && endDate ? 
                      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
                    } days
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {availability && !availability.available && availability.availableQuantity > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Suggestion:</strong> Consider reducing quantity to {availability.availableQuantity} units 
                  or choosing different dates.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}