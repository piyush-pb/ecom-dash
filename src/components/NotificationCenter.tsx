import { useState } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { Notification } from '@/types'
import { formatRelativeTime } from '@/utils'

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

export default function NotificationCenter({ notifications, onMarkAsRead, onDismiss }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-600" />
      default:
        return <Info className="w-5 h-5 text-primary-600" />
    }
  }



  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDismiss(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block"
                        >
                          View details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  notifications.forEach(n => !n.read && onMarkAsRead(n.id))
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 