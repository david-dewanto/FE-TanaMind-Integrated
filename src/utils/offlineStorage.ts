/**
 * Offline Storage Utility
 * 
 * This utility provides methods for storing and retrieving data when offline
 * and synchronizing with the server when back online.
 */

// Type for pending operations that will be synchronized when connection is restored
export interface PendingOperation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
}

// Local storage keys
const OFFLINE_PLANTS_KEY = 'tanamind-offline-plants';
const PENDING_OPERATIONS_KEY = 'tanamind-pending-operations';
const OFFLINE_NOTIFICATIONS_KEY = 'tanamind-offline-notifications';
const OFFLINE_AI_RECOMMENDATIONS_KEY = 'tanamind-offline-ai-recommendations';
const OFFLINE_CHAT_HISTORY_KEY = 'tanamind-offline-chat-history';

/**
 * Store plants data locally for offline access
 */
export const storePlantsOffline = (plants: any[]) => {
  try {
    localStorage.setItem(OFFLINE_PLANTS_KEY, JSON.stringify(plants));
    console.log('Plants data stored offline successfully');
  } catch (error) {
    console.error('Failed to store plants data offline:', error);
  }
};

/**
 * Get plants data from local storage
 */
export const getOfflinePlants = (): any[] => {
  try {
    const data = localStorage.getItem(OFFLINE_PLANTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to retrieve plants from offline storage:', error);
    return [];
  }
};

/**
 * Queue an operation to be performed when back online
 */
export const queueOfflineOperation = (
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE',
  data: any
): string => {
  try {
    // Generate unique ID for this operation
    const operationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Get existing pending operations
    const pendingOps = getPendingOperations();
    
    // Add new operation
    const newOperation: PendingOperation = {
      id: operationId,
      endpoint,
      method,
      data,
      timestamp: Date.now()
    };
    
    // Save updated operations
    localStorage.setItem(
      PENDING_OPERATIONS_KEY,
      JSON.stringify([...pendingOps, newOperation])
    );
    
    console.log(`Operation queued for offline sync: ${method} ${endpoint}`);
    return operationId;
  } catch (error) {
    console.error('Failed to queue offline operation:', error);
    return '';
  }
};

/**
 * Get all pending operations
 */
export const getPendingOperations = (): PendingOperation[] => {
  try {
    const data = localStorage.getItem(PENDING_OPERATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to retrieve pending operations:', error);
    return [];
  }
};

/**
 * Remove a pending operation (after it's been processed)
 */
export const removePendingOperation = (operationId: string): void => {
  try {
    const pendingOps = getPendingOperations();
    const updatedOps = pendingOps.filter(op => op.id !== operationId);
    
    localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(updatedOps));
  } catch (error) {
    console.error(`Failed to remove pending operation ${operationId}:`, error);
  }
};

/**
 * Check if we have pending operations
 */
export const hasPendingOperations = (): boolean => {
  return getPendingOperations().length > 0;
};

/**
 * Update a plant in offline storage
 */
export const updateOfflinePlant = (plantId: string, updatedData: any): void => {
  try {
    const plants = getOfflinePlants();
    const updatedPlants = plants.map(plant => 
      plant.id === plantId ? { ...plant, ...updatedData } : plant
    );
    
    storePlantsOffline(updatedPlants);
  } catch (error) {
    console.error(`Failed to update plant ${plantId} in offline storage:`, error);
  }
};

/**
 * Add a new plant to offline storage (for operations done while offline)
 */
export const addOfflinePlant = (plant: any): void => {
  try {
    const plants = getOfflinePlants();
    storePlantsOffline([...plants, plant]);
  } catch (error) {
    console.error('Failed to add plant to offline storage:', error);
  }
};

/**
 * Remove a plant from offline storage
 */
export const removeOfflinePlant = (plantId: string): void => {
  try {
    const plants = getOfflinePlants();
    const updatedPlants = plants.filter(plant => plant.id !== plantId);
    
    storePlantsOffline(updatedPlants);
  } catch (error) {
    console.error(`Failed to remove plant ${plantId} from offline storage:`, error);
  }
};

/**
 * Store notifications data locally for offline access
 */
export const storeNotificationsOffline = (notifications: any[]) => {
  try {
    localStorage.setItem(OFFLINE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    console.log('Notifications data stored offline successfully');
  } catch (error) {
    console.error('Failed to store notifications data offline:', error);
  }
};

/**
 * Get notifications data from local storage
 */
export const getOfflineNotifications = (): any[] => {
  try {
    const data = localStorage.getItem(OFFLINE_NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to retrieve notifications from offline storage:', error);
    return [];
  }
};

/**
 * Update a notification in offline storage
 */
export const updateOfflineNotification = (notificationId: number, updatedData: any): void => {
  try {
    const notifications = getOfflineNotifications();
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId ? { ...notification, ...updatedData } : notification
    );
    
    storeNotificationsOffline(updatedNotifications);
  } catch (error) {
    console.error(`Failed to update notification ${notificationId} in offline storage:`, error);
  }
};

/**
 * Remove a notification from offline storage
 */
export const removeOfflineNotification = (notificationId: number): void => {
  try {
    const notifications = getOfflineNotifications();
    const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
    
    storeNotificationsOffline(updatedNotifications);
  } catch (error) {
    console.error(`Failed to remove notification ${notificationId} from offline storage:`, error);
  }
};

/**
 * Store AI recommendations data locally for offline access
 */
export const storeAIRecommendationsOffline = (recommendations: Record<number, any>) => {
  try {
    localStorage.setItem(OFFLINE_AI_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    console.log('AI recommendations data stored offline successfully');
  } catch (error) {
    console.error('Failed to store AI recommendations data offline:', error);
  }
};

/**
 * Get AI recommendations data from local storage
 */
export const getOfflineAIRecommendations = (): Record<number, any> => {
  try {
    const data = localStorage.getItem(OFFLINE_AI_RECOMMENDATIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to retrieve AI recommendations from offline storage:', error);
    return {};
  }
};

/**
 * Store chat history data locally for offline access
 */
export const storeChatHistoryOffline = (chatHistory: any[]) => {
  try {
    localStorage.setItem(OFFLINE_CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    console.log('Chat history data stored offline successfully');
  } catch (error) {
    console.error('Failed to store chat history data offline:', error);
  }
};

/**
 * Get chat history data from local storage
 */
export const getOfflineChatHistory = (): any[] => {
  try {
    const data = localStorage.getItem(OFFLINE_CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to retrieve chat history from offline storage:', error);
    return [];
  }
};

/**
 * Clear all offline data (useful for logout)
 */
export const clearOfflineStorage = (): void => {
  try {
    localStorage.removeItem(OFFLINE_PLANTS_KEY);
    localStorage.removeItem(PENDING_OPERATIONS_KEY);
    localStorage.removeItem(OFFLINE_NOTIFICATIONS_KEY);
    localStorage.removeItem(OFFLINE_AI_RECOMMENDATIONS_KEY);
    localStorage.removeItem(OFFLINE_CHAT_HISTORY_KEY);
    console.log('Offline storage cleared');
  } catch (error) {
    console.error('Failed to clear offline storage:', error);
  }
};