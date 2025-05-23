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
    deviceType?: 'ESP32' | 'other';
    deviceIp?: string;
    autoWateringEnabled: boolean;
    lastWatered: string;
    isConnected?: boolean;
    lastConnected?: string;
    signalStrength?: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  };
  tracking: {
    nextWateringDate: string;
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
  connectedDevices?: number;
}

// Notification types
export type NotificationType = 'missed_watering' | 'sensor_warning' | 'auto_watering';

export interface Notification {
  id: number;
  user_id: number;
  plant_id: number | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  plant_nickname?: string;
}

export interface NotificationFilters {
  unread_only?: boolean;
  type_filter?: NotificationType;
  skip?: number;
  limit?: number;
}

export interface NotificationUpdate {
  is_read: boolean;
}

// Re-export ESP32 types for easier imports
export * from './esp32';