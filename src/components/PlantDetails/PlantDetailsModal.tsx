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
import { ESP32PairingModal } from '../ESP32';
import SensorDataChart from './SensorDataChart';
import { usePlants } from '../../contexts/PlantContext';
import { LoadingSpinner, ErrorMessage, PlantImage } from '../common';
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
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square md:aspect-[4/3]">
                  <PlantImage 
                    plantName={localPlant.actualName || localPlant.nickname} 
                    species={localPlant.species}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    fallbackImage={plant.image}
                  />
                </div>

                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Plant Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Scientific Name</span>
                      <span className="text-gray-900">{localPlant.actualName || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="text-gray-900">{localPlant.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Species</span>
                      <span className="text-gray-900">{localPlant.species || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Age</span>
                      <span className="text-gray-900">{localPlant.age}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Added</span>
                      <span className="text-gray-900">{formatDateUTC7(localPlant.dateAdded)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-gray-500 flex items-center">
                        <MapPin size={14} className="mr-1" />
                        Location
                      </span>
                      <span className="text-gray-900">{localPlant.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-700 mb-3">Care Requirements</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Droplets size={24} className="text-blue-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Water Every</p>
                      <p className="text-lg font-semibold text-gray-900">{localPlant.wateringFrequency} days</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Sun size={24} className="text-amber-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Sunlight</p>
                      <p className="text-lg font-semibold text-gray-900">{localPlant.sunlightRequirements}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Thermometer size={24} className="text-red-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Temperature</p>
                      <p className="text-lg font-semibold text-gray-900">{localPlant.idealTemperatureRange.min}°-{localPlant.idealTemperatureRange.max}°C</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <span className="font-medium">Fertilizer:</span> {localPlant.fertilizerSchedule}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">Watering Schedule</h3>
                    <button 
                      onClick={handleWaterPlant}
                      disabled={isWatering}
                      className="bg-[#0B9444] hover:bg-[#056526] text-white px-3 py-1.5 rounded text-sm font-medium inline-flex items-center disabled:opacity-50"
                    >
                      {isWatering ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          Watering...
                        </>
                      ) : (
                        <>
                          <Droplets size={14} className="mr-1.5" />
                          Water Now
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center">
                        <Droplets size={16} className="text-blue-500 mr-2" />
                        Last Watered
                      </span>
                      <span className="text-gray-900">
                        {new Date(localPlant.iotIntegration.lastWatered).getFullYear() === 1970 
                          ? 'Not watered yet' 
                          : formatDateTimeUTC7(localPlant.iotIntegration.lastWatered)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center">
                        <Calendar size={16} className="text-green-600 mr-2" />
                        Next Watering
                      </span>
                      <span className="text-gray-900">{formatDateTimeUTC7(localPlant.tracking.nextWateringDate)}</span>
                    </div>
                  </div>
                  {localPlant.iotIntegration.deviceId && localPlant.iotIntegration.deviceType === 'ESP32' && (
                    <div className="mt-3 bg-blue-50 rounded p-2 text-xs text-blue-700">
                      ⚡ Automatic watering enabled with ESP32
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FileText size={16} className="mr-2" />
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {localPlant.description || (
                      <span className="text-gray-400 italic">
                        No notes added yet.
                      </span>
                    )}
                  </p>
                </div>

                {localPlant.latestSensorData && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Current Conditions</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        localPlant.iotIntegration.healthStatus === 'excellent' || localPlant.iotIntegration.healthStatus === 'good'
                          ? 'bg-green-100 text-green-700'
                          : localPlant.iotIntegration.healthStatus === 'fair'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {localPlant.iotIntegration.healthStatus.charAt(0).toUpperCase() + localPlant.iotIntegration.healthStatus.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center">
                        <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Soil</p>
                        <p className="text-sm font-semibold">{localPlant.latestSensorData.soilHumidity}%</p>
                        <p className="text-xs mt-1">
                          {localPlant.latestSensorData.soilHumidity >= plant.thresholds.soilHumidity.min && 
                           localPlant.latestSensorData.soilHumidity <= plant.thresholds.soilHumidity.max
                            ? <span className="text-green-600">Optimal</span>
                            : <span className="text-amber-600">Out of Range</span>
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <svg className="w-5 h-5 text-green-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14.5v3a2 2 0 01-2 2h-10a2 2 0 01-2-2v-3M5 14.5a7 7 0 0 1 7-7 7 7 0 0 1 7 7" />
                        </svg>
                        <p className="text-xs text-gray-500">Air</p>
                        <p className="text-sm font-semibold">{localPlant.latestSensorData.airHumidity}%</p>
                        <p className="text-xs mt-1">
                          {localPlant.latestSensorData.airHumidity >= plant.thresholds.airHumidity.min && 
                           localPlant.latestSensorData.airHumidity <= plant.thresholds.airHumidity.max
                            ? <span className="text-green-600">Optimal</span>
                            : <span className="text-amber-600">Out of Range</span>
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <Thermometer size={20} className="text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Temp</p>
                        <p className="text-sm font-semibold">{localPlant.latestSensorData.temperature}°C</p>
                        <p className="text-xs mt-1">
                          {localPlant.latestSensorData.temperature >= plant.thresholds.temperature.min && 
                           localPlant.latestSensorData.temperature <= plant.thresholds.temperature.max
                            ? <span className="text-green-600">Optimal</span>
                            : <span className="text-amber-600">Out of Range</span>
                          }
                        </p>
                      </div>
                      <div className="text-center">
                        <Sun size={20} className="text-amber-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Light</p>
                        <p className="text-sm font-semibold">{localPlant.latestSensorData.luminance} lux</p>
                        <p className="text-xs mt-1">
                          {localPlant.latestSensorData.luminance >= plant.thresholds.luminance.min && 
                           localPlant.latestSensorData.luminance <= plant.thresholds.luminance.max
                            ? <span className="text-green-600">Optimal</span>
                            : <span className="text-amber-600">Out of Range</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!localPlant.latestSensorData && localPlant.iotIntegration.deviceId && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-sm text-gray-500 text-center">
                      No sensor data available yet. Make sure your ESP32 device is connected.
                    </p>
                  </div>
                )}

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
                    <div className="relative w-full bg-gradient-to-r from-gray-300 via-yellow-100 to-yellow-200 rounded-full h-3 mb-1 overflow-hidden">
                      {(() => {
                        // Determine appropriate scale based on plant's max threshold
                        const maxScale = Math.max(15000, plant.thresholds.luminance.max * 1.2);
                        const minPos = (plant.thresholds.luminance.min / maxScale) * 100;
                        const maxPos = (plant.thresholds.luminance.max / maxScale) * 100;
                        const width = maxPos - minPos;
                        
                        return (
                          <>
                            <div className="absolute h-full bg-amber-500 border-2 border-white" 
                              style={{ 
                                left: `${minPos}%`,
                                width: `${width}%` 
                              }}>
                            </div>
                            
                            {/* Latest reading marker */}
                            {sensorData.length > 0 && (
                              <div className="absolute h-8 w-1 bg-amber-700 top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10"
                                style={{ 
                                  left: `${Math.min(Math.max((sensorData[0]?.luminance || 0) / maxScale, 0), 1) * 100}%`
                                }}>
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-1 py-0.5 text-xs font-bold text-amber-700 rounded shadow-sm border border-amber-200 whitespace-nowrap">
                                  {sensorData[0]?.luminance.toFixed(0)} lux
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">0 lux</span>
                      <span className="text-sm font-semibold text-amber-700">
                        {plant.thresholds.luminance.min} - {plant.thresholds.luminance.max} lux
                      </span>
                      <span className="text-sm font-medium">{Math.max(15000, plant.thresholds.luminance.max * 1.2) >= 1000 ? `${(Math.max(15000, plant.thresholds.luminance.max * 1.2) / 1000).toFixed(0)}k` : Math.max(15000, plant.thresholds.luminance.max * 1.2)} lux</span>
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
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Manual Mode</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      This plant is not connected to any IoT devices. You'll need to monitor and water it manually.
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <Wifi size={24} className="text-green-600 mr-3" />
                        <div>
                          <h4 className="text-base font-medium text-green-800">
                            ESP32 Connected
                          </h4>
                          <p className="text-sm text-green-700">Device ID: {localPlant.iotIntegration.deviceId}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#F3FFF6] p-4 rounded-lg mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Automatic Watering Settings</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Watering Threshold:</span>
                          <span className="font-medium">{localPlant.thresholds.soilHumidity.min}% soil humidity</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Watered:</span>
                          <span className="font-medium">
                            {new Date(localPlant.iotIntegration.lastWatered).getFullYear() === 1970 
                              ? 'N/A' 
                              : formatDateTimeUTC7(localPlant.iotIntegration.lastWatered)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        The ESP32 will automatically water your plant when soil moisture drops below the threshold.
                      </p>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setShowESP32Modal(true)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 flex items-center"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Reconnect Device
                      </button>
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