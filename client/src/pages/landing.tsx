import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  Users, 
  Settings,
  Eye,
  EyeOff 
} from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "customer"
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginData.role === "admin") {
      setLocation("/admin/dashboard");
    } else {
      setLocation("/customer/products");
    }
  };

  const features = [
    {
      icon: Package,
      title: "Equipment Rental",
      description: "Wide range of professional equipment for rent"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment processing with Razorpay"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs"
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "All equipment is regularly maintained and tested"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">RentPro</h1>
            </div>
            <Badge variant="secondary">Professional Rental Management</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">
                Professional Equipment Rental Platform
              </h2>
              <p className="text-xl text-gray-600">
                Streamline your rental business with our comprehensive management system. 
                Perfect for equipment rental companies and customers alike.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Equipment Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome to RentPro</CardTitle>
                <p className="text-gray-600">Sign in to access your account</p>
              </CardHeader>
              <CardContent>
                <Tabs value={loginData.role} onValueChange={(value) => setLoginData({...loginData, role: value})}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="customer" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Customer</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Browse and rent professional equipment for your projects
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="admin" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Manage inventory, orders, customers, and business analytics
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Sign In as {loginData.role === "admin" ? "Admin" : "Customer"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Demo credentials: Use any email and password
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 RentPro. Professional Equipment Rental Management System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}