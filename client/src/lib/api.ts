import { apiRequest } from "@/lib/queryClient";
import type { DashboardMetrics, OrderWithDetails, ProductWithCategory, Category, User, Delivery, Payment, Notification } from "@shared/schema";

export const api = {
  // Dashboard
  getDashboardMetrics: () => 
    apiRequest("GET", "/api/dashboard/metrics").then(res => res.json()) as Promise<DashboardMetrics>,
  
  getRecentOrders: (limit?: number) =>
    apiRequest("GET", `/api/dashboard/recent-orders${limit ? `?limit=${limit}` : ""}`).then(res => res.json()) as Promise<OrderWithDetails[]>,

  // Products
  getProducts: (categoryId?: string) =>
    apiRequest("GET", `/api/products${categoryId ? `?categoryId=${categoryId}` : ""}`).then(res => res.json()) as Promise<ProductWithCategory[]>,
  
  getProduct: (id: string) =>
    apiRequest("GET", `/api/products/${id}`).then(res => res.json()) as Promise<ProductWithCategory>,

  createProduct: (product: any) =>
    apiRequest("POST", "/api/products", product).then(res => res.json()),

  updateProduct: (id: string, product: any) =>
    apiRequest("PUT", `/api/products/${id}`, product).then(res => res.json()),

  // Categories
  getCategories: () =>
    apiRequest("GET", "/api/categories").then(res => res.json()) as Promise<Category[]>,

  createCategory: (category: any) =>
    apiRequest("POST", "/api/categories", category).then(res => res.json()),

  // Orders
  getOrders: (customerId?: string) =>
    apiRequest("GET", `/api/orders${customerId ? `?customerId=${customerId}` : ""}`).then(res => res.json()) as Promise<OrderWithDetails[]>,
  
  getOrder: (id: string) =>
    apiRequest("GET", `/api/orders/${id}`).then(res => res.json()) as Promise<OrderWithDetails>,

  createOrder: (order: any) =>
    apiRequest("POST", "/api/orders", order).then(res => res.json()),

  updateOrderStatus: (id: string, status: string) =>
    apiRequest("PUT", `/api/orders/${id}/status`, { status }).then(res => res.json()),

  // Customers
  getCustomers: () =>
    apiRequest("GET", "/api/customers").then(res => res.json()) as Promise<User[]>,

  // Deliveries
  getDeliveries: (orderId?: string) =>
    apiRequest("GET", `/api/deliveries${orderId ? `?orderId=${orderId}` : ""}`).then(res => res.json()) as Promise<Delivery[]>,

  createDelivery: (delivery: any) =>
    apiRequest("POST", "/api/deliveries", delivery).then(res => res.json()),

  updateDeliveryStatus: (id: string, status: string) =>
    apiRequest("PUT", `/api/deliveries/${id}/status`, { status }).then(res => res.json()),

  // Payments
  getPayments: (orderId?: string) =>
    apiRequest("GET", `/api/payments${orderId ? `?orderId=${orderId}` : ""}`).then(res => res.json()) as Promise<Payment[]>,

  createPayment: (payment: any) =>
    apiRequest("POST", "/api/payments", payment).then(res => res.json()),

  // Notifications
  getNotifications: (userId: string) =>
    apiRequest("GET", `/api/notifications/${userId}`).then(res => res.json()) as Promise<Notification[]>,

  createNotification: (notification: any) =>
    apiRequest("POST", "/api/notifications", notification).then(res => res.json()),

  markNotificationRead: (id: string) =>
    apiRequest("PUT", `/api/notifications/${id}/read`).then(res => res.json()),

  // Auth
  register: (user: any) =>
    apiRequest("POST", "/api/auth/register", user).then(res => res.json()),

  login: (credentials: { email: string; password: string }) =>
    apiRequest("POST", "/api/auth/login", credentials).then(res => res.json()),
};
