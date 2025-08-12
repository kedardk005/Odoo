import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MenuIcon, 
  X, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useLocation } from "wouter";

interface NavigationHeaderProps {
  userType?: "admin" | "customer";
}

export default function NavigationHeader({ userType = "admin" }: NavigationHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Update cart count when storage changes
  useEffect(() => {
    const updateCartCount = () => {
      if (userType === "customer") {
        try {
          const cart = JSON.parse(localStorage.getItem("rentalCart") || "[]");
          setCartItemCount(cart.length);
        } catch {
          setCartItemCount(0);
        }
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    
    return () => window.removeEventListener("storage", updateCartCount);
  }, [userType]);

  const adminMenuItems = [
    { label: "Dashboard", path: "/admin", icon: Home },
    { label: "Products", path: "/admin/products", icon: Package },
    { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Booking", path: "/admin/booking", icon: Calendar },
    { label: "Quotations", path: "/admin/quotations", icon: FileText },
    { label: "Pricing", path: "/admin/pricing", icon: DollarSign },
  ];

  const customerMenuItems = [
    { label: "Home", path: "/customer/home", icon: Home },
    { label: "Products", path: "/customer/products", icon: Package },
    { label: "My Orders", path: "/customer/orders", icon: ShoppingCart },
    { label: "Quotations", path: "/customer/quotations", icon: FileText },
    { label: "Profile", path: "/customer/profile", icon: User },
  ];

  const menuItems = userType === "admin" ? adminMenuItems : customerMenuItems;
  const currentPath = window.location.pathname;

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user data from storage
      try {
        localStorage.removeItem("userId");
        sessionStorage.removeItem("userId");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
      
      // Redirect to landing page
      setLocation("/");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(userType === "admin" ? "/admin" : "/customer/home")}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            >
              RentPro
            </button>
            {userType === "admin" && (
              <Badge variant="secondary" className="ml-2">
                Admin
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                (item.path === "/admin" && currentPath === "/admin/home");
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button for Customers */}
            {userType === "customer" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleNavigation("/customer/cart")}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartItemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {userType === "admin" ? "Admin" : "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleNavigation(userType === "admin" ? "/profile" : "/customer/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {userType === "admin" && (
                  <DropdownMenuItem onClick={() => handleNavigation("/admin/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <MenuIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
              
              {/* Cart Button for Mobile - Customers */}
              {userType === "customer" && (
                <button
                  onClick={() => handleNavigation("/customer/cart")}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 relative"
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </button>
              )}
              
              <div className="border-t pt-4">
                <button
                  onClick={() => handleNavigation(userType === "admin" ? "/profile" : "/customer/profile")}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </button>
                
                {userType === "admin" && (
                  <button
                    onClick={() => handleNavigation("/admin/settings")}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}