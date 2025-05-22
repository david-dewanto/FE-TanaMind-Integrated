/**
 * Notifications service for managing user notifications
 */
import { get, put, del } from './client';
import { Notification, NotificationFilters, NotificationUpdate } from '../types';

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (filters?: NotificationFilters): Promise<Notification[]> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (filters?.skip !== undefined) {
      queryParams.skip = filters.skip.toString();
    }
    
    if (filters?.limit !== undefined) {
      queryParams.limit = filters.limit.toString();
    }
    
    if (filters?.unread_only !== undefined) {
      queryParams.unread_only = filters.unread_only.toString();
    }
    
    if (filters?.type_filter) {
      queryParams.type_filter = filters.type_filter;
    }
    
    return await get<Notification[]>('/api/notifications', queryParams);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    throw error;
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const notifications = await get<Notification[]>('/api/notifications', { unread_only: 'true' });
    return notifications.length;
  } catch (error) {
    console.error('Failed to get unread notifications count:', error);
    return 0;
  }
};

/**
 * Update a notification (mark as read/unread)
 */
export const updateNotification = async (
  notificationId: number, 
  update: NotificationUpdate
): Promise<Notification> => {
  try {
    return await put<Notification>(`/api/notifications/${notificationId}`, update);
  } catch (error) {
    console.error(`Failed to update notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<Notification> => {
  return updateNotification(notificationId, { is_read: true });
};

/**
 * Mark a notification as unread
 */
export const markNotificationAsUnread = async (notificationId: number): Promise<Notification> => {
  return updateNotification(notificationId, { is_read: false });
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await del<void>(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error(`Failed to delete notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Delete all notifications for the current user
 */
export const deleteAllNotifications = async (readOnly = false): Promise<void> => {
  try {
    const queryParams = readOnly ? { read_only: 'true' } : undefined;
    await del<void>('/api/notifications', queryParams);
  } catch (error) {
    console.error('Failed to delete all notifications:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ message: string }> => {
  try {
    return await put<{ message: string }>('/api/mark-all-read', {});
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};