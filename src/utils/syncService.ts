/**
 * Sync Service for handling offline data synchronization
 */

import { 
  getPendingOperations,
  removePendingOperation,
  PendingOperation
} from './offlineStorage';
import { post, put, del } from '../api/client';

interface SyncResult {
  success: boolean;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errors: { operationId: string; error: string }[];
}

/**
 * Synchronize all pending operations with the server
 * This should be called when the app comes back online
 */
export const synchronizeOfflineOperations = async (): Promise<SyncResult> => {
  const pendingOperations = getPendingOperations();
  const result: SyncResult = {
    success: true,
    totalOperations: pendingOperations.length,
    successfulOperations: 0,
    failedOperations: 0,
    errors: []
  };

  if (pendingOperations.length === 0) {
    console.log('No pending operations to synchronize');
    return result;
  }

  console.log(`Starting synchronization of ${pendingOperations.length} pending operations`);

  // Sort operations by timestamp to ensure proper order
  const sortedOperations = [...pendingOperations].sort((a, b) => a.timestamp - b.timestamp);

  // Process each operation
  for (const operation of sortedOperations) {
    try {
      await processOperation(operation);
      removePendingOperation(operation.id);
      result.successfulOperations++;
      console.log(`Operation ${operation.id} (${operation.method} ${operation.endpoint}) synced successfully`);
    } catch (error) {
      result.failedOperations++;
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push({ operationId: operation.id, error: errorMessage });
      console.error(`Failed to sync operation ${operation.id} (${operation.method} ${operation.endpoint}):`, error);
    }
  }

  console.log(`Synchronization completed: ${result.successfulOperations} successful, ${result.failedOperations} failed`);
  return result;
};

/**
 * Process a single pending operation
 */
const processOperation = async (operation: PendingOperation): Promise<any> => {
  const { endpoint, method, data } = operation;

  switch (method) {
    case 'POST':
      return await post(endpoint, data);
    case 'PUT':
      return await put(endpoint, data);
    case 'DELETE':
      return await del(endpoint);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

/**
 * Set up a listener for online/offline events to automatically sync
 * when the app comes back online
 */
export const setupSyncListener = () => {
  const handleOnline = async () => {
    // Wait a bit to ensure connection is stable
    setTimeout(async () => {
      try {
        console.log('Connection restored, attempting to sync pending operations');
        const result = await synchronizeOfflineOperations();
        
        if (result.totalOperations > 0) {
          if (result.success) {
            console.log(`Successfully synchronized ${result.successfulOperations} operations`);
          } else {
            console.warn(`Sync partially completed: ${result.successfulOperations} succeeded, ${result.failedOperations} failed`);
          }
        }
      } catch (error) {
        console.error('Error during automatic synchronization:', error);
      }
    }, 2000);
  };

  // Remove any existing listeners to avoid duplicates
  window.removeEventListener('online', handleOnline);
  
  // Add the listener
  window.addEventListener('online', handleOnline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

// Immediately set up the sync listener when this module is imported
const cleanup = setupSyncListener();

// Export the cleanup function
export const cleanupSyncListener = cleanup;