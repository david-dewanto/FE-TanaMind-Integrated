import React from 'react';
import { 
  Bell, 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  MoreHorizontal 
} from 'lucide-react';
import { Notification, NotificationType } from '../../types';
import { formatRelativeTime } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onMarkAsUnread?: (id: number) => void;
  onDelete?: (id: number) => void;
  onPlantClick?: (plantId: number) => void;
  compact?: boolean;
  showActions?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onPlantClick,
  compact = false,
  showActions = true
}) => {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'missed_watering':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'sensor_warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'auto_watering':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'missed_watering':
        return 'border-blue-200 bg-blue-50';
      case 'sensor_warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'auto_watering':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return formatRelativeTime(dateString);
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const handlePlantClick = () => {
    if (notification.plant_id && onPlantClick) {
      onPlantClick(notification.plant_id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsUnread = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkAsUnread) {
      onMarkAsUnread(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      className={`
        relative border rounded-lg p-4 transition-all duration-200 hover:shadow-md
        ${notification.is_read ? 'bg-white border-gray-200' : `${getNotificationColor(notification.notification_type)} border-l-4`}
        ${notification.plant_id && onPlantClick ? 'cursor-pointer' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={handlePlantClick}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></div>
      )}

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.notification_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium text-gray-900 ${compact ? 'truncate' : ''}`}>
                {notification.title}
              </h4>
              
              <p className={`text-sm text-gray-600 mt-1 ${compact ? 'line-clamp-2' : ''}`}>
                {notification.message}
              </p>

              <div className="flex items-center mt-2 text-xs text-gray-500">
                <span>{formatDateTime(notification.created_at)}</span>
                {notification.plant_nickname && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-medium">{notification.plant_nickname}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-4">
                {!notification.is_read ? (
                  <button
                    onClick={handleMarkAsRead}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleMarkAsUnread}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Mark as unread"
                    aria-label="Mark as unread"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;