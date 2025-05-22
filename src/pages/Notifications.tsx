import React, { useState } from 'react';
import { 
  Filter, 
  Check, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationItem } from '../components/Notifications';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { NotificationType } from '../types';

const Notifications: React.FC = () => {
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllNotifications,
    markAllAsRead
  } = useNotifications();

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    // Type filter
    if (filterType !== 'all' && notification.notification_type !== filterType) {
      return false;
    }

    // Read status filter
    if (filterRead === 'unread' && notification.is_read) {
      return false;
    }
    if (filterRead === 'read' && !notification.is_read) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.plant_nickname?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handlePlantClick = async (plantId: number) => {
    try {
      // This could navigate to plant details or open a modal
      console.log('Navigate to plant:', plantId);
      // You could implement navigation here
    } catch (error) {
      console.error('Failed to navigate to plant:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationId: number) => {
    try {
      await markAsUnread(notificationId);
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      try {
        await deleteAllNotifications(false);
      } catch (error) {
        console.error('Failed to delete all notifications:', error);
      }
    }
  };

  const handleDeleteRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      try {
        await deleteAllNotifications(true);
      } catch (error) {
        console.error('Failed to delete read notifications:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const getTypeDisplayName = (type: NotificationType | 'all') => {
    switch (type) {
      case 'missed_watering':
        return 'Missed Watering';
      case 'sensor_warning':
        return 'Sensor Warnings';
      case 'auto_watering':
        return 'Auto Watering';
      default:
        return 'All Types';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#056526]">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
            className="flex items-center bg-[#0B9444] hover:bg-[#056526] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            <span>Mark All Read</span>
          </button>
        )}

        <button
          onClick={handleDeleteRead}
          disabled={isLoading}
          className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Check className="h-4 w-4 mr-2" />
          <span>Clear Read</span>
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={isLoading}
          className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B9444] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B9444] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="missed_watering">Missed Watering</option>
              <option value="sensor_warning">Sensor Warnings</option>
              <option value="auto_watering">Auto Watering</option>
            </select>

            {/* Read Status Filter */}
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value as 'all' | 'unread' | 'read')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B9444] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => fetchNotifications()}
          type="error"
          className="mx-auto max-w-2xl mb-6"
        />
      )}

      {/* Loading State */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="large" message="Loading notifications..." />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-lg text-center">
          {notifications.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Notifications Yet</h3>
              <p className="text-gray-600">
                You'll receive notifications about watering schedules, sensor alerts, and plant health updates.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Matching Notifications</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search query.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredNotifications.length} of {notifications.length} notifications
            {filterType !== 'all' && ` • ${getTypeDisplayName(filterType)}`}
            {filterRead !== 'all' && ` • ${filterRead === 'unread' ? 'Unread' : 'Read'} only`}
            {searchQuery && ` • Search: "${searchQuery}"`}
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
                onDelete={handleDelete}
                onPlantClick={handlePlantClick}
                showActions
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;