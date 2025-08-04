import { ExcelExportOptions } from '@/types'

// Export data to CSV
export const exportToCSV = (data: any[], filename: string): void => {
  try {
    if (data.length === 0) {
      console.warn('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    console.log(`Successfully exported ${data.length} records to ${filename}.csv`)
  } catch (error) {
    console.error('Failed to export CSV:', error)
    throw new Error('Export failed: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Export data to Excel (XLSX) using SheetJS
export const exportToExcel = async (options: ExcelExportOptions): Promise<void> => {
  try {
    // Dynamic import to avoid bundling the library
    const XLSX = await import('xlsx')
    
    const worksheet = XLSX.utils.json_to_sheet(options.data)
    
    // Set column widths if provided
    if (options.columns) {
      const colWidths: { [key: string]: number } = {}
      options.columns.forEach(col => {
        if (col.width) {
          colWidths[col.key] = col.width
        }
      })
      worksheet['!cols'] = options.columns.map(col => ({ 
        width: colWidths[col.key] || 15 
      }))
    }
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName)
    
    XLSX.writeFile(workbook, `${options.fileName}.xlsx`)
  } catch (error) {
    console.error('Failed to export to Excel:', error)
    // Fallback to CSV
    exportToCSV(options.data, options.fileName)
  }
}

// Export dashboard data
export const exportDashboardData = (data: any, dateRange: string): void => {
  try {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `dashboard-export-${dateRange}-${timestamp}`
    
    // Flatten the data structure for better CSV export
    const exportData = [
      {
        'Export Date': timestamp,
        'Date Range': dateRange,
        'Total Revenue': data.sales?.totalRevenue || 0,
        'Total Orders': data.sales?.totalOrders || 0,
        'Average Order Value': data.sales?.averageOrderValue || 0,
        'Conversion Rate': data.sales?.conversionRate || 0,
        'Total Customers': data.customers?.totalCustomers || 0,
        'New Customers': data.customers?.newCustomers || 0,
        'Active Customers': data.customers?.activeCustomers || 0,
        'Total Products': data.inventory?.totalProducts || 0,
        'Low Stock Products': data.inventory?.lowStockProducts || 0,
        'Out of Stock Products': data.inventory?.outOfStockProducts || 0,
        'Total Sessions': data.marketing?.totalSessions || 0,
        'Unique Visitors': data.marketing?.uniqueVisitors || 0,
        'Bounce Rate': data.marketing?.bounceRate || 0,
      }
    ]
    
    exportToCSV(exportData, filename)
  } catch (error) {
    console.error('Failed to export dashboard data:', error)
    throw new Error('Dashboard export failed: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Export orders data
export const exportOrdersData = (orders: any[], filters: any): void => {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `orders-export-${timestamp}`
  
  const exportData = orders.map(order => ({
    'Order ID': order.id,
    'Customer': `${order.customer?.firstName} ${order.customer?.lastName}`,
    'Email': order.customer?.email,
    'Status': order.status,
    'Total': order.total,
    'Shipping Cost': order.shippingCost,
    'Tax Amount': order.taxAmount,
    'Discount Amount': order.discountAmount,
    'Created At': order.createdAt,
    'Shipped At': order.shippedAt,
    'Delivered At': order.deliveredAt,
  }))
  
  exportToCSV(exportData, filename)
}

// Export customers data
export const exportCustomersData = (customers: any[]): void => {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `customers-export-${timestamp}`
  
  const exportData = customers.map(customer => ({
    'Customer ID': customer.id,
    'First Name': customer.firstName,
    'Last Name': customer.lastName,
    'Email': customer.email,
    'Phone': customer.phone || '',
    'Total Orders': customer.totalOrders,
    'Lifetime Value': customer.lifetimeValue,
    'Status': customer.status,
    'Created At': customer.createdAt,
    'Last Order At': customer.lastOrderAt || '',
    'Tags': customer.tags.join(', '),
  }))
  
  exportToCSV(exportData, filename)
}

// Export inventory data
export const exportInventoryData = (products: any[]): void => {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `inventory-export-${timestamp}`
  
  const exportData = products.map(product => ({
    'Product ID': product.id,
    'Name': product.name,
    'SKU': product.sku,
    'Category': product.category,
    'Price': product.price,
    'Cost': product.cost,
    'Stock Quantity': product.stockQuantity,
    'Reorder Point': product.reorderPoint,
    'Status': product.status,
    'Created At': product.createdAt,
  }))
  
  exportToCSV(exportData, filename)
}

// Generate PDF report (placeholder for future implementation)
export const generatePDFReport = async (data: any, title: string): Promise<void> => {
  // This would use a library like jsPDF or react-pdf
  console.log('PDF generation not implemented yet')
  // For now, fallback to CSV
  const timestamp = new Date().toISOString().split('T')[0]
  exportToCSV([data], `${title}-${timestamp}`)
} 