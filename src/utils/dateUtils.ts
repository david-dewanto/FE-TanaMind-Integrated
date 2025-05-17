/**
 * Utility functions for date handling with UTC+7 timezone (Western Indonesian Time)
 * 
 * IMPORTANT: The backend stores dates in UTC+0, but we want to display them in UTC+7
 */

// UTC+7 offset in milliseconds
const UTC_PLUS_7_HOURS = 7;
const HOUR_IN_MS = 60 * 60 * 1000;
const UTC_PLUS_7_OFFSET = UTC_PLUS_7_HOURS * HOUR_IN_MS;

/**
 * Convert UTC date string to UTC+7 Date object
 * This is the core utility that all other functions use
 */
export const toUTC7 = (dateStr: string): Date => {
  // Parse the input ISO string (which is in UTC/GMT)
  const utcDate = new Date(dateStr);
  
  // Add 7 hours to convert from UTC+0 to UTC+7
  const utc7Time = utcDate.getTime() + UTC_PLUS_7_OFFSET;
  
  // Return the new date object in UTC+7 time
  return new Date(utc7Time);
};

/**
 * Get current date in UTC+7 timezone
 */
export const getCurrentDateUTC7 = (): Date => {
  const now = new Date();
  // Add 7 hours to current UTC time
  return new Date(now.getTime() + UTC_PLUS_7_OFFSET);
};

/**
 * Format a date to local date string in UTC+7 timezone
 * Takes a UTC date string and displays it as UTC+7
 */
export const formatDateUTC7 = (dateStr: string): string => {
  // Convert to UTC+7
  const dateUTC7 = toUTC7(dateStr);
  
  return dateUTC7.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format a date to local date-time string in UTC+7 timezone
 * Takes a UTC date string and displays it as UTC+7
 */
export const formatDateTimeUTC7 = (dateStr: string): string => {
  // Convert to UTC+7
  const dateUTC7 = toUTC7(dateStr);
  
  return dateUTC7.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Add specified number of days to a date in UTC+7 timezone
 */
export const addDaysUTC7 = (dateStr: string, days: number): Date => {
  // Convert to UTC+7
  const dateUTC7 = toUTC7(dateStr);
  
  // Add the specified number of days
  dateUTC7.setDate(dateUTC7.getDate() + days);
  
  return dateUTC7;
};

/**
 * Calculate next watering date based on last watering and frequency
 * Returns a UTC ISO string (which is what the backend expects)
 */
export const calculateNextWateringDateUTC7 = (lastWateredAt: string, frequency: number): string => {
  // First convert to UTC+7, add days, then convert back to UTC
  const nextWateringDateUTC7 = addDaysUTC7(lastWateredAt, frequency);
  
  // To convert back to UTC for storage, subtract 7 hours
  const nextWateringDateUTC = new Date(nextWateringDateUTC7.getTime() - UTC_PLUS_7_OFFSET);
  
  return nextWateringDateUTC.toISOString();
};