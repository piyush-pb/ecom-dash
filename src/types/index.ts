// Core data types for the e-commerce analytics dashboard

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  createdAt: string
  lastOrderAt?: string
  totalOrders: number
  lifetimeValue: number
  acquisitionSource?: string
  status: 'active' | 'inactive' | 'churned'
  tags: string[]
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  cost: number
  stockQuantity: number
  reorderPoint: number
  supplierId?: string
  createdAt: string
  status: 'active' | 'inactive' | 'discontinued'
  imageUrl?: string
}

export interface Order {
  id: string
  customerId: string
  customer?: Customer
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  total: number
  shippingCost: number
  taxAmount: number
  discountAmount: number
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  price: number
  total: number
}

export interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  revenueChange: number
  ordersChange: number
  aovChange: number
  conversionChange: number
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  churnedCustomers: number
  averageLifetimeValue: number
  customerAcquisitionCost: number
  retentionRate: number
}

export interface InventoryMetrics {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalInventoryValue: number
  averageStockLevel: number
  reorderAlerts: number
}

export interface MarketingMetrics {
  totalSessions: number
  uniqueVisitors: number
  pageViews: number
  bounceRate: number
  averageSessionDuration: number
  topTrafficSources: TrafficSource[]
}

export interface TrafficSource {
  source: string
  sessions: number
  conversions: number
  conversionRate: number
  revenue: number
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface FunnelStep {
  step: string
  count: number
  conversionRate: number
  dropoffRate: number
}

export interface CohortData {
  cohort: string
  size: number
  retention: number[]
  revenue: number[]
}

export interface DashboardData {
  sales: SalesMetrics
  customers: CustomerMetrics
  inventory: InventoryMetrics
  marketing: MarketingMetrics
  recentOrders: Order[]
  topProducts: Product[]
  lowStockAlerts: Product[]
  salesChart: ChartDataPoint[]
  customerChart: ChartDataPoint[]
  funnel: FunnelStep[]
  cohorts: CohortData[]
}

export interface FilterOptions {
  dateRange: {
    start: string
    end: string
  }
  categories?: string[]
  status?: string[]
  search?: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// PostHog event types
export interface PostHogEvent {
  event: string
  properties: Record<string, any>
  timestamp?: string
  distinctId?: string
}

// Excel export types
export interface ExcelExportOptions {
  sheetName: string
  data: any[]
  columns: {
    header: string
    key: string
    width?: number
  }[]
  fileName: string
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  currency: string
  dateFormat: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    defaultDateRange: string
    autoRefresh: boolean
    refreshInterval: number
  }
} 