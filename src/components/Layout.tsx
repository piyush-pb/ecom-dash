import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  Menu, 
  X, 
  Search,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react'
import { trackUserAction } from '@/services/posthog'
import NotificationCenter from './NotificationCenter'
import { Notification } from '@/types'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const location = useLocation()

  // Mock notifications for demonstration
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Low Stock Alert',
        message: 'Smart Watch Pro is running low on stock (8 units remaining)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false,
        actionUrl: '/inventory'
      },
      {
        id: '2',
        type: 'success',
        title: 'Order Delivered',
        message: 'Order ORD-001 has been successfully delivered to customer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        read: false,
        actionUrl: '/orders'
      },
      {
        id: '3',
        type: 'info',
        title: 'New Customer',
        message: 'New customer registered: john.doe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        read: true,
        actionUrl: '/customers'
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNavigation = (name: string) => {
    trackUserAction('navigation', { page: name })
    setSidebarOpen(false)
  }

  const handleUserAction = (action: string) => {
    trackUserAction(action)
    setUserMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">
              E-Commerce Analytics
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

                 <nav className="mt-6 px-4">
           <div className="space-y-1">
             {navigation.map((item) => {
               const isActive = location.pathname === item.href
               return (
                 <Link
                   key={item.name}
                   to={item.href}
                   onClick={() => handleNavigation(item.name)}
                   className={`
                     group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                     ${isActive
                       ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                       : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                     }
                   `}
                 >
                   <item.icon className={`
                     mr-3 h-5 w-5 transition-colors
                     ${isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}
                   `} />
                   {item.name}
                 </Link>
               )
             })}
           </div>
         </nav>

         {/* Sidebar footer */}
         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
           <div className="flex items-center">
             <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
               <User className="w-4 h-4 text-gray-600" />
             </div>
             <div className="ml-3">
               <p className="text-sm font-medium text-gray-900">Admin User</p>
               <p className="text-xs text-gray-500">admin@example.com</p>
             </div>
           </div>
         </div>
      </div>

                 {/* Top header */}
         <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
           <div className="flex items-center justify-between h-10 px-4 sm:px-6 lg:px-8">
             {/* Left side - Mobile menu */}
             <div className="flex items-center">
               {/* Mobile menu button */}
               <button
                 onClick={() => setSidebarOpen(true)}
                 className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
               >
                 <Menu className="w-5 h-5" />
               </button>
             </div>

             {/* Right side */}
             <div className="flex items-center space-x-3">
               {/* Notifications */}
               <NotificationCenter
                 notifications={notifications}
                 onMarkAsRead={handleMarkAsRead}
                 onDismiss={handleDismissNotification}
               />

               {/* User menu */}
               <div className="relative">
                 <button
                   onClick={() => setUserMenuOpen(!userMenuOpen)}
                   className="flex items-center space-x-2 p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                 >
                   <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                     <User className="w-3.5 h-3.5 text-gray-600" />
                   </div>
                   <span className="hidden md:block text-sm font-medium text-gray-900">
                     Admin User
                   </span>
                   <ChevronDown className="w-4 h-4" />
                 </button>

                 {userMenuOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                     <div className="px-4 py-2 border-b border-gray-100">
                       <p className="text-sm font-medium text-gray-900">Admin User</p>
                       <p className="text-xs text-gray-500">admin@example.com</p>
                     </div>
                     <button
                       onClick={() => handleUserAction('profile_clicked')}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       Profile
                     </button>
                     <button
                       onClick={() => handleUserAction('settings_clicked')}
                       className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       Settings
                     </button>
                     <div className="border-t border-gray-100">
                       <button
                         onClick={() => handleUserAction('logout_clicked')}
                         className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                       >
                         <LogOut className="w-4 h-4 mr-2" />
                         Sign out
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>

      {/* Main content */}
      <div className="lg:pl-64">
                 {/* Page content */}
         <main className="p-3">
           {children}
         </main>
      </div>

      {/* Close user menu when clicking outside */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-20"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  )
} 