import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Settings } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationBadge from './NotificationBadge';
import NotificationItem from './NotificationItem';
import { LoadingSpinner } from '../common';

interface NotificationDropdownProps {
  onPlantClick?: (plantId: number) => void;
  onViewAll?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onPlantClick,
  onViewAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    fetchNotifications
  } = useNotifications();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (plantId: number) => {
    if (onPlantClick) {
      onPlantClick(plantId);
      setIsOpen(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
      setIsOpen(false);
    }
  };

  // Get recent notifications (up to 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:ring-offset-2 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] sm:max-h-96 flex flex-col"
          style={{
            right: isMobile ? '50%' : '0',
            transform: isMobile ? 'translateX(50%)' : 'none'
          }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-[#0B9444] transition-colors"
                  title="Mark all as read"
                  disabled={isLoading}
                >
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}

              {onViewAll && (
                <button
                  onClick={handleViewAll}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-[#0B9444] transition-colors"
                  title="View all notifications"
                >
                  <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="medium" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={() => fetchNotifications()}
                  className="mt-2 text-[#0B9444] hover:text-[#056526] text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-3 py-6 sm:px-4 sm:py-8 text-center">
                <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll see notifications about your plants here
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-1.5 sm:p-2">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onPlantClick={handleNotificationClick}
                    compact
                    showActions
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && onViewAll && (
            <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-gray-200">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-[#0B9444] hover:text-[#056526] text-xs sm:text-sm font-medium transition-colors"
              >
                View all notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;