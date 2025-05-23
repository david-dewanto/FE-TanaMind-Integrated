import { Plant, SensorData, DashboardStats } from '../types';

export const mockPlants: Plant[] = [
  {
    id: '1',
    nickname: 'Fern Friend',
    actualName: 'Boston Fern',
    category: 'Indoor',
    species: 'Nephrolepis exaltata',
    dateAdded: '2024-01-15',
    age: '6 months',
    location: 'Living Room',
    description: 'Thriving in the corner by the window',
    wateringFrequency: 3,
    sunlightRequirements: 'Indirect light',
    fertilizerSchedule: 'Monthly during growing season',
    idealTemperatureRange: {
      min: 16,
      max: 24,
    },
    thresholds: {
      soilHumidity: { min: 60, max: 80 },
      airHumidity: { min: 50, max: 75 },
      temperature: { min: 18, max: 24 },
      luminance: { min: 2000, max: 6000 },
    },
    iotIntegration: {
      deviceId: 'TM-001',
      autoWateringEnabled: true,
      lastWatered: '2024-08-15T08:30:00',
      healthStatus: 'excellent',
    },
    tracking: {
      nextWateringDate: '2024-08-18T08:30:00',
      reminderSettings: {
        enabled: true,
        frequency: 3,
      },
    },
    image: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '2',
    nickname: 'Spiky',
    actualName: 'Snake Plant',
    category: 'Indoor',
    species: 'Sansevieria trifasciata',
    dateAdded: '2024-02-20',
    age: '1 year',
    location: 'Bedroom',
    description: 'Low maintenance plant, perfect for bedrooms',
    wateringFrequency: 10,
    sunlightRequirements: 'Low to bright indirect light',
    fertilizerSchedule: 'Quarterly',
    idealTemperatureRange: {
      min: 18,
      max: 29,
    },
    thresholds: {
      soilHumidity: { min: 20, max: 40 },
      airHumidity: { min: 30, max: 50 },
      temperature: { min: 18, max: 29 },
      luminance: { min: 1000, max: 8000 },
    },
    iotIntegration: {
      deviceId: 'TM-002',
      autoWateringEnabled: false,
      lastWatered: '2024-08-10T17:45:00',
      healthStatus: 'good',
    },
    tracking: {
      nextWateringDate: '2024-08-20T17:45:00',
      reminderSettings: {
        enabled: true,
        frequency: 10,
      },
    },
    image: 'https://images.pexels.com/photos/2123482/pexels-photo-2123482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '3',
    nickname: 'Monstera Deluxe',
    actualName: 'Swiss Cheese Plant',
    category: 'Indoor',
    species: 'Monstera deliciosa',
    dateAdded: '2024-03-10',
    age: '8 months',
    location: 'Study',
    description: 'Beautiful tropical plant with unique leaf patterns',
    wateringFrequency: 7,
    sunlightRequirements: 'Bright indirect light',
    fertilizerSchedule: 'Monthly in growing season',
    idealTemperatureRange: {
      min: 18,
      max: 27,
    },
    thresholds: {
      soilHumidity: { min: 40, max: 70 },
      airHumidity: { min: 40, max: 60 },
      temperature: { min: 18, max: 27 },
      luminance: { min: 2500, max: 7000 },
    },
    iotIntegration: {
      deviceId: 'TM-003',
      autoWateringEnabled: true,
      lastWatered: '2024-08-13T09:15:00',
      healthStatus: 'fair',
    },
    tracking: {
      nextWateringDate: '2024-08-20T09:15:00',
      reminderSettings: {
        enabled: true,
        frequency: 7,
      },
    },
    image: 'https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: '4',
    nickname: 'Leafy',
    actualName: 'Peace Lily',
    category: 'Indoor',
    species: 'Spathiphyllum',
    dateAdded: '2024-04-05',
    age: '5 months',
    location: 'Kitchen',
    description: 'Elegant flowering plant that purifies air',
    wateringFrequency: 5,
    sunlightRequirements: 'Low to medium indirect light',
    fertilizerSchedule: 'Every 6-8 weeks',
    idealTemperatureRange: {
      min: 18,
      max: 23,
    },
    thresholds: {
      soilHumidity: { min: 50, max: 70 },
      airHumidity: { min: 40, max: 70 },
      temperature: { min: 18, max: 25 },
      luminance: { min: 1500, max: 5000 },
    },
    iotIntegration: {
      deviceId: 'TM-004',
      autoWateringEnabled: true,
      lastWatered: '2024-08-14T16:30:00',
      healthStatus: 'poor',
    },
    tracking: {
      nextWateringDate: '2024-08-19T16:30:00',
      reminderSettings: {
        enabled: true,
        frequency: 5,
      },
    },
    image: 'https://images.pexels.com/photos/4751970/pexels-photo-4751970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

export const mockSensorData: Record<string, SensorData[]> = {
  '1': Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    soilHumidity: 65 + Math.floor(Math.random() * 10 - 5),
    airHumidity: 60 + Math.floor(Math.random() * 8 - 4),
    temperature: 21 + Math.floor(Math.random() * 2 - 1),
    luminance: 3500 + Math.floor(Math.random() * 1000 - 500),
  })),
  '2': Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    soilHumidity: 30 + Math.floor(Math.random() * 8 - 4),
    airHumidity: 40 + Math.floor(Math.random() * 6 - 3),
    temperature: 22 + Math.floor(Math.random() * 3 - 1),
    luminance: 4500 + Math.floor(Math.random() * 1500 - 750),
  })),
  '3': Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    soilHumidity: 45 + Math.floor(Math.random() * 15 - 7),
    airHumidity: 50 + Math.floor(Math.random() * 6 - 3),
    temperature: 23 + Math.floor(Math.random() * 2 - 1),
    luminance: 4000 + Math.floor(Math.random() * 1200 - 600),
  })),
  '4': Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    soilHumidity: 30 + Math.floor(Math.random() * 10 - 5),
    airHumidity: 45 + Math.floor(Math.random() * 8 - 4),
    temperature: 20 + Math.floor(Math.random() * 3 - 1),
    luminance: 2500 + Math.floor(Math.random() * 800 - 400),
  })),
};

export const mockDashboardStats: DashboardStats = {
  totalPlants: mockPlants.length,
  plantsNeedingWater: 1,
  plantsNeedingAttention: 2,
  autoWateredToday: 2,
};