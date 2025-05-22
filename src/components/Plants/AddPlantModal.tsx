import React, { useState } from 'react';
import { X, Wifi, Leaf, Check } from 'lucide-react';
import { usePlants } from '../../contexts/PlantContext';
import { PlantRequest } from '../../api/plants';
import { LoadingSpinner } from '../common';
import { ESP32PairingModal } from '../ESP32';

interface AddPlantModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ onClose, onSuccess }) => {
  const { createPlant, isLoading, error, clearError } = usePlants();
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // IoT device states
  const [showEsp32Modal, setShowEsp32Modal] = useState(false);
  const [useIotDevice, setUseIotDevice] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<PlantRequest>({
    nickname: '',
    plant_name: '',
    category: 'Indoor',
    species: '',
    location: '',
    description: '',
    watering_frequency: 3, // Default: every 3 days
    sunlight_requirements: 'Medium',
    fertilizer_schedule: 'Monthly',
    ideal_temperature_min: 18,
    ideal_temperature_max: 25,
    soil_humidity_threshold_min: 30,
    soil_humidity_threshold_max: 70,
    air_humidity_threshold_min: 40,
    air_humidity_threshold_max: 60,
    temperature_threshold_min: 15,
    temperature_threshold_max: 30,
    luminance_threshold_min: 1000,
    luminance_threshold_max: 10000,
    device_id: '',
    auto_watering_enabled: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.nickname) {
      errors.nickname = 'Nickname is required';
    }
    
    if (!formData.plant_name) {
      errors.plant_name = 'Plant name is required';
    }
    
    if (!formData.species) {
      errors.species = 'Species is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    
    if (formData.watering_frequency <= 0) {
      errors.watering_frequency = 'Must be a positive number';
    }
    
    // Validate min/max ranges
    if (formData.ideal_temperature_min >= formData.ideal_temperature_max) {
      errors.ideal_temperature_min = 'Minimum must be less than maximum';
    }
    
    if (formData.soil_humidity_threshold_min >= formData.soil_humidity_threshold_max) {
      errors.soil_humidity_threshold_min = 'Minimum must be less than maximum';
    }
    
    if (formData.air_humidity_threshold_min >= formData.air_humidity_threshold_max) {
      errors.air_humidity_threshold_min = 'Minimum must be less than maximum';
    }
    
    if (formData.temperature_threshold_min >= formData.temperature_threshold_max) {
      errors.temperature_threshold_min = 'Minimum must be less than maximum';
    }
    
    if (formData.luminance_threshold_min >= formData.luminance_threshold_max) {
      errors.luminance_threshold_min = 'Minimum must be less than maximum';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    
    if (useIotDevice && !formData.device_id) {
      errors.device_id = 'Please pair with an ESP32 device to continue';
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Handle ESP32 pairing completion
  const handleESP32PairingSuccess = (deviceId: string) => {
    setFormData({
      ...formData,
      device_id: deviceId
    });
    setShowEsp32Modal(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 3) {
      if (!validateStep3()) {
        return;
      }

      try {
        // Create an extended request with device type if using IoT
        const extendedFormData = {
          ...formData,
          device_type: useIotDevice ? 'ESP32' : undefined
        };
        
        await createPlant(extendedFormData);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } catch (err) {
        console.error("Failed to create plant:", err);
        // Error is already set by the PlantContext
      }
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-auto flex">
      {showEsp32Modal && (
        <ESP32PairingModal
          onClose={() => setShowEsp32Modal(false)}
          onSuccess={handleESP32PairingSuccess}
        />
      )}
      
      {/* Centered modal container with proper spacing */}
      <div className="relative m-auto w-full max-w-3xl px-4 py-6 sm:py-8">
        {/* Modal with rounded corners on all devices */}
        <div className="flex flex-col bg-white rounded-lg shadow-xl w-full max-h-[calc(100vh-3rem)] overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between bg-[#F3FFF6] px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-[#0B9444]">
              {step === 1 && 'Add New Plant - Basic Info'}
              {step === 2 && 'Add New Plant - Care Requirements'}
              {step === 3 && 'Add New Plant - Smart Features'}
            </h2>
            
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        
          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
                <button 
                  onClick={clearError}
                  className="ml-2 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nickname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${formErrors.nickname ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. Living Room Fern"
                      />
                      {formErrors.nickname && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.nickname}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="plant_name"
                        value={formData.plant_name}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${formErrors.plant_name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. Boston Fern"
                      />
                      {formErrors.plant_name && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.plant_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Species <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="species"
                        value={formData.species}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded-md ${formErrors.species ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. Nephrolepis exaltata"
                      />
                      {formErrors.species && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.species}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Indoor">Indoor</option>
                        <option value="Outdoor">Outdoor</option>
                        <option value="Succulent">Succulent</option>
                        <option value="Herb">Herb</option>
                        <option value="Vegetable">Vegetable</option>
                        <option value="Fruit">Fruit</option>
                        <option value="Flower">Flower</option>
                        <option value="Tree">Tree</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="e.g. Living Room Window"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Add any notes or details about your plant..."
                    ></textarea>
                  </div>
                </div>
              )}
              
              {/* Step 2: Care Requirements */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Watering Frequency (days)
                      </label>
                      <input
                        type="number"
                        name="watering_frequency"
                        value={formData.watering_frequency}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full p-2 border rounded-md ${formErrors.watering_frequency ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {formErrors.watering_frequency && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.watering_frequency}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sunlight Requirements
                      </label>
                      <select
                        name="sunlight_requirements"
                        value={formData.sunlight_requirements}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Low">Low Light</option>
                        <option value="Medium">Medium Light</option>
                        <option value="High">Bright Light</option>
                        <option value="Full Sun">Full Sun</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fertilizer Schedule
                      </label>
                      <select
                        name="fertilizer_schedule"
                        value={formData.fertilizer_schedule}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Never">Never</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Bimonthly">Every 2 Months</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Biannually">Twice a Year</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-700 mb-3">Ideal Conditions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soil Humidity Range (%)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            name="soil_humidity_threshold_min"
                            value={formData.soil_humidity_threshold_min}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className={`w-full p-2 border rounded-md ${formErrors.soil_humidity_threshold_min ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            name="soil_humidity_threshold_max"
                            value={formData.soil_humidity_threshold_max}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Max"
                          />
                        </div>
                        {formErrors.soil_humidity_threshold_min && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.soil_humidity_threshold_min}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Air Humidity Range (%)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            name="air_humidity_threshold_min"
                            value={formData.air_humidity_threshold_min}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className={`w-full p-2 border rounded-md ${formErrors.air_humidity_threshold_min ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            name="air_humidity_threshold_max"
                            value={formData.air_humidity_threshold_max}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Max"
                          />
                        </div>
                        {formErrors.air_humidity_threshold_min && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.air_humidity_threshold_min}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature Range (°C)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            name="temperature_threshold_min"
                            value={formData.temperature_threshold_min}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${formErrors.temperature_threshold_min ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            name="temperature_threshold_max"
                            value={formData.temperature_threshold_max}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Max"
                          />
                        </div>
                        {formErrors.temperature_threshold_min && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.temperature_threshold_min}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ideal Temperature (°C)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            name="ideal_temperature_min"
                            value={formData.ideal_temperature_min}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${formErrors.ideal_temperature_min ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            name="ideal_temperature_max"
                            value={formData.ideal_temperature_max}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Max"
                          />
                        </div>
                        {formErrors.ideal_temperature_min && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.ideal_temperature_min}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Light Intensity Range (lux)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            name="luminance_threshold_min"
                            value={formData.luminance_threshold_min}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full p-2 border rounded-md ${formErrors.luminance_threshold_min ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Min"
                          />
                          <span>to</span>
                          <input
                            type="number"
                            name="luminance_threshold_max"
                            value={formData.luminance_threshold_max}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Max"
                          />
                        </div>
                        {formErrors.luminance_threshold_min && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.luminance_threshold_min}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 3: Smart Features */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-700 mb-3">IoT Integration</h3>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`cursor-pointer p-3 border rounded-md flex items-center space-x-2 flex-1 ${
                          !useIotDevice 
                            ? 'border-[#0B9444] bg-[#F3FFF6] text-[#0B9444]' 
                            : 'border-gray-300 text-gray-500'
                        }`}
                        onClick={() => {
                          setUseIotDevice(false);
                          setFormData({
                            ...formData,
                            device_id: '',
                            auto_watering_enabled: false
                          });
                        }}
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
                        onClick={() => {
                          setUseIotDevice(true);
                        }}
                      >
                        <Wifi size={20} />
                        <div>
                          <div className="font-medium">Smart Plant</div>
                          <div className="text-xs">With ESP32 device</div>
                        </div>
                      </div>
                    </div>
                    
                    {useIotDevice && (
                      <div className="mt-4 space-y-4">
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
                              onClick={() => setShowEsp32Modal(true)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
                            >
                              <Wifi size={14} className="mr-1.5" />
                              Pair New Device
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            name="device_id"
                            value={formData.device_id}
                            onChange={handleInputChange}
                            className={`w-full p-2 border rounded-md ${formErrors.device_id ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="e.g. ESP32_12345"
                            readOnly={true}
                          />
                          
                          {formErrors.device_id && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.device_id}</p>
                          )}
                          
                          {formData.device_id ? (
                            <div className="mt-2 bg-green-50 p-2 rounded-md text-green-700 text-sm flex items-center">
                              <Check size={16} className="mr-1.5" />
                              ESP32 device paired successfully
                            </div>
                          ) : (
                            <div className="mt-2 bg-amber-50 p-2 rounded-md text-amber-700 text-sm">
                              Please click "Pair New Device" to set up your ESP32
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 py-2">
                          <input
                            type="checkbox"
                            id="auto_watering_enabled"
                            name="auto_watering_enabled"
                            checked={formData.auto_watering_enabled}
                            onChange={handleInputChange}
                            disabled={!formData.device_id}
                            className="h-4 w-4 text-[#0B9444] rounded border-gray-300 focus:ring-[#0B9444] disabled:opacity-50"
                          />
                          <label 
                            htmlFor="auto_watering_enabled" 
                            className={`text-sm font-medium ${
                              !formData.device_id ? 'text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            Enable automatic watering (requires connected device)
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-[#F3FFF6] p-4 rounded-md mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Smart Features Overview</h3>
                    <p className="text-sm text-gray-600">
                      Connecting your plant to an ESP32 device will enable:
                    </p>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                      <li>Real-time monitoring of soil moisture, temperature, humidity and light</li>
                      <li>Automated watering based on soil moisture levels</li>
                      <li>Alerts when conditions fall outside optimal ranges</li>
                      <li>Historical data tracking and analytics</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-2">
                    <h3 className="font-medium text-gray-700 mb-2">Ready to add this plant?</h3>
                    <p className="text-sm text-gray-600">
                      Review the information you've entered and click "Add Plant" to create your plant profile.
                      You can edit these details later from the plant's details page.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          <div className="flex-shrink-0 bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-[#0B9444] border border-[#0B9444] rounded-md hover:bg-[#F3FFF6]"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-[#0B9444] text-white rounded-md hover:bg-[#056526]"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-[#0B9444] text-white rounded-md hover:bg-[#056526] flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Add Plant'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlantModal;