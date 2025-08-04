import axios from 'axios'
import posthog from 'posthog-js'
import { 
  DashboardData, 
  Customer, 
  Order, 
  Product, 
  FilterOptions, 
  PaginatedResponse,
  ApiResponse 
} from '@/types'

// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Mock API for development
const isDevelopment = import.meta.env.DEV

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for PostHog tracking
api.interceptors.request.use((config) => {
  posthog.capture('api_request', {
    method: config.method,
    url: config.url,
    timestamp: new Date().toISOString(),
  })
  return config
})

// Response interceptor for error tracking
api.interceptors.response.use(
  (response) => {
    posthog.capture('api_response', {
      method: response.config.method,
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString(),
    })
    return response
  },
  (error) => {
    posthog.capture('api_error', {
      method: error.config?.method,
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString(),
    })
    return Promise.reject(error)
  }
)

// Mock data for development
const mockDashboardData: DashboardData = {
  sales: {
    totalRevenue: 125430.50,
    totalOrders: 1247,
    averageOrderValue: 100.58,
    conversionRate: 3.2,
    revenueChange: 12.5,
    ordersChange: 8.3,
    aovChange: 3.9,
    conversionChange: -0.5,
  },
  customers: {
    totalCustomers: 15420,
    newCustomers: 234,
    activeCustomers: 8920,
    churnedCustomers: 45,
    averageLifetimeValue: 245.30,
    customerAcquisitionCost: 45.20,
    retentionRate: 78.5,
  },
  inventory: {
    totalProducts: 456,
    lowStockProducts: 23,
    outOfStockProducts: 5,
    totalInventoryValue: 234500.00,
    averageStockLevel: 45,
    reorderAlerts: 28,
  },
  marketing: {
    totalSessions: 45678,
    uniqueVisitors: 23456,
    pageViews: 123456,
    bounceRate: 42.3,
    averageSessionDuration: 245,
    topTrafficSources: [
      { source: 'Google', sessions: 15678, conversions: 234, conversionRate: 1.5, revenue: 23450 },
      { source: 'Direct', sessions: 12345, conversions: 189, conversionRate: 1.5, revenue: 18900 },
      { source: 'Facebook', sessions: 9876, conversions: 145, conversionRate: 1.5, revenue: 14500 },
      { source: 'Email', sessions: 5678, conversions: 89, conversionRate: 1.6, revenue: 8900 },
    ],
  },
  recentOrders: [
    {
      id: 'ORD-001',
      customerId: 'CUST-001',
      customer: {
        id: 'CUST-001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-15',
        totalOrders: 5,
        lifetimeValue: 450.00,
        status: 'active',
        tags: ['vip', 'returning'],
      },
      status: 'delivered',
      total: 125.50,
      shippingCost: 12.50,
      taxAmount: 10.25,
      discountAmount: 5.00,
      createdAt: '2024-01-20T10:30:00Z',
      shippedAt: '2024-01-21T14:20:00Z',
      deliveredAt: '2024-01-23T09:15:00Z',
      items: [
        {
          id: 'ITEM-001',
          orderId: 'ORD-001',
          productId: 'PROD-001',
          quantity: 2,
          price: 55.00,
          total: 110.00,
        },
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
    },
  ],
  topProducts: [
    {
      id: 'PROD-001',
      name: 'Premium Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      price: 199.99,
      cost: 120.00,
      stockQuantity: 45,
      reorderPoint: 20,
      createdAt: '2024-01-01',
      status: 'active',
    },
    {
      id: 'PROD-002',
      name: 'Organic Cotton T-Shirt',
      sku: 'TS-001',
      category: 'Clothing',
      price: 29.99,
      cost: 15.00,
      stockQuantity: 120,
      reorderPoint: 50,
      createdAt: '2024-01-01',
      status: 'active',
    },
  ],
  lowStockAlerts: [
    {
      id: 'PROD-003',
      name: 'Smart Watch Pro',
      sku: 'SW-001',
      category: 'Electronics',
      price: 299.99,
      cost: 180.00,
      stockQuantity: 8,
      reorderPoint: 15,
      createdAt: '2024-01-01',
      status: 'active',
    },
  ],
  salesChart: [
    { date: '2024-01-01', value: 12500 },
    { date: '2024-01-02', value: 13200 },
    { date: '2024-01-03', value: 11800 },
    { date: '2024-01-04', value: 14500 },
    { date: '2024-01-05', value: 13800 },
    { date: '2024-01-06', value: 15200 },
    { date: '2024-01-07', value: 16700 },
  ],
  customerChart: [
    { date: '2024-01-01', value: 120 },
    { date: '2024-01-02', value: 135 },
    { date: '2024-01-03', value: 118 },
    { date: '2024-01-04', value: 142 },
    { date: '2024-01-05', value: 156 },
    { date: '2024-01-06', value: 168 },
    { date: '2024-01-07', value: 189 },
  ],
  funnel: [
    { step: 'Page View', count: 45678, conversionRate: 100, dropoffRate: 0 },
    { step: 'Add to Cart', count: 2345, conversionRate: 5.1, dropoffRate: 94.9 },
    { step: 'Checkout', count: 1456, conversionRate: 3.2, dropoffRate: 37.9 },
    { step: 'Purchase', count: 1247, conversionRate: 2.7, dropoffRate: 14.3 },
  ],
  cohorts: [
    {
      cohort: 'Jan 2024',
      size: 1200,
      retention: [100, 85, 72, 68, 65, 62, 60],
      revenue: [12000, 10200, 8640, 8160, 7800, 7440, 7200],
    },
  ],
}

// API functions
export const dashboardApi = {
  // Get dashboard overview data
  getDashboardData: async (filters?: FilterOptions): Promise<ApiResponse<DashboardData>> => {
    try {
      // In production, this would be a real API call
      // const response = await api.get('/dashboard', { params: filters })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      posthog.capture('dashboard_viewed', {
        filters,
        timestamp: new Date().toISOString(),
      })
      
      return {
        data: mockDashboardData,
        success: true,
      }
    } catch (error) {
      return {
        data: mockDashboardData,
        success: false,
        error: 'Failed to fetch dashboard data',
      }
    }
  },

  // Get customers with pagination
  getCustomers: async (page = 1, limit = 20, filters?: FilterOptions): Promise<PaginatedResponse<Customer>> => {
    try {
      // Mock customer data
      const mockCustomers: Customer[] = Array.from({ length: 100 }, (_, i) => ({
        id: `CUST-${String(i + 1).padStart(3, '0')}`,
        email: `customer${i + 1}@example.com`,
        firstName: `Customer`,
        lastName: `${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalOrders: Math.floor(Math.random() * 20) + 1,
        lifetimeValue: Math.random() * 1000,
        status: ['active', 'inactive', 'churned'][Math.floor(Math.random() * 3)] as any,
        tags: ['vip', 'returning', 'new'].slice(0, Math.floor(Math.random() * 3) + 1),
      }))

      const start = (page - 1) * limit
      const end = start + limit
      const data = mockCustomers.slice(start, end)

      return {
        data,
        pagination: {
          page,
          limit,
          total: mockCustomers.length,
          totalPages: Math.ceil(mockCustomers.length / limit),
        },
      }
    } catch (error) {
      throw new Error('Failed to fetch customers')
    }
  },

  // Get orders with pagination
  getOrders: async (page = 1, limit = 20, filters?: FilterOptions): Promise<PaginatedResponse<Order>> => {
    try {
      // Mock order data
      const mockOrders: Order[] = Array.from({ length: 100 }, (_, i) => ({
        id: `ORD-${String(i + 1).padStart(3, '0')}`,
        customerId: `CUST-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
        status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)] as any,
        total: Math.random() * 500 + 50,
        shippingCost: Math.random() * 20 + 5,
        taxAmount: Math.random() * 30 + 5,
        discountAmount: Math.random() * 20,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [],
        shippingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        billingAddress: {
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      }))

      const start = (page - 1) * limit
      const end = start + limit
      const data = mockOrders.slice(start, end)

      return {
        data,
        pagination: {
          page,
          limit,
          total: mockOrders.length,
          totalPages: Math.ceil(mockOrders.length / limit),
        },
      }
    } catch (error) {
      throw new Error('Failed to fetch orders')
    }
  },

  // Get KPI data for dashboard
  getKPIs: async (): Promise<DashboardData> => {
    try {
      // Return the mock dashboard data for development
      if (isDevelopment) {
        return mockDashboardData
      }
      
      // For production, make actual API call
      const response = await api.get('/kpis')
      return response.data
    } catch (error) {
      console.error('Failed to fetch KPIs:', error)
      // Fallback to mock data
      return mockDashboardData
    }
  },

  // Get products with pagination
  getProducts: async (page = 1, limit = 20, filters?: FilterOptions): Promise<PaginatedResponse<Product>> => {
    try {
      // Mock product data
      const mockProducts: Product[] = Array.from({ length: 100 }, (_, i) => ({
        id: `PROD-${String(i + 1).padStart(3, '0')}`,
        name: `Product ${i + 1}`,
        sku: `SKU-${String(i + 1).padStart(3, '0')}`,
        category: ['Electronics', 'Clothing', 'Home', 'Books'][Math.floor(Math.random() * 4)],
        price: Math.random() * 200 + 20,
        cost: Math.random() * 100 + 10,
        stockQuantity: Math.floor(Math.random() * 100),
        reorderPoint: Math.floor(Math.random() * 20) + 10,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['active', 'inactive', 'discontinued'][Math.floor(Math.random() * 3)] as any,
      }))

      const start = (page - 1) * limit
      const end = start + limit
      const data = mockProducts.slice(start, end)

      return {
        data,
        pagination: {
          page,
          limit,
          total: mockProducts.length,
          totalPages: Math.ceil(mockProducts.length / limit),
        },
      }
    } catch (error) {
      throw new Error('Failed to fetch products')
    }
  },
}

export default api 