import React, { useState, useEffect } from 'react';
import { Plant, SensorData } from '../../types';
import { 
  X, 
  Droplets, 
  Sun, 
  Thermometer, 
  Calendar, 
  MapPin, 
  FileText, 
  BarChart2, 
  Edit as EditIcon, 
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap
} from 'lucide-react';
import { ESP32StatusIndicator, ESP32PairingModal } from '../ESP32';
import SensorDataChart from './SensorDataChart';
import { usePlants } from '../../contexts/PlantContext';
import { LoadingSpinner, ErrorMessage } from '../common';
import { formatDateUTC7, formatDateTimeUTC7 } from '../../utils/dateUtils';

interface PlantDetailsModalProps {
  plant: Plant;
  sensorData: SensorData[];
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PlantDetailsModal: React.FC<PlantDetailsModalProps> = ({ 
  plant, 
  sensorData, 
  onClose,
  onEdit,
  onDelete 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'settings' | 'device'>('overview');
  const [isWatering, setIsWatering] = useState(false);
  const [showESP32Modal, setShowESP32Modal] = useState(false);
  const [isRefreshingDevice, setIsRefreshingDevice] = useState(false);
  
  const { waterPlant } = usePlants();

  // Using UTC+7 formatters from dateUtils
  
  // Local state to update the UI immediately 
  const [localPlant, setLocalPlant] = useState<Plant>(plant);
  
  // Update local plant when prop changes
  useEffect(() => {
    setLocalPlant(plant);
  }, [plant]);
  
  const handleWaterPlant = async () => {
    try {
      setIsWatering(true);
      
      // Call the API to water the plant
      const updatedPlant = await waterPlant(parseInt(plant.id));
      
      // Update local state immediately for responsive UI
      // The API returns dates in UTC format, but we display in UTC+7
      setLocalPlant(prev => ({
        ...prev,
        iotIntegration: {
          ...prev.iotIntegration,
          lastWatered: updatedPlant.last_watered // Will be in UTC format
        },
        tracking: {
          ...prev.tracking,
          nextWateringDate: updatedPlant.next_watering_date // Will be in UTC format
        }
      }));
      
      console.log('Plant watered successfully:', {
        lastWatered: updatedPlant.last_watered,
        nextWatering: updatedPlant.next_watering_date,
        displayLastWatered: formatDateTimeUTC7(updatedPlant.last_watered),
        displayNextWatering: formatDateTimeUTC7(updatedPlant.next_watering_date)
      });
      
    } catch (error) {
      console.error('Failed to water plant:', error);
    } finally {
      setIsWatering(false);
    }
  };

  // Function to refresh device connection status
  const refreshDeviceStatus = () => {
    setIsRefreshingDevice(true);
    
    // Simulate checking device status (in a real app, this would be an API call)
    setTimeout(() => {
      setLocalPlant(prev => ({
        ...prev,
        iotIntegration: {
          ...prev.iotIntegration,
          isConnected: Math.random() > 0.3, // Randomly simulate connection for demo
          lastConnected: new Date().toISOString()
        }
      }));
      setIsRefreshingDevice(false);
    }, 1500);
  };
  
  // Function to handle ESP32 pairing completion
  const handleESP32PairingSuccess = (deviceId: string) => {
    setLocalPlant(prev => ({
      ...prev,
      iotIntegration: {
        ...prev.iotIntegration,
        deviceId: deviceId,
        deviceType: 'ESP32',
        isConnected: true,
        lastConnected: new Date().toISOString()
      }
    }));
    setShowESP32Modal(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {showESP32Modal && (
        <ESP32PairingModal
          onClose={() => setShowESP32Modal(false)}
          onSuccess={handleESP32PairingSuccess}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-[#056526]">{plant.nickname}</h2>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-[#0B9444] hover:bg-[#DFF3E2] rounded-full"
                title="Edit plant"
              >
                <EditIcon size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                title="Delete plant"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'text-[#0B9444] border-b-2 border-[#0B9444]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'data' ? 'text-[#0B9444] border-b-2 border-[#0B9444]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('data')}
            >
              Sensor Data
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'settings' ? 'text-[#0B9444] border-b-2 border-[#0B9444]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('settings')}
            >
              Care Settings
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'device' ? 'text-[#0B9444] border-b-2 border-[#0B9444]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('device')}
            >
              <Wifi size={16} className="mr-1" />
              IoT Device
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-gray-200 rounded-lg overflow-hidden h-48 md:h-auto">
                  {plant.image && (
                    <img 
                      src={plant.image} 
                      alt={plant.nickname} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="font-medium text-gray-700 mb-2">Plant Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium w-32 text-gray-500">Scientific Name:</span>
                      <span>{localPlant.actualName}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32 text-gray-500">Category:</span>
                      <span>{localPlant.category}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32 text-gray-500">Species:</span>
                      <span>{localPlant.species}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32 text-gray-500">Age:</span>
                      <span>{localPlant.age}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium w-32 text-gray-500">Date Added:</span>
                      <span>{formatDateUTC7(localPlant.dateAdded)}</span>
                    </li>
                    <li className="flex items-center">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span>{localPlant.location}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Care Requirements</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center bg-[#DFF3E2] p-3 rounded-lg">
                      <Droplets size={24} className="text-blue-500 mb-2" />
                      <span className="text-sm font-medium">Water Every</span>
                      <span className="text-lg font-semibold text-[#056526]">{localPlant.wateringFrequency} days</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#DFF3E2] p-3 rounded-lg">
                      <Sun size={24} className="text-amber-500 mb-2" />
                      <span className="text-sm font-medium">Sunlight</span>
                      <span className="text-lg font-semibold text-[#056526]">{localPlant.sunlightRequirements}</span>
                    </div>
                    <div className="flex flex-col items-center bg-[#DFF3E2] p-3 rounded-lg">
                      <Thermometer size={24} className="text-red-500 mb-2" />
                      <span className="text-sm font-medium">Temperature</span>
                      <span className="text-lg font-semibold text-[#056526]">{localPlant.idealTemperatureRange.min}°-{localPlant.idealTemperatureRange.max}°C</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Tracking Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Droplets size={20} className="text-blue-500 mr-2" />
                        <span className="text-sm">Last Watered</span>
                      </div>
                      <span className="text-sm font-medium">{formatDateTimeUTC7(localPlant.iotIntegration.lastWatered)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar size={20} className="text-[#0B9444] mr-2" />
                        <span className="text-sm">Next Watering</span>
                      </div>
                      <span className="text-sm font-medium">{formatDateTimeUTC7(localPlant.tracking.nextWateringDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar size={20} className="text-amber-500 mr-2" />
                        <span className="text-sm">Last Fertilized</span>
                      </div>
                      <span className="text-sm font-medium">{formatDateTimeUTC7(localPlant.tracking.lastFertilized)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <button 
                      onClick={handleWaterPlant}
                      disabled={isWatering}
                      className="bg-[#0B9444] hover:bg-[#056526] text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
                    >
                      {isWatering ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          Watering...
                        </>
                      ) : (
                        <>
                          <Droplets size={16} className="mr-2" />
                          Water Now
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start">
                    <FileText size={20} className="text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-700 mb-1">Notes</h3>
                      <p className="text-sm text-gray-600">{localPlant.description || 'No notes added yet.'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">Auto-Watering</h3>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                      <input 
                        type="checkbox" 
                        className="sr-only"
                        checked={localPlant.iotIntegration.autoWateringEnabled}
                        readOnly
                      />
                      <span 
                        className={`absolute inset-y-0 left-0 w-6 h-6 rounded-full transition-transform transform ${
                          localPlant.iotIntegration.autoWateringEnabled 
                            ? 'translate-x-6 bg-[#0B9444]' 
                            : 'translate-x-0 bg-gray-400'
                        }`}
                      ></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {localPlant.iotIntegration.autoWateringEnabled 
                      ? 'Automatic watering is enabled. The system will water the plant when soil moisture drops below the threshold.'
                      : 'Automatic watering is disabled. You will receive notifications when the plant needs watering.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                  <BarChart2 size={20} className="text-[#0B9444] mr-2" />
                  Sensor Data (Last 24 Hours)
                </h3>
                <p className="text-sm text-gray-600">
                  Monitor your plant's environmental conditions with real-time sensor data.
                </p>
              </div>

              {/* Latest Readings Summary Card */}
              {sensorData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#0B9444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Latest Readings
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                      <div className="text-blue-600 mb-1">
                        <Droplets size={24} />
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Soil Humidity</div>
                      <div className="text-lg font-semibold text-blue-700">
                        {sensorData[0]?.soilHumidity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sensorData[0]?.soilHumidity >= plant.thresholds.soilHumidity.min && 
                         sensorData[0]?.soilHumidity <= plant.thresholds.soilHumidity.max
                          ? <span className="text-green-600">Optimal</span>
                          : <span className="text-amber-600">Out of Range</span>
                        }
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3 flex flex-col items-center">
                      <div className="text-green-600 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14.5v3a2 2 0 01-2 2h-10a2 2 0 01-2-2v-3" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14.5a7 7 0 0 1 7-7 7 7 0 0 1 7 7" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Air Humidity</div>
                      <div className="text-lg font-semibold text-green-700">
                        {sensorData[0]?.airHumidity.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sensorData[0]?.airHumidity >= plant.thresholds.airHumidity.min && 
                         sensorData[0]?.airHumidity <= plant.thresholds.airHumidity.max
                          ? <span className="text-green-600">Optimal</span>
                          : <span className="text-amber-600">Out of Range</span>
                        }
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-3 flex flex-col items-center">
                      <div className="text-red-600 mb-1">
                        <Thermometer size={24} />
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Temperature</div>
                      <div className="text-lg font-semibold text-red-700">
                        {sensorData[0]?.temperature.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sensorData[0]?.temperature >= plant.thresholds.temperature.min && 
                         sensorData[0]?.temperature <= plant.thresholds.temperature.max
                          ? <span className="text-green-600">Optimal</span>
                          : <span className="text-amber-600">Out of Range</span>
                        }
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-3 flex flex-col items-center">
                      <div className="text-amber-600 mb-1">
                        <Sun size={24} />
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Light Level</div>
                      <div className="text-lg font-semibold text-amber-700">
                        {sensorData[0]?.luminance.toFixed(0)} lux
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {sensorData[0]?.luminance >= plant.thresholds.luminance.min && 
                         sensorData[0]?.luminance <= plant.thresholds.luminance.max
                          ? <span className="text-green-600">Optimal</span>
                          : <span className="text-amber-600">Out of Range</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Last updated: {new Date(sensorData[0]?.timestamp).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <SensorDataChart 
                    data={sensorData} 
                    dataKey="soilHumidity"
                    title="Soil Humidity"
                    unit="%"
                    color="#3B82F6"
                    thresholds={plant.thresholds.soilHumidity}
                  />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <SensorDataChart 
                    data={sensorData} 
                    dataKey="airHumidity"
                    title="Air Humidity"
                    unit="%"
                    color="#0B9444"
                    thresholds={plant.thresholds.airHumidity}
                  />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <SensorDataChart 
                    data={sensorData} 
                    dataKey="temperature"
                    title="Temperature"
                    unit="°C"
                    color="#EF4444"
                    thresholds={plant.thresholds.temperature}
                  />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <SensorDataChart 
                    data={sensorData} 
                    dataKey="luminance"
                    title="Light Level"
                    unit="lux"
                    color="#F59E0B"
                    thresholds={plant.thresholds.luminance}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="font-medium text-gray-700 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#0B9444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Optimal Ranges for Plant Health
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Droplets size={18} className="text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Soil Humidity</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Min</span>
                      <span className="text-xs text-gray-500">Optimal Range</span>
                      <span className="text-xs text-gray-500">Max</span>
                    </div>
                    <div className="relative w-full bg-gradient-to-r from-gray-300 via-blue-200 to-blue-300 rounded-full h-3 mb-1 overflow-hidden">
                      <div className="absolute h-full bg-blue-500 border-2 border-white" 
                        style={{ 
                          left: `${plant.thresholds.soilHumidity.min}%`,
                          width: `${plant.thresholds.soilHumidity.max - plant.thresholds.soilHumidity.min}%` 
                        }}>
                      </div>
                      
                      {/* Latest reading marker */}
                      {sensorData.length > 0 && (
                        <div className="absolute h-8 w-1 bg-blue-700 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                          style={{ 
                            left: `${Math.min(Math.max(sensorData[0]?.soilHumidity || 0, 0), 100)}%`
                          }}>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 text-xs font-bold text-blue-700 rounded shadow-sm border border-blue-200 whitespace-nowrap">
                            {sensorData[0]?.soilHumidity.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">0%</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {plant.thresholds.soilHumidity.min}% - {plant.thresholds.soilHumidity.max}%
                      </span>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14.5v3a2 2 0 01-2 2h-10a2 2 0 01-2-2v-3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14.5a7 7 0 0 1 7-7 7 7 0 0 1 7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Air Humidity</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Min</span>
                      <span className="text-xs text-gray-500">Optimal Range</span>
                      <span className="text-xs text-gray-500">Max</span>
                    </div>
                    <div className="relative w-full bg-gradient-to-r from-gray-300 via-green-200 to-green-300 rounded-full h-3 mb-1 overflow-hidden">
                      <div className="absolute h-full bg-green-500 border-2 border-white" 
                        style={{ 
                          left: `${plant.thresholds.airHumidity.min}%`,
                          width: `${plant.thresholds.airHumidity.max - plant.thresholds.airHumidity.min}%` 
                        }}>
                      </div>
                      
                      {/* Latest reading marker */}
                      {sensorData.length > 0 && (
                        <div className="absolute h-8 w-1 bg-green-700 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                          style={{ 
                            left: `${Math.min(Math.max(sensorData[0]?.airHumidity || 0, 0), 100)}%`
                          }}>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 text-xs font-bold text-green-700 rounded shadow-sm border border-green-200 whitespace-nowrap">
                            {sensorData[0]?.airHumidity.toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">0%</span>
                      <span className="text-sm font-semibold text-green-700">
                        {plant.thresholds.airHumidity.min}% - {plant.thresholds.airHumidity.max}%
                      </span>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Thermometer size={18} className="text-red-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Temperature</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Cold</span>
                      <span className="text-xs text-gray-500">Optimal Range</span>
                      <span className="text-xs text-gray-500">Hot</span>
                    </div>
                    <div className="relative w-full bg-gradient-to-r from-blue-300 via-yellow-200 to-red-300 rounded-full h-3 mb-1 overflow-hidden">
                      <div className="absolute h-full bg-red-500 border-2 border-white" 
                        style={{ 
                          left: `${(plant.thresholds.temperature.min / 50) * 100}%`,
                          width: `${((plant.thresholds.temperature.max - plant.thresholds.temperature.min) / 50) * 100}%` 
                        }}>
                      </div>
                      
                      {/* Latest reading marker */}
                      {sensorData.length > 0 && (
                        <div className="absolute h-8 w-1 bg-red-700 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                          style={{ 
                            left: `${Math.min(Math.max((sensorData[0]?.temperature || 0) / 50, 0), 1) * 100}%`
                          }}>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 text-xs font-bold text-red-700 rounded shadow-sm border border-red-200 whitespace-nowrap">
                            {sensorData[0]?.temperature.toFixed(1)}°C
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">0°C</span>
                      <span className="text-sm font-semibold text-red-700">
                        {plant.thresholds.temperature.min}°C - {plant.thresholds.temperature.max}°C
                      </span>
                      <span className="text-sm font-medium">50°C</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Sun size={18} className="text-amber-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Light Level</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Dark</span>
                      <span className="text-xs text-gray-500">Optimal Range</span>
                      <span className="text-xs text-gray-500">Bright</span>
                    </div>
                    <div className="relative w-full bg-gradient-to-r from-gray-400 to-yellow-300 rounded-full h-3 mb-1 overflow-hidden">
                      <div className="absolute h-full bg-amber-500 border-2 border-white" 
                        style={{ 
                          left: `${(plant.thresholds.luminance.min / 20000) * 100}%`,
                          width: `${((plant.thresholds.luminance.max - plant.thresholds.luminance.min) / 20000) * 100}%` 
                        }}>
                      </div>
                      
                      {/* Latest reading marker */}
                      {sensorData.length > 0 && (
                        <div className="absolute h-8 w-1 bg-amber-700 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                          style={{ 
                            left: `${Math.min(Math.max((sensorData[0]?.luminance || 0) / 20000, 0), 1) * 100}%`
                          }}>
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 text-xs font-bold text-amber-700 rounded shadow-sm border border-amber-200 whitespace-nowrap">
                            {sensorData[0]?.luminance.toFixed(0)} lux
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">0 lux</span>
                      <span className="text-sm font-semibold text-amber-700">
                        {plant.thresholds.luminance.min} - {plant.thresholds.luminance.max} lux
                      </span>
                      <span className="text-sm font-medium">20k lux</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50 text-blue-700 p-4 rounded-lg">
                To edit plant settings, please use the edit button in the top right corner of this modal.
              </p>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-700 mb-3">Current Settings</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Watering Frequency:</span>
                    <span className="font-medium">{plant.wateringFrequency} days</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Auto-Watering:</span>
                    <span className="font-medium">{plant.iotIntegration.autoWateringEnabled ? 'Enabled' : 'Disabled'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Reminders:</span>
                    <span className="font-medium">{plant.tracking.reminderSettings.enabled ? 'Enabled' : 'Disabled'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Reminder Frequency:</span>
                    <span className="font-medium">{plant.tracking.reminderSettings.frequency} days before due</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {onEdit && (
                  <button 
                    onClick={onEdit}
                    className="px-4 py-2 bg-[#0B9444] text-white rounded-md text-sm font-medium hover:bg-[#056526] flex items-center"
                  >
                    <EditIcon size={16} className="mr-2" />
                    Edit Plant
                  </button>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'device' && (
            <div className="space-y-6">
              {/* Device Status Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Wifi size={20} className="text-[#0B9444] mr-2" />
                  IoT Device Status
                </h3>
                
                {!localPlant.iotIntegration.deviceId ? (
                  <div className="bg-gray-50 rounded-lg p-5 text-center">
                    <WifiOff size={36} className="text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No IoT Device Connected</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This plant is not connected to any IoT devices for automated monitoring and watering.
                    </p>
                    <button
                      onClick={() => setShowESP32Modal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center mx-auto"
                    >
                      <Zap size={16} className="mr-2" />
                      Connect ESP32 Device
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="text-base font-medium text-gray-800">
                          {localPlant.iotIntegration.deviceType === 'ESP32' ? 'ESP32 Device' : 'IoT Device'}
                        </h4>
                        <p className="text-sm text-gray-600">ID: {localPlant.iotIntegration.deviceId}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <ESP32StatusIndicator
                          isConnected={localPlant.iotIntegration.isConnected || false}
                          lastConnected={localPlant.iotIntegration.lastConnected}
                          showDetails={true}
                        />
                        <button
                          onClick={refreshDeviceStatus}
                          disabled={isRefreshingDevice}
                          className={`ml-3 p-2 rounded-full ${isRefreshingDevice ? 'text-gray-400' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="Refresh connection status"
                        >
                          <RefreshCw size={16} className={isRefreshingDevice ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#F3FFF6] p-3 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Device Status</h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Connection:</span>
                          <span className={`font-medium ${localPlant.iotIntegration.isConnected ? 'text-green-600' : 'text-red-500'}`}>
                            {localPlant.iotIntegration.isConnected ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {localPlant.iotIntegration.lastConnected && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Seen:</span>
                            <span className="font-medium">
                              {formatDateTimeUTC7(localPlant.iotIntegration.lastConnected)}
                            </span>
                          </div>
                        )}
                        {localPlant.iotIntegration.deviceIp && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">IP Address:</span>
                            <span className="font-medium">{localPlant.iotIntegration.deviceIp}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-[#F3FFF6] p-3 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Automation</h5>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Auto-Watering:</span>
                          <span className={`font-medium ${localPlant.iotIntegration.autoWateringEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {localPlant.iotIntegration.autoWateringEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Threshold:</span>
                          <span className="font-medium">{localPlant.thresholds.soilHumidity.min}% (Soil Humidity)</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Watered:</span>
                          <span className="font-medium">{formatDateTimeUTC7(localPlant.iotIntegration.lastWatered)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                      <p>
                        To change device settings or update the connection, please edit the plant using the edit button in the top right corner.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setShowESP32Modal(true)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Reconnect Device
                      </button>
                      
                      {onEdit && (
                        <button 
                          onClick={onEdit}
                          className="px-4 py-2 bg-[#0B9444] text-white rounded-md text-sm font-medium hover:bg-[#056526] flex items-center"
                        >
                          <EditIcon size={16} className="mr-2" />
                          Edit Device Settings
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Device Info / Help Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h3 className="font-medium text-gray-700 mb-3">About IoT Integration</h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    The TanaMind platform supports IoT devices like ESP32 for real-time monitoring and automated care of your plants.
                  </p>
                  
                  <h4 className="font-medium text-gray-700 mt-3">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Real-time monitoring of soil moisture, temperature, humidity, and light</li>
                    <li>Automated watering when soil moisture drops below threshold</li>
                    <li>Historical data tracking and visualization</li>
                    <li>Alerts when conditions fall outside optimal ranges</li>
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 mt-3">Setting Up a New Device:</h4>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Power on your ESP32 device and wait for it to enter configuration mode</li>
                    <li>Connect to the ESP32's WiFi network (typically named "ESP32_AP_Config")</li>
                    <li>Click "Connect ESP32 Device" to start the pairing process</li>
                    <li>Enter your home WiFi credentials to allow the ESP32 to connect to your network</li>
                    <li>Wait for the connection to be verified</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDetailsModal;