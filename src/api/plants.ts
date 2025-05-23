/**
 * Plants service for CRUD operations on plants
 */
import { get, post, put, del } from './client';

// Types
export interface PlantRequest {
  nickname: string;
  plant_name?: string;
  category?: string;
  species?: string;
  location?: string;
  description?: string;
  watering_frequency?: number;
  sunlight_requirements?: string;
  fertilizer_schedule?: string;
  ideal_temperature_min?: number;
  ideal_temperature_max?: number;
  soil_humidity_threshold_min?: number;
  soil_humidity_threshold_max?: number;
  air_humidity_threshold_min?: number;
  air_humidity_threshold_max?: number;
  temperature_threshold_min?: number;
  temperature_threshold_max?: number;
  luminance_threshold_min?: number;
  luminance_threshold_max?: number;
  device_id?: string;
  auto_watering_enabled?: boolean;
}

export interface Plant {
  id: number;
  user_id: number;
  nickname: string;
  plant_name: string;
  category: string;
  species: string;
  date_added: string;
  age?: number;
  location: string;
  description: string;
  watering_frequency: number;
  sunlight_requirements: string;
  fertilizer_schedule: string;
  ideal_temperature_min: number;
  ideal_temperature_max: number;
  soil_humidity_threshold_min: number;
  soil_humidity_threshold_max: number;
  air_humidity_threshold_min: number;
  air_humidity_threshold_max: number;
  temperature_threshold_min: number;
  temperature_threshold_max: number;
  luminance_threshold_min: number;
  luminance_threshold_max: number;
  device_id: string;
  auto_watering_enabled: boolean;
  last_watered: string;
  health_status: 'Good' | 'Warning' | 'Critical' | 'Unknown';
  next_watering_date: string;
  reminder_enabled: boolean;
}

export interface PlantWithLatestReadings extends Plant {
  latest_soil_humidity?: number;
  latest_air_humidity?: number;
  latest_temperature?: number;
  latest_luminance?: number;
  last_reading_time?: string;
}

export interface WaterPlantRequest {
  amount?: number;
}

/**
 * Get all plants for the current user
 */
export const getPlants = async (): Promise<Plant[]> => {
  try {
    return await get<Plant[]>('/api/plants');
  } catch (error) {
    console.error('Failed to get plants:', error);
    throw error;
  }
};

/**
 * Get all plants with latest readings
 */
export const getPlantsWithLatestReadings = async (): Promise<PlantWithLatestReadings[]> => {
  try {
    return await get<PlantWithLatestReadings[]>('/api/plants/with-latest-readings');
  } catch (error) {
    console.error('Failed to get plants with latest readings:', error);
    throw error;
  }
};

/**
 * Get a specific plant by ID
 */
export const getPlant = async (plantId: number): Promise<Plant> => {
  try {
    return await get<Plant>(`/api/plants/${plantId}`);
  } catch (error) {
    console.error(`Failed to get plant ${plantId}:`, error);
    throw error;
  }
};

/**
 * Get a specific plant with latest readings
 */
export const getPlantWithLatestReadings = async (plantId: number): Promise<PlantWithLatestReadings> => {
  try {
    return await get<PlantWithLatestReadings>(`/api/plants/${plantId}/latest-readings`);
  } catch (error) {
    console.error(`Failed to get plant ${plantId} with latest readings:`, error);
    throw error;
  }
};

/**
 * Create a new plant
 */
export const createPlant = async (plantData: PlantRequest): Promise<Plant> => {
  try {
    return await post<Plant>('/api/plants', plantData);
  } catch (error) {
    console.error('Failed to create plant:', error);
    throw error;
  }
};

/**
 * Update an existing plant
 */
export const updatePlant = async (plantId: number, plantData: Partial<PlantRequest>): Promise<Plant> => {
  try {
    return await put<Plant>(`/api/plants/${plantId}`, plantData);
  } catch (error) {
    console.error(`Failed to update plant ${plantId}:`, error);
    throw error;
  }
};

/**
 * Delete a plant
 */
export const deletePlant = async (plantId: number): Promise<{message: string}> => {
  try {
    return await del<{message: string}>(`/api/plants/${plantId}`);
  } catch (error) {
    console.error(`Failed to delete plant ${plantId}:`, error);
    throw error;
  }
};

/**
 * Record watering a plant
 */
export const waterPlant = async (plantId: number, wateringData?: WaterPlantRequest): Promise<Plant> => {
  try {
    // Initialize query params object if needed
    let queryParams: Record<string, string> | undefined = undefined;
    
    // Add amount if provided
    if (wateringData?.amount) {
      queryParams = { amount: wateringData.amount.toString() };
    }
    
    // API expects all dates in UTC format (backend handles timezone conversion)
    return await post<Plant>(`/api/plants/${plantId}/water`, undefined, queryParams);
  } catch (error) {
    console.error(`Failed to record watering for plant ${plantId}:`, error);
    throw error;
  }
};