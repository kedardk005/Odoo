import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Landing Page
import Landing from "@/pages/landing";
import Signup from "@/pages/signup";

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
import ProductDetails from "@/pages/customer/product-details";
import QuotationRequest from "@/pages/customer/quotation-request";

// New Admin Pages
import AdminQuotations from "@/pages/admin/quotations";
import AdminPricing from "@/pages/admin/pricing";

function Router() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Landing} />
      <Route path="/signup" component={Signup} />
      
      {/* Admin Routes */}
      <Route path="/admin/home" component={AdminHome} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/products" component={Products} />
      <Route path="/admin/orders" component={Orders} />
      <Route path="/admin/customers" component={Customers} />
      <Route path="/admin/quotations" component={AdminQuotations} />
      <Route path="/admin/pricing" component={AdminPricing} />
      <Route path="/admin/booking" component={Booking} />
      <Route path="/admin/checkout" component={Checkout} />
      
      {/* Customer Routes */}
      <Route path="/customer/home" component={CustomerHome} />
      <Route path="/customer/products" component={CustomerProducts} />
      <Route path="/customer/products/:id" component={ProductDetails} />
      <Route path="/customer/cart" component={CustomerCart} />
      <Route path="/customer/quotation" component={QuotationRequest} />
      <Route path="/customer/checkout" component={CustomerCheckout} />
      
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
