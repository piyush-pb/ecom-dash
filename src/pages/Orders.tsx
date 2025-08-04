import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { Order, PaginatedResponse } from '@/types'
import { formatCurrency, formatNumber, formatDate, formatRelativeTime, getStatusBadge, getStatusColor } from '@/utils'
import { trackDashboardInteraction } from '@/services/posthog'

export default function Orders() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)

  const { data: ordersData, isLoading, refetch } = useQuery<PaginatedResponse<Order>>(
    ['orders', page, searchTerm, statusFilter, dateFilter, sortBy, sortOrder],
    () => dashboardApi.getOrders(page, 20, {
      search: searchTerm,
      status: statusFilter !== 'all' ? [statusFilter] : undefined,
      dateRange: { start: '', end: '' }
    }),
    {
      keepPreviousData: true,
    }
  )

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
    trackDashboardInteraction('orders', 'searched', { searchTerm: value })
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
    trackDashboardInteraction('orders', 'filtered', { status })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    trackDashboardInteraction('orders', 'sorted', { field, order: sortOrder })
  }

  const handleExport = () => {
    try {
      if (orders && orders.length > 0) {
        import('@/utils/exportUtils').then(({ exportOrdersData }) => {
          exportOrdersData(orders, { searchTerm, statusFilter, dateFilter })
        })
        trackDashboardInteraction('orders', 'exported', { 
          filters: { searchTerm, statusFilter, dateFilter },
          recordCount: orders.length
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === orders?.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders?.map(order => order.id) || [])
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      // Simulate bulk status update
      console.log(`Updating ${selectedOrders.length} orders to status: ${newStatus}`)
      trackDashboardInteraction('orders', 'bulk_status_update', { 
        count: selectedOrders.length, 
        newStatus 
      })
      
      // Clear selection after update
      setSelectedOrders([])
      setBulkAction('')
      setShowBulkActions(false)
      
      // Refresh data
      refetch()
    } catch (error) {
      console.error('Failed to update orders:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success-600" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-warning-600" />
      case 'processing':
        return <Package className="w-4 h-4 text-primary-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-600" />
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-4 h-4 text-danger-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading || !ordersData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const { data: orders, pagination } = ordersData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
          >
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

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-primary-700">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="input w-32 text-sm"
              >
                <option value="">Select Action</option>
                <option value="processing">Mark as Processing</option>
                <option value="shipped">Mark as Shipped</option>
                <option value="delivered">Mark as Delivered</option>
                <option value="cancelled">Mark as Cancelled</option>
              </select>
              {bulkAction && (
                <button
                  onClick={() => handleBulkStatusUpdate(bulkAction)}
                  className="btn btn-primary btn-sm"
                >
                  Apply to {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders?.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order ID</span>
                    {sortBy === 'id' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Customer</th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Total</span>
                    {sortBy === 'total' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Status</th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    {sortBy === 'createdAt' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td>
                    <div className="font-medium text-primary-600">{order.id}</div>
                  </td>
                  <td>
                    <div>
                      <div className="font-medium">
                        {order.customer?.firstName} {order.customer?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(order.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => trackDashboardInteraction('orders', 'viewed', { orderId: order.id })}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => trackDashboardInteraction('orders', 'edited', { orderId: order.id })}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit Order"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => trackDashboardInteraction('orders', 'more_actions', { orderId: order.id })}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Orders</p>
              <p className="metric-value">{formatNumber(pagination.total)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-50">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Pending</p>
              <p className="metric-value">
                {formatNumber(orders.filter(o => o.status === 'pending').length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning-50">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Processing</p>
              <p className="metric-value">
                {formatNumber(orders.filter(o => o.status === 'processing').length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-info-50">
              <Package className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Delivered</p>
              <p className="metric-value">
                {formatNumber(orders.filter(o => o.status === 'delivered').length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success-50">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 