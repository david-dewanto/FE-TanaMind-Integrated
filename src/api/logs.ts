/**
 * Sensor logs service for getting and creating sensor data
 */
import { get, post } from './client';

// Types
export interface SensorLogRequest {
  plant_id: number;
  soil_humidity?: number;
  air_humidity?: number;
  temperature?: number;
  luminance?: number;
  watering_done?: boolean;
  watering_amount?: number;
  event_type?: 'sensor_reading' | 'scheduled' | 'manual' | 'auto';
  notes?: string;
  timestamp?: string;
}

export interface SensorLog {
  id: number;
  plant_id: number;
  timestamp: string;
  soil_humidity?: number;
  air_humidity?: number;
  temperature?: number;
  luminance?: number;
  watering_done: boolean;
  watering_amount?: number;
  event_type: 'sensor_reading' | 'scheduled' | 'manual' | 'auto';
  notes?: string;
}

/**
 * Get sensor logs for a specific plant
 */
export const getPlantLogs = async (
  plantId: number,
  limit?: number,
  from?: string,
  to?: string
): Promise<SensorLog[]> => {
  try {
    const queryParams: Record<string, string> = {};
    
    if (limit) {
      queryParams.limit = limit.toString();
    }
    
    if (from) {
      queryParams.from = from;
    }
    
    if (to) {
      queryParams.to = to;
    }
    
    return await get<SensorLog[]>(`/api/logs/plant/${plantId}`, queryParams);
  } catch (error) {
    console.error(`Failed to get logs for plant ${plantId}:`, error);
    throw error;
  }
};

/**
 * Create a new sensor log entry
 */
export const createSensorLog = async (logData: SensorLogRequest): Promise<SensorLog> => {
  try {
    return await post<SensorLog>('/api/logs', logData);
  } catch (error) {
    console.error('Failed to create sensor log:', error);
    throw error;
  }
};

/**
 * Get plant logs summary
 */
export interface LogSummary {
  plant_id: number;
  nickname: string;
  logs_count: number;
  latest_reading: SensorLog;
  average_soil_humidity: number;
  average_air_humidity: number;
  average_temperature: number;
  average_luminance: number;
  watering_count: number;
  first_log_date: string;
  last_log_date: string;
}

export const getPlantLogsSummary = async (plantId: number): Promise<LogSummary> => {
  try {
    return await get<LogSummary>(`/api/logs/plant/${plantId}/summary`);
  } catch (error) {
    console.error(`Failed to get logs summary for plant ${plantId}:`, error);
    throw error;
  }
};