import { Plant as APIPLant, PlantWithLatestReadings as APIPlantWithReadings, PlantRequest as APIPlantRequest } from '../api/plants';
import { Plant as UIPlant } from '../types';

/**
 * Convert API Plant object to UI Plant object
 */
export const apiToUiPlant = (apiPlant: APIPLant): UIPlant => {
  // Convert health status from API format to UI format
  let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  switch (apiPlant.health_status) {
    case 'Good':
      healthStatus = 'excellent';
      break;
    case 'Warning':
      healthStatus = 'fair';
      break;
    case 'Critical':
      healthStatus = 'critical';
      break;
    case 'Unknown':
    default:
      healthStatus = 'good';
      break;
  }

  // Handle nullable values and provide defaults
  const plant = {
    id: apiPlant.id.toString(), // Convert to string for UI
    nickname: apiPlant.nickname || "Unnamed Plant",
    actualName: apiPlant.plant_name || "",
    category: apiPlant.category || 'Indoor',
    species: apiPlant.species || "",
    dateAdded: apiPlant.date_added || new Date().toISOString(),
    age: apiPlant.age ? apiPlant.age.toString() : calculateAge(apiPlant.date_added || new Date().toISOString()),
    location: apiPlant.location || 'Unknown',
    description: apiPlant.description || '',
    wateringFrequency: apiPlant.watering_frequency || 7,
    sunlightRequirements: apiPlant.sunlight_requirements || 'Medium',
    fertilizerSchedule: apiPlant.fertilizer_schedule || 'Monthly',
    idealTemperatureRange: {
      min: apiPlant.ideal_temperature_min || 18,
      max: apiPlant.ideal_temperature_max || 30,
    },
    thresholds: {
      soilHumidity: { 
        min: apiPlant.soil_humidity_threshold_min || 30, 
        max: apiPlant.soil_humidity_threshold_max || 70 
      },
      airHumidity: { 
        min: apiPlant.air_humidity_threshold_min || 40, 
        max: apiPlant.air_humidity_threshold_max || 80 
      },
      temperature: { 
        min: apiPlant.temperature_threshold_min || 18, 
        max: apiPlant.temperature_threshold_max || 30 
      },
      luminance: { 
        min: apiPlant.luminance_threshold_min || 1000, 
        max: apiPlant.luminance_threshold_max || 15000 
      },
    },
    iotIntegration: {
      deviceId: apiPlant.device_id || apiPlant.id.toString(),
      autoWateringEnabled: apiPlant.auto_watering_enabled || false,
      lastWatered: apiPlant.last_watered || null,
      healthStatus: healthStatus,
    },
    tracking: {
      nextWateringDate: apiPlant.next_watering_date || null,
      lastFertilized: apiPlant.last_fertilized || null,
      reminderSettings: {
        enabled: apiPlant.reminder_enabled || false,
        frequency: 1, // Default reminder frequency
      },
    },
    // Use a default plant image
    image: getPlantImage(apiPlant.species || ""),
  };
  
  return plant;
};

export const apiWithReadingsToUiPlant = (apiPlant: APIPlantWithReadings): UIPlant => {
  const plant = apiToUiPlant(apiPlant);
  
  // If we have the plant with latest readings, add that sensor data
  // Check for null/undefined values and provide defaults
  plant.latestSensorData = {
    timestamp: apiPlant.last_reading_time || new Date().toISOString(),
    soilHumidity: apiPlant.latest_soil_humidity !== undefined ? apiPlant.latest_soil_humidity : 0,
    airHumidity: apiPlant.latest_air_humidity !== undefined ? apiPlant.latest_air_humidity : 0,
    temperature: apiPlant.latest_temperature !== undefined ? apiPlant.latest_temperature : 0,
    luminance: apiPlant.latest_luminance !== undefined ? apiPlant.latest_luminance : 0,
  };
  
  return plant;
};

/**
 * Convert UI Plant object to API Plant Request
 */
export const uiToApiPlantRequest = (uiPlant: UIPlant): APIPlantRequest => {
  return {
    nickname: uiPlant.nickname,
    plant_name: uiPlant.actualName,
    category: uiPlant.category,
    species: uiPlant.species,
    location: uiPlant.location,
    description: uiPlant.description,
    watering_frequency: uiPlant.wateringFrequency,
    sunlight_requirements: uiPlant.sunlightRequirements,
    fertilizer_schedule: uiPlant.fertilizerSchedule,
    ideal_temperature_min: uiPlant.idealTemperatureRange.min,
    ideal_temperature_max: uiPlant.idealTemperatureRange.max,
    soil_humidity_threshold_min: uiPlant.thresholds.soilHumidity.min,
    soil_humidity_threshold_max: uiPlant.thresholds.soilHumidity.max,
    air_humidity_threshold_min: uiPlant.thresholds.airHumidity.min,
    air_humidity_threshold_max: uiPlant.thresholds.airHumidity.max,
    temperature_threshold_min: uiPlant.thresholds.temperature.min,
    temperature_threshold_max: uiPlant.thresholds.temperature.max,
    luminance_threshold_min: uiPlant.thresholds.luminance.min,
    luminance_threshold_max: uiPlant.thresholds.luminance.max,
    device_id: uiPlant.iotIntegration.deviceId,
    auto_watering_enabled: uiPlant.iotIntegration.autoWateringEnabled,
  };
};

// Helper functions

/**
 * Calculate age of plant from creation date
 */
const calculateAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInMonths = (now.getFullYear() - created.getFullYear()) * 12 + 
                      now.getMonth() - created.getMonth();
  
  if (diffInMonths < 1) {
    const diffInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffInDays} days`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    const remainingMonths = diffInMonths % 12;
    return `${years} ${years === 1 ? 'year' : 'years'}${remainingMonths > 0 ? `, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : ''}`;
  }
};

/**
 * Calculate next watering date based on last watering and frequency
 */
const calculateNextWateringDate = (lastWateredAt: string | undefined, frequency: number): string => {
  const lastWatered = lastWateredAt ? new Date(lastWateredAt) : new Date();
  const nextWatering = new Date(lastWatered);
  nextWatering.setDate(nextWatering.getDate() + frequency);
  return nextWatering.toISOString();
};

/**
 * Parse fertilizer frequency from string to days
 */
const parseFertilizerFrequency = (fertilizerSchedule: string): number => {
  // Extract number of days from string like "Every 30 days"
  const match = fertilizerSchedule.match(/Every\s+(\d+)\s+days?/i);
  return match ? parseInt(match[1], 10) : 30; // Default to 30 days
};

/**
 * Get a plant image based on species
 */
const getPlantImage = (species: string): string => {
  // Map of common plant species to image URLs
  const imageMap: Record<string, string> = {
    'Boston Fern': 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Snake Plant': 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Monstera': 'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Peace Lily': 'https://images.pexels.com/photos/4751970/pexels-photo-4751970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Fiddle Leaf Fig': 'https://images.pexels.com/photos/1005715/pexels-photo-1005715.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Pothos': 'https://images.pexels.com/photos/4505170/pexels-photo-4505170.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'ZZ Plant': 'https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'Aloe Vera': 'https://images.pexels.com/photos/4505211/pexels-photo-4505211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  };
  
  // Try to find an exact match
  if (imageMap[species]) {
    return imageMap[species];
  }
  
  // Try to find a partial match
  for (const [key, url] of Object.entries(imageMap)) {
    if (species.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(species.toLowerCase())) {
      return url;
    }
  }
  
  // Default image if no match is found
  return 'https://images.pexels.com/photos/776656/pexels-photo-776656.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
};