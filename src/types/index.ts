export interface Plant {
  id: string;
  nickname: string;
  actualName: string;
  category: string;
  species: string;
  dateAdded: string;
  age: string;
  location: string;
  description: string;
  wateringFrequency: number;
  sunlightRequirements: string;
  fertilizerSchedule: string;
  idealTemperatureRange: {
    min: number;
    max: number;
  };
  thresholds: {
    soilHumidity: { min: number; max: number };
    airHumidity: { min: number; max: number };
    temperature: { min: number; max: number };
    luminance: { min: number; max: number };
  };
  iotIntegration: {
    deviceId: string;
    autoWateringEnabled: boolean;
    lastWatered: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  tracking: {
    nextWateringDate: string;
    lastFertilized: string;
    reminderSettings: {
      enabled: boolean;
      frequency: number;
    };
  };
  image?: string;
  latestSensorData?: SensorData;
}

export interface SensorData {
  timestamp: string;
  soilHumidity: number;
  airHumidity: number;
  temperature: number;
  luminance: number;
}

export interface DashboardStats {
  totalPlants: number;
  plantsNeedingWater: number;
  plantsNeedingAttention: number;
  autoWateredToday: number;
}