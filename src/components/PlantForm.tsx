import React, { useState, useEffect } from 'react';
import { X, Loader2, Wifi, WifiOff, Leaf, Zap, RefreshCw } from 'lucide-react';
import { Plant } from '../types';
import { usePlants } from '../contexts/PlantContext';
import { apiToUiPlant, uiToApiPlantRequest } from '../utils/plantConverters';
import { ESP32PairingModal, ESP32StatusIndicator } from './ESP32';

interface PlantFormProps {
  plant?: Plant; // If provided, we're editing an existing plant
  onClose: () => void;
  onSuccess: () => void;
}

const PlantForm: React.FC<PlantFormProps> = ({ plant, onClose, onSuccess }) => {
  const isEditMode = !!plant;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Form state
  const [nickname, setNickname] = useState('');
  const [actualName, setActualName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState(3);
  const [sunlightRequirements, setSunlightRequirements] = useState('Medium');
  const [minTemp, setMinTemp] = useState(18);
  const [maxTemp, setMaxTemp] = useState(26);
  
  // Thresholds
  const [soilHumidityMin, setSoilHumidityMin] = useState(30);
  const [soilHumidityMax, setSoilHumidityMax] = useState(70);
  const [airHumidityMin, setAirHumidityMin] = useState(40);
  const [airHumidityMax, setAirHumidityMax] = useState(60);
  const [tempMin, setTempMin] = useState(18);
  const [tempMax, setTempMax] = useState(26);
  const [lightMin, setLightMin] = useState(1500);
  const [lightMax, setLightMax] = useState(6000);
  
  // IoT device states
  const [useIotDevice, setUseIotDevice] = useState(false);
  const [deviceType, setDeviceType] = useState<'ESP32' | 'other' | ''>('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [showESP32Modal, setShowESP32Modal] = useState(false);
  
  // Auto-watering
  const [autoWatering, setAutoWatering] = useState(false);
  
  const { createPlant, updatePlant } = usePlants();
  
  // Initialize form if we're editing
  useEffect(() => {
    if (plant) {
      setNickname(plant.nickname);
      setActualName(plant.actualName);
      setDescription(plant.description);
      setLocation(plant.location);
      setWateringFrequency(plant.wateringFrequency);
      setSunlightRequirements(plant.sunlightRequirements);
      setMinTemp(plant.idealTemperatureRange.min);
      setMaxTemp(plant.idealTemperatureRange.max);
      
      // Thresholds
      setSoilHumidityMin(plant.thresholds.soilHumidity.min);
      setSoilHumidityMax(plant.thresholds.soilHumidity.max);
      setAirHumidityMin(plant.thresholds.airHumidity.min);
      setAirHumidityMax(plant.thresholds.airHumidity.max);
      setTempMin(plant.thresholds.temperature.min);
      setTempMax(plant.thresholds.temperature.max);
      setLightMin(plant.thresholds.luminance.min);
      setLightMax(plant.thresholds.luminance.max);
      
      // IoT device settings
      if (plant.iotIntegration.deviceId) {
        setUseIotDevice(true);
        setDeviceId(plant.iotIntegration.deviceId);
        setDeviceType(plant.iotIntegration.deviceType || 'other');
        setDeviceIp(plant.iotIntegration.deviceIp || '');
        setIsDeviceConnected(plant.iotIntegration.isConnected || false);
      }
      
      // Auto-watering
      setAutoWatering(plant.iotIntegration.autoWateringEnabled);
    }
  }, [plant]);
  
  // Handle ESP32 pairing completion
  const handleESP32PairingSuccess = (newDeviceId: string) => {
    setDeviceId(newDeviceId);
    setDeviceType('ESP32');
    setIsDeviceConnected(true);
    setShowESP32Modal(false);
  };
  
  // Function to toggle IoT device usage
  const toggleIotDevice = (useDevice: boolean) => {
    setUseIotDevice(useDevice);
    if (!useDevice) {
      // Reset device settings when disabling IoT
      setDeviceId('');
      setDeviceIp('');
      setIsDeviceConnected(false);
      setAutoWatering(false);
    } else {
      // Always set device type to ESP32 when enabling
      setDeviceType('ESP32');
    }
  };
  
  const validateForm = (): boolean => {
    setFormError(null);
    
    if (!nickname.trim()) {
      setFormError('Plant nickname is required');
      return false;
    }
    
    if (!actualName.trim()) {
      setFormError('Plant species name is required');
      return false;
    }
    
    if (wateringFrequency <= 0) {
      setFormError('Watering frequency must be greater than 0');
      return false;
    }
    
    if (minTemp >= maxTemp) {
      setFormError('Minimum temperature must be less than maximum temperature');
      return false;
    }
    
    if (soilHumidityMin >= soilHumidityMax) {
      setFormError('Minimum soil humidity must be less than maximum soil humidity');
      return false;
    }
    
    if (airHumidityMin >= airHumidityMax) {
      setFormError('Minimum air humidity must be less than maximum air humidity');
      return false;
    }
    
    if (tempMin >= tempMax) {
      setFormError('Minimum temperature threshold must be less than maximum temperature threshold');
      return false;
    }
    
    if (lightMin >= lightMax) {
      setFormError('Minimum light level must be less than maximum light level');
      return false;
    }
    
    // Validate IoT device settings
    if (useIotDevice && deviceType === 'ESP32' && !deviceId) {
      setFormError('Please pair with an ESP32 device or enter a device ID');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create UI plant object
      const plantData: Plant = {
        id: plant?.id || '',
        nickname,
        actualName,
        category: 'Indoor',
        species: actualName,
        dateAdded: plant?.dateAdded || new Date().toISOString(),
        age: plant?.age || '0 days',
        location,
        description,
        wateringFrequency,
        sunlightRequirements,
        fertilizerSchedule: 'Monthly',
        idealTemperatureRange: {
          min: minTemp,
          max: maxTemp,
        },
        thresholds: {
          soilHumidity: { min: soilHumidityMin, max: soilHumidityMax },
          airHumidity: { min: airHumidityMin, max: airHumidityMax },
          temperature: { min: tempMin, max: tempMax },
          luminance: { min: lightMin, max: lightMax },
        },
        iotIntegration: {
          deviceId: useIotDevice ? deviceId : '',
          deviceType: useIotDevice ? deviceType : undefined,
          deviceIp: useIotDevice && deviceIp ? deviceIp : undefined,
          isConnected: useIotDevice ? isDeviceConnected : undefined,
          lastConnected: useIotDevice && isDeviceConnected ? new Date().toISOString() : undefined,
          autoWateringEnabled: useIotDevice ? autoWatering : false,
          lastWatered: plant?.iotIntegration.lastWatered || new Date().toISOString(),
          healthStatus: plant?.iotIntegration.healthStatus || 'good',
        },
        tracking: {
          nextWateringDate: plant?.tracking.nextWateringDate || new Date().toISOString(),
          lastFertilized: plant?.tracking.lastFertilized || new Date().toISOString(),
          reminderSettings: {
            enabled: true,
            frequency: 1,
          },
        },
        image: plant?.image,
      };
      
      // Convert to API request format
      const apiPlantRequest = uiToApiPlantRequest(plantData);
      
      // Create or update
      if (isEditMode && plant) {
        await updatePlant(plant.id, apiPlantRequest);
      } else {
        await createPlant(apiPlantRequest);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('An unknown error occurred');
      }
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {showESP32Modal && (
        <ESP32PairingModal
          onClose={() => setShowESP32Modal(false)}
          onSuccess={handleESP32PairingSuccess}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-[#056526]">
            {isEditMode ? 'Edit Plant' : 'Add New Plant'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 border-b pb-2">Plant Information</h3>
                
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                    Plant Nickname *
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                    placeholder="e.g. Fern Friend"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="actualName" className="block text-sm font-medium text-gray-700 mb-1">
                    Species Name *
                  </label>
                  <input
                    id="actualName"
                    type="text"
                    value={actualName}
                    onChange={(e) => setActualName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                    placeholder="e.g. Boston Fern"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                    placeholder="e.g. Living Room"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                    placeholder="Notes about your plant..."
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Care Requirements */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 border-b pb-2">Care Requirements</h3>
                
                <div>
                  <label htmlFor="wateringFrequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Watering Frequency (days) *
                  </label>
                  <input
                    id="wateringFrequency"
                    type="number"
                    min="1"
                    max="60"
                    value={wateringFrequency}
                    onChange={(e) => setWateringFrequency(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="sunlightRequirements" className="block text-sm font-medium text-gray-700 mb-1">
                    Sunlight Requirements
                  </label>
                  <select
                    id="sunlightRequirements"
                    value={sunlightRequirements}
                    onChange={(e) => setSunlightRequirements(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                  >
                    <option value="Low">Low Light</option>
                    <option value="Medium">Medium Light</option>
                    <option value="Bright">Bright Light</option>
                    <option value="Direct">Direct Sunlight</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tempRange" className="block text-sm font-medium text-gray-700 mb-1">
                    Ideal Temperature Range (°C)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      id="minTemp"
                      type="number"
                      min="0"
                      max="40"
                      value={minTemp}
                      onChange={(e) => setMinTemp(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Min"
                    />
                    <input
                      id="maxTemp"
                      type="number"
                      min="0"
                      max="40"
                      value={maxTemp}
                      onChange={(e) => setMaxTemp(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="autoWatering"
                    type="checkbox"
                    checked={autoWatering}
                    onChange={(e) => setAutoWatering(e.target.checked)}
                    className="h-4 w-4 text-[#0B9444] focus:ring-[#39B54A] border-gray-300 rounded"
                  />
                  <label htmlFor="autoWatering" className="ml-2 block text-sm text-gray-700">
                    Enable Auto-Watering
                  </label>
                </div>
              </div>
            </div>
            
            {/* IoT Integration Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700 border-b pb-2 mb-4">IoT Integration</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className={`cursor-pointer p-3 border rounded-md flex items-center space-x-2 flex-1 ${
                    !useIotDevice 
                      ? 'border-[#0B9444] bg-[#F3FFF6] text-[#0B9444]' 
                      : 'border-gray-300 text-gray-500'
                  }`}
                  onClick={() => toggleIotDevice(false)}
                >
                  <Leaf size={20} />
                  <div>
                    <div className="font-medium">Regular Plant</div>
                    <div className="text-xs">No IoT device</div>
                  </div>
                </div>
                
                <div
                  className={`cursor-pointer p-3 border rounded-md flex items-center space-x-2 flex-1 ${
                    useIotDevice 
                      ? 'border-[#0B9444] bg-[#F3FFF6] text-[#0B9444]' 
                      : 'border-gray-300 text-gray-500'
                  }`}
                  onClick={() => toggleIotDevice(true)}
                >
                  <Wifi size={20} />
                  <div>
                    <div className="font-medium">Smart Plant</div>
                    <div className="text-xs">With IoT device</div>
                  </div>
                </div>
              </div>
              
              {useIotDevice && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-3 border border-[#0B9444] bg-[#F3FFF6] rounded-md flex items-center space-x-2 mb-4">
                    <Wifi size={18} className="text-[#0B9444]" />
                    <span className="font-medium">ESP32 Device</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        ESP32 Device ID
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setShowESP32Modal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <Wifi size={14} className="mr-1.5" />
                        Pair New Device
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="e.g. ESP32_12345"
                      readOnly={true}
                    />
                    
                    {deviceId ? (
                      <div className="mt-2 bg-green-50 p-2 rounded-md text-green-700 text-sm flex items-center">
                        <Check size={16} className="mr-1.5" />
                        ESP32 device paired successfully
                      </div>
                    ) : (
                      <div className="mt-2 bg-amber-50 p-2 rounded-md text-amber-700 text-sm">
                        Please click "Pair New Device" to set up your ESP32
                      </div>
                    )}
                    
                    {deviceId && (
                      <div className="mt-2 flex items-center text-sm">
                        <ESP32StatusIndicator 
                          isConnected={isDeviceConnected} 
                          showDetails={true} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        id="autoWatering"
                        type="checkbox"
                        checked={autoWatering}
                        onChange={(e) => setAutoWatering(e.target.checked)}
                        disabled={!deviceId}
                        className="h-4 w-4 text-[#0B9444] focus:ring-[#39B54A] border-gray-300 rounded disabled:opacity-50"
                      />
                      <label 
                        htmlFor="autoWatering" 
                        className={`text-sm font-medium ${deviceId ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        Enable automatic watering (requires connected device)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thresholds Section */}
            <div>
              <h3 className="font-medium text-gray-700 border-b pb-2 mb-4">Sensor Thresholds</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soil Humidity Range (%)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={soilHumidityMin}
                      onChange={(e) => setSoilHumidityMin(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={soilHumidityMax}
                      onChange={(e) => setSoilHumidityMax(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Air Humidity Range (%)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={airHumidityMin}
                      onChange={(e) => setAirHumidityMin(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={airHumidityMax}
                      onChange={(e) => setAirHumidityMax(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature Range (°C)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={tempMin}
                      onChange={(e) => setTempMin(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={tempMax}
                      onChange={(e) => setTempMax(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Light Level Range (lux)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={lightMin}
                      onChange={(e) => setLightMin(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={lightMax}
                      onChange={(e) => setLightMax(parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0B9444] text-white rounded-md text-sm font-medium hover:bg-[#056526] flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Plant' : 'Create Plant'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlantForm;