import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Mail,
  Phone
} from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { Customer, PaginatedResponse } from '@/types'
import { formatCurrency, formatNumber, formatDate, formatRelativeTime, getStatusBadge, getInitials, getAvatarColor } from '@/utils'
import { trackDashboardInteraction } from '@/services/posthog'

export default function Customers() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: customersData, isLoading, refetch } = useQuery<PaginatedResponse<Customer>>(
    ['customers', page, searchTerm, statusFilter, sortBy, sortOrder],
    () => dashboardApi.getCustomers(page, 20, {
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
    trackDashboardInteraction('customers', 'searched', { searchTerm: value })
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
    trackDashboardInteraction('customers', 'filtered', { status })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    trackDashboardInteraction('customers', 'sorted', { field, order: sortOrder })
  }

  const handleExport = () => {
    trackDashboardInteraction('customers', 'exported', { 
      filters: { searchTerm, statusFilter } 
    })
  }

  if (isLoading || !customersData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const { data: customers, pagination } = customersData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer relationships and insights</p>
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
                placeholder="Search customers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="churned">Churned</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} customers
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('totalOrders')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Orders</span>
                    {sortBy === 'totalOrders' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('lifetimeValue')}
                >
                  <div className="flex items-center space-x-1">
                    <span>LTV</span>
                    {sortBy === 'lifetimeValue' && (
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
                    <span>Joined</span>
                    {sortBy === 'createdAt' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(customer.firstName)}`}>
                        {getInitials(customer.firstName, customer.lastName)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{customer.totalOrders}</div>
                    <div className="text-sm text-gray-500">
                      {customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : 'No orders yet'}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{formatCurrency(customer.lifetimeValue)}</div>
                    <div className="text-sm text-gray-500">
                      {customer.totalOrders > 0 
                        ? formatCurrency(customer.lifetimeValue / customer.totalOrders) + ' avg'
                        : 'N/A'
                      }
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div className="text-sm font-medium">
                        {formatDate(customer.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(customer.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => trackDashboardInteraction('customers', 'viewed', { customerId: customer.id })}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Customer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => trackDashboardInteraction('customers', 'edited', { customerId: customer.id })}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => trackDashboardInteraction('customers', 'more_actions', { customerId: customer.id })}
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

      {/* Customer Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Customers</p>
              <p className="metric-value">{formatNumber(pagination.total)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-50">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Active Customers</p>
              <p className="metric-value">
                {formatNumber(customers.filter(c => c.status === 'active').length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-success-50">
              <UserPlus className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Average LTV</p>
              <p className="metric-value">
                {formatCurrency(
                  customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length
                )}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-warning-50">
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Churned Customers</p>
              <p className="metric-value">
                {formatNumber(customers.filter(c => c.status === 'churned').length)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-danger-50">
              <TrendingUp className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 