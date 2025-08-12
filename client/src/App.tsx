import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Landing Page
import Landing from "@/pages/landing";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import TestCart from "@/pages/test-cart";
import TestRazorpay from "@/pages/test-razorpay";
import PaymentSuccess from "@/pages/customer/payment-success";
import PaymentFailed from "@/pages/customer/payment-failed";

// Admin Pages
import AdminHome from "@/pages/admin/home";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Customers from "@/pages/customers";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";

// Customer Pages
import CustomerHome from "@/pages/customer/home";
import CustomerProducts from "@/pages/customer/products";
import CustomerCart from "@/pages/customer/cart";
import CustomerCheckout from "@/pages/customer/checkout";
import CustomerOrders from "@/pages/customer/orders";
import CustomerQuotations from "@/pages/customer/quotations";
import ProductDetails from "@/pages/customer/product-details";
import QuotationRequest from "@/pages/customer/quotation-request";

// Profile Page
import Profile from "@/pages/profile";

// New Admin Pages
import AdminQuotations from "@/pages/admin/quotations";
import AdminPricing from "@/pages/admin/pricing";
import { EnhancedAdminDashboard } from "@/pages/admin/enhanced-dashboard";
import { EnhancedProductsPage } from "@/pages/admin/enhanced-products";

function Router() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Landing} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminHome} />
      <Route path="/admin/home" component={AdminHome} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/enhanced-dashboard" component={EnhancedAdminDashboard} />
      <Route path="/admin/products" component={Products} />
      <Route path="/admin/enhanced-products" component={EnhancedProductsPage} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/customers" component={Customers} />
      <Route path="/admin/quotations" component={AdminQuotations} />
      <Route path="/admin/pricing" component={AdminPricing} />
      <Route path="/admin/booking" component={Booking} />
      <Route path="/admin/checkout" component={Checkout} />
      
      {/* Customer Routes */}
      <Route path="/customer" component={CustomerHome} />
      <Route path="/customer/home" component={CustomerHome} />
      <Route path="/customer/products" component={CustomerProducts} />
      <Route path="/customer/products/:id" component={ProductDetails} />
      <Route path="/customer/orders" component={CustomerOrders} />
      <Route path="/customer/quotations" component={CustomerQuotations} />
      <Route path="/customer/cart" component={CustomerCart} />
      <Route path="/customer/quotation" component={QuotationRequest} />
      <Route path="/customer/checkout" component={CustomerCheckout} />
      <Route path="/customer/payment-success" component={PaymentSuccess} />
      <Route path="/customer/payment-failed" component={PaymentFailed} />
      <Route path="/customer/profile" component={Profile} />
      
      {/* Profile Routes */}
      <Route path="/profile" component={Profile} />
      
      {/* Public Product Routes */}
      <Route path="/products" component={CustomerProducts} />
      <Route path="/products/:id" component={ProductDetails} />
      
      {/* Test Routes */}
      <Route path="/test-cart" component={TestCart} />
      <Route path="/test-razorpay" component={TestRazorpay} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
