import { apiRequest } from "./queryClient";
import type { 
  User, 
  Product, 
  ProductWithCategory, 
  Category, 
  OrderWithDetails, 
  Delivery, 
  Payment, 
  Notification,
  DashboardMetrics 
} from "@shared/schema";

export const api = {
  // User/Auth endpoints
  async register(userData: any): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  async login(credentials: { email: string; password: string }): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  },

  async getRecentOrders(): Promise<OrderWithDetails[]> {
    const response = await apiRequest("GET", "/api/dashboard/recent-orders");
    return response.json();
  },

  // Product endpoints
  async getProducts(categoryId?: string): Promise<ProductWithCategory[]> {
    const url = categoryId ? `/api/products?categoryId=${categoryId}` : "/api/products";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async getProduct(id: string): Promise<ProductWithCategory> {
    const response = await apiRequest("GET", `/api/products/${id}`);
    return response.json();
  },

  async createProduct(productData: any): Promise<Product> {
    const response = await apiRequest("POST", "/api/products", productData);
    return response.json();
  },

  async updateProduct(id: string, productData: any): Promise<Product> {
    const response = await apiRequest("PUT", `/api/products/${id}`, productData);
    return response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/products/${id}`);
  },

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await apiRequest("GET", "/api/categories");
    return response.json();
  },

  async createCategory(categoryData: any): Promise<Category> {
    const response = await apiRequest("POST", "/api/categories", categoryData);
    return response.json();
  },

  // Order endpoints
  async getOrders(): Promise<OrderWithDetails[]> {
    const response = await apiRequest("GET", "/api/orders");
    return response.json();
  },

  async getOrder(id: string): Promise<OrderWithDetails> {
    const response = await apiRequest("GET", `/api/orders/${id}`);
    return response.json();
  },

  async createOrder(orderData: any): Promise<any> {
    const response = await apiRequest("POST", "/api/orders", orderData);
    return response.json();
  },

  async updateOrderStatus(id: string, status: string): Promise<any> {
    const response = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    return response.json();
  },

  // Customer endpoints
  async getCustomers(): Promise<User[]> {
    const response = await apiRequest("GET", "/api/customers");
    return response.json();
  },

  async addCustomer(data: Partial<User>): Promise<User> {
    const response = await apiRequest("POST", "/api/customers", data);
    return response.json();
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/customers/${id}`);
  },

  // Delivery endpoints
  async getDeliveries(orderId?: string): Promise<Delivery[]> {
    const url = orderId ? `/api/deliveries?orderId=${orderId}` : "/api/deliveries";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async createDelivery(deliveryData: any): Promise<Delivery> {
    const response = await apiRequest("POST", "/api/deliveries", deliveryData);
    return response.json();
  },

  async updateDeliveryStatus(id: string, status: string): Promise<Delivery> {
    const response = await apiRequest("PUT", `/api/deliveries/${id}/status`, { status });
    return response.json();
  },

  // Payment endpoints
  async getPayments(orderId?: string): Promise<Payment[]> {
    const url = orderId ? `/api/payments?orderId=${orderId}` : "/api/payments";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  async createPayment(paymentData: any): Promise<Payment> {
    const response = await apiRequest("POST", "/api/payments", paymentData);
    return response.json();
  },

  // Razorpay payment endpoints
  async createRazorpayOrder(orderData: any): Promise<any> {
    const response = await apiRequest("POST", "/api/razorpay/create-order", orderData);
    return response.json();
  },

  async verifyRazorpayPayment(verificationData: any): Promise<any> {
    const response = await apiRequest("POST", "/api/razorpay/verify-payment", verificationData);
    return response.json();
  },

  // Notification endpoints
  async getNotifications(userId: string): Promise<Notification[]> {
    const response = await apiRequest("GET", `/api/notifications/${userId}`);
    return response.json();
  },

  async createNotification(notificationData: any): Promise<Notification> {
    const response = await apiRequest("POST", "/api/notifications", notificationData);
    return response.json();
  },

  async markNotificationRead(id: string): Promise<Notification> {
    const response = await apiRequest("PUT", `/api/notifications/${id}/read`);
    return response.json();
  },
};