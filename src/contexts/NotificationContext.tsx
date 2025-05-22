import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { notifications } from '../api';
import { Notification, NotificationFilters, NotificationUpdate } from '../types';
import { 
  storeNotificationsOffline, 
  getOfflineNotifications, 
  updateOfflineNotification, 
  removeOfflineNotification,
  queueOfflineOperation
} from '../utils/offlineStorage';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  updateNotification: (notificationId: number, update: NotificationUpdate) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAsUnread: (notificationId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: (readOnly?: boolean) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: async () => {},
  updateNotification: async () => {},
  markAsRead: async () => {},
  markAsUnread: async () => {},
  deleteNotification: async () => {},
  deleteAllNotifications: async () => {},
  markAllAsRead: async () => {},
  clearError: () => {},
  startPolling: () => {},
  stopPolling: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const clearError = () => setError(null);

  // Calculate unread count from notifications
  const updateUnreadCount = useCallback((notifs: Notification[]) => {
    const count = notifs.filter(notif => !notif.is_read).length;
    setUnreadCount(count);
  }, []);

  // Fetch notifications with optional filters
  const fetchNotifications = async (filters?: NotificationFilters) => {
    try {
      setIsLoading(true);
      clearError();
      
      if (navigator.onLine) {
        const fetchedNotifications = await notifications.getNotifications(filters);
        setNotificationList(fetchedNotifications);
        updateUnreadCount(fetchedNotifications);
        // Store for offline use
        storeNotificationsOffline(fetchedNotifications);
      } else {
        // Load from offline storage
        const offlineNotifications = getOfflineNotifications();
        setNotificationList(offlineNotifications);
        updateUnreadCount(offlineNotifications);
      }
    } catch (err) {
      // If online request fails, try offline data
      if (navigator.onLine) {
        try {
          const offlineNotifications = getOfflineNotifications();
          setNotificationList(offlineNotifications);
          updateUnreadCount(offlineNotifications);
          setError('Using offline data. Some information may be outdated.');
        } catch (offlineErr) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to fetch notifications');
          }
        }
      } else {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch notifications');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update a notification
  const updateNotification = async (notificationId: number, update: NotificationUpdate) => {
    try {
      setIsLoading(true);
      clearError();
      
      if (navigator.onLine) {
        const updatedNotification = await notifications.updateNotification(notificationId, update);
        
        // Update the local notification list
        setNotificationList(prevNotifications => {
          const updated = prevNotifications.map(notif =>
            notif.id === notificationId ? updatedNotification : notif
          );
          updateUnreadCount(updated);
          // Update offline storage
          storeNotificationsOffline(updated);
          return updated;
        });
      } else {
        // Queue for offline sync and update local state optimistically
        queueOfflineOperation(`/api/notifications/${notificationId}`, 'PUT', update);
        
        setNotificationList(prevNotifications => {
          const updated = prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, ...update } : notif
          );
          updateUnreadCount(updated);
          // Update offline storage
          updateOfflineNotification(notificationId, update);
          return updated;
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to update notification ${notificationId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    await updateNotification(notificationId, { is_read: true });
  };

  // Mark notification as unread
  const markAsUnread = async (notificationId: number) => {
    await updateNotification(notificationId, { is_read: false });
  };

  // Delete a notification
  const deleteNotification = async (notificationId: number) => {
    try {
      setIsLoading(true);
      clearError();
      
      if (navigator.onLine) {
        await notifications.deleteNotification(notificationId);
      } else {
        // Queue for offline sync
        queueOfflineOperation(`/api/notifications/${notificationId}`, 'DELETE', {});
      }
      
      // Remove from local list
      setNotificationList(prevNotifications => {
        const filtered = prevNotifications.filter(notif => notif.id !== notificationId);
        updateUnreadCount(filtered);
        // Update offline storage
        removeOfflineNotification(notificationId);
        return filtered;
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to delete notification ${notificationId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async (readOnly = false) => {
    try {
      setIsLoading(true);
      clearError();
      await notifications.deleteAllNotifications(readOnly);
      
      // Update local list
      if (readOnly) {
        setNotificationList(prevNotifications => {
          const filtered = prevNotifications.filter(notif => !notif.is_read);
          updateUnreadCount(filtered);
          return filtered;
        });
      } else {
        setNotificationList([]);
        setUnreadCount(0);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete notifications');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      setIsLoading(true);
      clearError();
      await notifications.markAllNotificationsAsRead();
      
      // Update all notifications to read in local state
      setNotificationList(prevNotifications => {
        const updated = prevNotifications.map(notif => ({ ...notif, is_read: true }));
        updateUnreadCount(updated);
        return updated;
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to mark all notifications as read');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Start polling for new notifications
  const startPolling = useCallback(() => {
    if (pollingInterval) return; // Already polling
    
    const interval = setInterval(() => {
      // Only fetch if not currently loading to avoid overlapping requests
      if (!isLoading) {
        fetchNotifications().catch(error => {
          console.error('Polling error:', error);
        });
      }
    }, 5 * 60 * 1000); // Poll every 5 minutes
    
    setPollingInterval(interval);
  }, [isLoading, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Load notifications on mount
  useEffect(() => {
    // Load from offline storage first for faster initial load
    try {
      const offlineNotifications = getOfflineNotifications();
      if (offlineNotifications.length > 0) {
        setNotificationList(offlineNotifications);
        updateUnreadCount(offlineNotifications);
      }
    } catch (error) {
      console.warn('Failed to load offline notifications:', error);
    }
    
    // Then fetch fresh data if online
    fetchNotifications();
    startPolling();
    
    // Cleanup polling on unmount
    return () => {
      stopPolling();
    };
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Fetch fresh notifications when coming back online
      fetchNotifications();
      startPolling();
    };

    const handleOffline = () => {
      // Stop polling when offline
      stopPolling();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [startPolling, stopPolling]);

  const value = {
    notifications: notificationList,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    updateNotification,
    markAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllNotifications,
    markAllAsRead,
    clearError,
    startPolling,
    stopPolling,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};