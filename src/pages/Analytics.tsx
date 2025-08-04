import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { dashboardApi } from '@/services/api'
import { DashboardData } from '@/types'
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/utils'
import { trackDashboardInteraction } from '@/services/posthog'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [chartType, setChartType] = useState('line')

  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>(
    ['analytics', dateRange],
    () => dashboardApi.getDashboardData({ dateRange: { start: '', end: '' } }).then(res => res.data),
    {
      refetchInterval: 60000, // Refetch every minute
      staleTime: 30000,
    }
  )

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric)
    trackDashboardInteraction('analytics_metric', 'changed', { metric })
    // Force refetch to update chart data
    refetch()
  }

  const handleExport = () => {
    try {
      if (dashboardData) {
        import('@/utils/exportUtils').then(({ exportDashboardData }) => {
          exportDashboardData(dashboardData, dateRange)
        })
        trackDashboardInteraction('analytics', 'exported', { 
          dateRange, 
          metric: selectedMetric,
          recordCount: 1
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const { sales, customers, marketing, salesChart, customerChart, funnel, cohorts } = dashboardData

  // Dynamic chart data based on selected metric
  const getChartData = () => {
    const baseData = salesChart || []
    switch (selectedMetric) {
      case 'revenue':
        return baseData.map(item => ({ ...item, value: (item as any).revenue || item.value }))
      case 'orders':
        return baseData.map(item => ({ ...item, value: (item as any).orders || item.value }))
      case 'customers':
        return baseData.map(item => ({ ...item, value: (item as any).customers || item.value }))
      case 'conversion':
        return baseData.map(item => ({ ...item, value: (item as any).conversion || item.value }))
      default:
        return baseData
    }
  }

  const chartData = getChartData()

  // Mock cohort data for demonstration
  const cohortData = [
    { month: 'Jan', cohort: 100, m1: 85, m2: 72, m3: 68, m4: 65, m5: 62, m6: 60 },
    { month: 'Feb', cohort: 120, m1: 90, m2: 78, m3: 72, m4: 68, m5: 65, m6: 62 },
    { month: 'Mar', cohort: 95, m1: 82, m2: 70, m3: 65, m4: 62, m5: 59, m6: 57 },
    { month: 'Apr', cohort: 110, m1: 88, m2: 75, m3: 70, m4: 67, m5: 64, m6: 61 },
    { month: 'May', cohort: 105, m1: 86, m2: 73, m3: 68, m4: 65, m5: 62, m6: 60 },
    { month: 'Jun', cohort: 115, m1: 92, m2: 78, m3: 73, m4: 70, m5: 67, m6: 64 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Deep dive into your business performance and customer behavior</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary btn-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">{formatCurrency(sales.totalRevenue)}</p>
              <p className="text-sm text-success-600 mt-1">
                +{formatPercentage(sales.revenueChange)} vs last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary-50">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Customers</p>
              <p className="metric-value">{formatNumber(customers.totalCustomers)}</p>
              <p className="text-sm text-success-600 mt-1">
                +{formatNumber(customers.newCustomers)} new customers
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success-50">
              <Users className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Conversion Rate</p>
              <p className="metric-value">{formatPercentage(sales.conversionRate)}</p>
              <p className="text-sm text-danger-600 mt-1">
                {formatPercentage(sales.conversionChange)} vs last period
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning-50">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Avg Session Duration</p>
              <p className="metric-value">{Math.floor(marketing.averageSessionDuration / 60)}m {marketing.averageSessionDuration % 60}s</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatNumber(marketing.totalSessions)} total sessions
              </p>
            </div>
            <div className="p-3 rounded-lg bg-info-50">
              <Calendar className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="card-title">Performance Trends</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                className="input w-32"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="customers">Customers</option>
                <option value="conversion">Conversion</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Chart:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="input w-24"
              >
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis 
                  tickFormatter={(value) => selectedMetric === 'revenue' 
                    ? formatCurrency(value, 'USD').replace('$', '') 
                    : formatNumber(value)
                  }
                />
                <Tooltip 
                  formatter={(value: number) => [
                    selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value), 
                    selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                  ]}
                  labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            ) : chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis 
                  tickFormatter={(value) => selectedMetric === 'revenue' 
                    ? formatCurrency(value, 'USD').replace('$', '') 
                    : formatNumber(value)
                  }
                />
                <Tooltip 
                  formatter={(value: number) => [
                    selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value), 
                    selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                  ]}
                  labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                />
                <YAxis 
                  tickFormatter={(value) => selectedMetric === 'revenue' 
                    ? formatCurrency(value, 'USD').replace('$', '') 
                    : formatNumber(value)
                  }
                />
                <Tooltip 
                  formatter={(value: number) => [
                    selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value), 
                    selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
                  ]}
                  labelFormatter={(label) => formatDate(label, 'MMM dd, yyyy')}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Cohort Analysis</h3>
          <p className="text-sm text-gray-500">Customer retention by acquisition month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Size</th>
                <th>M1</th>
                <th>M2</th>
                <th>M3</th>
                <th>M4</th>
                <th>M5</th>
                <th>M6</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.month}>
                  <td className="font-medium">{cohort.month}</td>
                  <td>{cohort.cohort}</td>
                  <td className={getCohortCellClass(cohort.m1 / cohort.cohort)}>
                    {formatPercentage((cohort.m1 / cohort.cohort) * 100)}
                  </td>
                  <td className={getCohortCellClass(cohort.m2 / cohort.cohort)}>
                    {formatPercentage((cohort.m2 / cohort.cohort) * 100)}
                  </td>
                  <td className={getCohortCellClass(cohort.m3 / cohort.cohort)}>
                    {formatPercentage((cohort.m3 / cohort.cohort) * 100)}
                  </td>
                  <td className={getCohortCellClass(cohort.m4 / cohort.cohort)}>
                    {formatPercentage((cohort.m4 / cohort.cohort) * 100)}
                  </td>
                  <td className={getCohortCellClass(cohort.m5 / cohort.cohort)}>
                    {formatPercentage((cohort.m5 / cohort.cohort) * 100)}
                  </td>
                  <td className={getCohortCellClass(cohort.m6 / cohort.cohort)}>
                    {formatPercentage((cohort.m6 / cohort.cohort) * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traffic Sources & Funnel Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Traffic Sources Performance</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketing.topTrafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ source, sessions }) => `${source}: ${formatNumber(sessions)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sessions"
                >
                  {marketing.topTrafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatNumber(value), 
                    `${name} Sessions`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Conversion Funnel Analysis</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="step" type="category" width={100} />
                <Tooltip 
                  formatter={(value: number) => [formatNumber(value), 'Users']}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Behavior Metrics */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Customer Behavior Metrics</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {formatCurrency(customers.averageLifetimeValue)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Average Customer LTV</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600">
              {formatPercentage(customers.retentionRate)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Customer Retention Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600">
              {formatCurrency(customers.customerAcquisitionCost)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Customer Acquisition Cost</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCohortCellClass(retentionRate: number): string {
  if (retentionRate >= 0.8) return 'text-success-600 font-medium'
  if (retentionRate >= 0.6) return 'text-warning-600 font-medium'
  return 'text-danger-600 font-medium'
} 