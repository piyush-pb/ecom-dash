import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus
} from 'lucide-react'
import { dashboardApi } from '@/services/api'
import { Product, PaginatedResponse } from '@/types'
import { formatCurrency, formatNumber, formatDate, getStatusBadge } from '@/utils'
import { trackDashboardInteraction } from '@/services/posthog'

export default function Inventory() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { data: productsData, isLoading, refetch } = useQuery<PaginatedResponse<Product>>(
    ['products', page, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder],
    () => dashboardApi.getProducts(page, 20, {
      search: searchTerm,
      categories: categoryFilter !== 'all' ? [categoryFilter] : undefined,
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
    trackDashboardInteraction('inventory', 'searched', { searchTerm: value })
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    setPage(1)
    trackDashboardInteraction('inventory', 'filtered', { category })
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
    trackDashboardInteraction('inventory', 'filtered', { status })
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    trackDashboardInteraction('inventory', 'sorted', { field, order: sortOrder })
  }

  const handleExport = () => {
    trackDashboardInteraction('inventory', 'exported', { 
      filters: { searchTerm, categoryFilter, statusFilter } 
    })
  }

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { status: 'out-of-stock', color: 'danger', text: 'Out of Stock' }
    if (quantity <= reorderPoint) return { status: 'low-stock', color: 'warning', text: 'Low Stock' }
    return { status: 'in-stock', color: 'success', text: 'In Stock' }
  }

  if (isLoading || !productsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const { data: products, pagination } = productsData

  const lowStockProducts = products.filter(p => p.stockQuantity <= p.reorderPoint)
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0)
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage product inventory and stock levels</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
          >
            Refresh
          </button>
          <button
            onClick={() => trackDashboardInteraction('inventory', 'add_product')}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
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

      {/* Inventory Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total Products</p>
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
              <p className="metric-label">Low Stock</p>
              <p className="metric-value">{formatNumber(lowStockProducts.length)}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning-50">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Out of Stock</p>
              <p className="metric-value">{formatNumber(outOfStockProducts.length)}</p>
            </div>
            <div className="p-3 rounded-lg bg-danger-50">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Inventory Value</p>
              <p className="metric-value">{formatCurrency(totalInventoryValue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-success-50">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
          </div>
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="input pl-10 w-full sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home</option>
              <option value="Books">Books</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input w-full sm:w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Product</span>
                    {sortBy === 'name' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>SKU</th>
                <th>Category</th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Price</span>
                    {sortBy === 'price' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('stockQuantity')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Stock</span>
                    {sortBy === 'stockQuantity' && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stockQuantity, product.reorderPoint)
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: {product.id}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-mono text-sm">{product.sku}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{product.category}</span>
                    </td>
                    <td>
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                      <div className="text-sm text-gray-500">
                        Cost: {formatCurrency(product.cost)}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{product.stockQuantity}</span>
                          <span className={`badge badge-${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Reorder: {product.reorderPoint}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => trackDashboardInteraction('inventory', 'viewed', { productId: product.id })}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => trackDashboardInteraction('inventory', 'edited', { productId: product.id })}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => trackDashboardInteraction('inventory', 'more_actions', { productId: product.id })}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="More Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Low Stock Alerts</h3>
            <span className="badge badge-warning">{lowStockProducts.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-900">{product.name}</h4>
                  <span className="text-sm text-red-600 font-medium">
                    {product.stockQuantity} left
                  </span>
                </div>
                <div className="text-sm text-red-700">
                  <div>SKU: {product.sku}</div>
                  <div>Reorder Point: {product.reorderPoint}</div>
                  <div>Category: {product.category}</div>
                </div>
                <button
                  onClick={() => trackDashboardInteraction('inventory', 'reorder_clicked', { productId: product.id })}
                  className="mt-3 w-full btn btn-danger btn-sm"
                >
                  Reorder Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 