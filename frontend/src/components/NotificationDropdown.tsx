import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Bell, X, CheckCheck, Trash2, AlertCircle, Gift, Clock, Info } from 'lucide-react';
import LayananNotifikasi, { InAppNotification } from '../services/LayananNotifikasi';

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Gunakan getMockNotifikasi untuk sementara
      // Ganti dengan getNotifikasi() jika API backend sudah siap
      const response = await LayananNotifikasi.getMockNotifikasi();
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // Temporary: get count from mock data
      const response = await LayananNotifikasi.getMockNotifikasi();
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await LayananNotifikasi.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await LayananNotifikasi.markAllAsRead();
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = await LayananNotifikasi.deleteNotifikasi(notificationId);
    if (success) {
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const getCategoryIcon = (category: InAppNotification['category']) => {
    switch (category) {
      case 'promotion':
        return <Gift className="w-4 h-4 text-green-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'update':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: InAppNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
    return new Date(date).toLocaleDateString('id-ID');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded hover:bg-gray-100 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Notifikasi</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Tandai Semua Dibaca
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? getPriorityColor(notification.priority) : 'bg-white'
                  }`}
                >
                  {notification.actionUrl ? (
                    <Link
                      to={notification.actionUrl}
                      className="block p-4 pr-12"
                      onClick={() => {
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id, {} as React.MouseEvent);
                        }
                        setIsOpen(false);
                      }}
                    >
                      <NotificationContent notification={notification} formatTimeAgo={formatTimeAgo} getCategoryIcon={getCategoryIcon} />
                    </Link>
                  ) : (
                    <div className="p-4 pr-12">
                      <NotificationContent notification={notification} formatTimeAgo={formatTimeAgo} getCategoryIcon={getCategoryIcon} />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Tandai sudah dibaca"
                      >
                        <CheckCheck className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Hapus notifikasi"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute top-1/2 left-1 w-2 h-2 bg-blue-500 rounded-full -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-primary hover:text-primary-dark"
                onClick={() => setIsOpen(false)}
              >
                Lihat Semua Notifikasi
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Separate component for notification content
const NotificationContent: React.FC<{
  notification: InAppNotification;
  formatTimeAgo: (date: Date) => string;
  getCategoryIcon: (category: InAppNotification['category']) => React.ReactNode;
}> = ({ notification, formatTimeAgo, getCategoryIcon }) => (
  <>
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        {getCategoryIcon(notification.category)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium mb-1 ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
          {notification.title}
        </h4>
        <p className="text-xs text-gray-600 line-clamp-2 mb-1">
          {notification.message}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatTimeAgo(notification.createdAt)}
          </span>
          {notification.actionText && (
            <span className="text-xs text-primary font-medium">
              {notification.actionText}
            </span>
          )}
        </div>
      </div>
    </div>
  </>
);

export default NotificationDropdown;
