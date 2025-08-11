import { useState, useEffect } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Home,
  Search
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface NavigationHeaderProps {
  userType: "customer" | "admin";
  currentUser?: {
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
}

export default function NavigationHeader({ userType, currentUser }: NavigationHeaderProps) {
  const [, setLocation] = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);

  // Get cart count for customers
  React.useEffect(() => {
    if (userType === "customer") {
      const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
        setCartItemCount(cart.length);
      };

      updateCartCount();
      window.addEventListener("storage", updateCartCount);
      return () => window.removeEventListener("storage", updateCartCount);
    }
  }, [userType]);

  // Get notifications count
  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications", currentUser?.email || "guest"],
    queryFn: () => api.getNotifications(currentUser?.email || "guest"),
    enabled: !!currentUser
  });

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  const getUserInitials = () => {
    if (!currentUser) return "GU";
    return `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();
  };

  const getFullName = () => {
    if (!currentUser) return "Guest User";
    return `${currentUser.firstName} ${currentUser.lastName}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <button
                onClick={() => setLocation(userType === "customer" ? "/customer/home" : "/admin/home")}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                RentPro
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-6">
              {userType === "customer" ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/customer/home")}
                    className="flex items-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/customer/products")}
                    className="flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Equipment</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/admin/home")}
                    className="flex items-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/admin/products")}
                    className="flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>Products</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/admin/orders")}
                    className="flex items-center space-x-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Orders</span>
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Customer Cart */}
            {userType === "customer" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/customer/cart")}
                className="relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs"
                    variant="destructive"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs"
                  variant="destructive"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={currentUser?.profileImageUrl} 
                      alt={getFullName()} 
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Welcome, {currentUser?.firstName || "Guest"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || "guest@example.com"}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs mt-1">
                      {userType === "customer" ? "Customer" : "Admin"} Account
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {userType === "customer" ? (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/customer/home")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/customer/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/customer/cart")}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Cart ({cartItemCount})</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setLocation("/admin/dashboard")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/admin/products")}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Manage Products</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/admin/customers")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Customers</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}