import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Eye,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  Search
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { dashboardApi } from '@/services/api'
import { DashboardData, Order, Product } from '@/types'
import { formatCurrency, formatNumber, formatPercentage, formatDate, getStatusBadge, getStatusColor } from '@/utils'
import { trackDashboardInteraction } from '@/services/posthog'
import { exportDashboardData } from '@/utils/exportUtils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)

  const { data: dashboardData, error, refetch } = useQuery<DashboardData>(
    ['dashboard', dateRange],
    () => dashboardApi.getDashboardData({ dateRange: { start: '', end: '' } }).then(res => res.data),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000,
    }
  )

  useEffect(() => {
    if (dashboardData) {
      setIsLoading(false)
      trackDashboardInteraction('dashboard', 'viewed', { dateRange })
    }
  }, [dashboardData, dateRange])

  const handleMetricClick = (metric: string) => {
    trackDashboardInteraction('metric', 'clicked', { metric })
  }

  const handleChartInteraction = (chart: string, action: string) => {
    trackDashboardInteraction('chart', action, { chart })
  }

  const handleExport = () => {
    if (dashboardData) {
      exportDashboardData(dashboardData, dateRange)
      trackDashboardInteraction('dashboard', 'exported', { dateRange })
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading dashboard</h3>
          <p className="text-gray-500">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const { sales, customers, inventory, marketing, recentOrders, topProducts, lowStockAlerts, salesChart, customerChart, funnel } = dashboardData

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Real-time overview of your e-commerce performance</p>
          </div>
          
          {/* Search bar */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-28 text-sm"
          >
            <option value="1d">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => refetch()}
            className="btn btn-primary btn-sm"
          >
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn btn-secondary btn-sm flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(sales.totalRevenue)}
          change={sales.revenueChange}
          icon={DollarSign}
          color="primary"
          onClick={() => handleMetricClick('revenue')}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(sales.totalOrders)}
          change={sales.ordersChange}
          icon={ShoppingCart}
          color="success"
          onClick={() => handleMetricClick('orders')}
        />
        <MetricCard
          title="Average Order Value"
          value={formatCurrency(sales.averageOrderValue)}
          change={sales.aovChange}
          icon={TrendingUp}
          color="warning"
          onClick={() => handleMetricClick('aov')}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(sales.conversionRate)}
          change={sales.conversionChange}
          icon={Eye}
          color="danger"
          onClick={() => handleMetricClick('conversion')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales Trend</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Revenue</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 'USD').replace('$', '')}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Customer Growth</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">New Customers</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'New Customers']}
                  labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Traffic Sources & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Traffic Sources</h3>
          </div>
          <div className="space-y-4">
            {marketing.topTrafficSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(source.sessions)}</div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(source.conversionRate)} conversion
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Conversion Funnel</h3>
          </div>
          <div className="space-y-4">
            {funnel.map((step, index) => (
              <div key={step.step} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{step.step}</span>
                  <span className="text-sm text-gray-500">
                    {formatNumber(step.count)} ({formatPercentage(step.conversionRate)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step.conversionRate}%` }}
                  />
                </div>
                {index < funnel.length - 1 && (
                  <div className="text-xs text-gray-400 text-center">
                    ↓ {formatPercentage(funnel[index + 1].dropoffRate)} dropoff
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(order.total)}</div>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Alerts</h3>
            <span className="badge badge-warning">{lowStockAlerts.length}</span>
          </div>
          <div className="space-y-4">
            {lowStockAlerts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-red-600">
                    {product.stockQuantity} left
                  </div>
                  <div className="text-sm text-gray-500">
                    Reorder: {product.reorderPoint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer & Inventory Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Customers"
          value={formatNumber(customers.totalCustomers)}
          subtitle={`${formatNumber(customers.newCustomers)} new this period`}
          icon={Users}
          color="success"
        />
        <MetricCard
          title="Active Products"
          value={formatNumber(inventory.totalProducts)}
          subtitle={`${formatNumber(inventory.lowStockProducts)} low stock`}
          icon={Package}
          color="warning"
        />
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(inventory.totalInventoryValue)}
          subtitle={`${formatNumber(inventory.averageStockLevel)} avg stock level`}
          icon={TrendingUp}
          color="primary"
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change?: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'danger'
  onClick?: () => void
}

function MetricCard({ title, value, change, subtitle, icon: Icon, color, onClick }: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger: 'text-danger-600 bg-danger-50',
  }

  return (
    <div 
      className={`metric-card cursor-pointer transition-all duration-200 hover:shadow-lg ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-600 mr-1" />
              )}
              <span className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
                {change >= 0 ? '+' : ''}{formatPercentage(change)}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
} 