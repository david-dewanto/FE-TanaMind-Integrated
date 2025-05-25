import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePlants } from '../../contexts/PlantContext';
import { PlantRequest } from '../../api/plants';
import { LoadingSpinner } from '../common';
import { Plant } from '../../types';
import { uiToApiPlantRequest } from '../../utils/plantConverters';

interface EditPlantModalProps {
  plant: Plant;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditPlantModal: React.FC<EditPlantModalProps> = ({ plant, onClose, onSuccess }) => {
  const { updatePlant, isLoading, error, clearError } = usePlants();
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Initialize form data from the plant prop
  const [formData, setFormData] = useState<PlantRequest>({
    nickname: '',
    plant_name: '',
    category: 'Indoor',
    species: '',
    location: '',
    description: '',
    watering_frequency: 3,
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

  // Load plant data into form
  useEffect(() => {
    if (plant) {
      setFormData({
        nickname: plant.nickname,
        plant_name: plant.actualName,
        category: plant.category,
        species: plant.species,
        location: plant.location,
        description: plant.description,
        watering_frequency: plant.wateringFrequency,
        sunlight_requirements: plant.sunlightRequirements,
        fertilizer_schedule: plant.fertilizerSchedule,
        ideal_temperature_min: plant.idealTemperatureRange.min,
        ideal_temperature_max: plant.idealTemperatureRange.max,
        soil_humidity_threshold_min: plant.thresholds.soilHumidity.min,
        soil_humidity_threshold_max: plant.thresholds.soilHumidity.max,
        air_humidity_threshold_min: plant.thresholds.airHumidity.min,
        air_humidity_threshold_max: plant.thresholds.airHumidity.max,
        temperature_threshold_min: plant.thresholds.temperature.min,
        temperature_threshold_max: plant.thresholds.temperature.max,
        luminance_threshold_min: plant.thresholds.luminance.min,
        luminance_threshold_max: plant.thresholds.luminance.max,
        device_id: plant.iotIntegration.deviceId,
        auto_watering_enabled: plant.iotIntegration.autoWateringEnabled
      });
    }
  }, [plant]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 3) {
      try {
        // Call updatePlant with the plant ID and the new data
        await updatePlant(parseInt(plant.id), formData);
        
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } catch (err) {
        console.error("Failed to update plant:", err);
        // Error is already set by the PlantContext
      }
    }
  };
  
  return (
    <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-[#F3FFF6] px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#0B9444]">
            {step === 1 && 'Edit Plant - Basic Info'}
            {step === 2 && 'Edit Plant - Care Requirements'}
            {step === 3 && 'Edit Plant - Smart Features'}
          </h2>
          
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 py-4 overflow-y-auto">
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
                {formData.device_id && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <h4 className="font-medium text-green-700 mb-1">ESP32 Device Connected</h4>
                    <p className="text-sm text-green-600">
                      Device ID: {formData.device_id}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      To change the device, please remove this plant and create a new one with the desired device.
                    </p>
                  </div>
                )}
                
                {!formData.device_id && (
                  <div className="bg-amber-50 p-4 rounded-md">
                    <h4 className="font-medium text-amber-700 mb-1">No Device Connected</h4>
                    <p className="text-sm text-amber-600">
                      This plant is not connected to an ESP32 device. To add IoT monitoring, please create a new plant with device pairing.
                    </p>
                  </div>
                )}
                
                <div className="bg-[#F3FFF6] p-4 rounded-md mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Smart Features Overview</h3>
                  <p className="text-sm text-gray-600">
                    Connecting your plant to a compatible IoT device will enable:
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Real-time monitoring of soil moisture, temperature, humidity and light</li>
                    <li>Automatic watering when soil moisture drops below threshold (ESP32 devices)</li>
                    <li>Alerts when conditions fall outside optimal ranges</li>
                    <li>Historical data tracking and analytics</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <h3 className="font-medium text-gray-700 mb-2">Ready to save changes?</h3>
                  <p className="text-sm text-gray-600">
                    Review the information you've entered and click "Save Changes" to update your plant profile.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
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
              {isLoading ? <LoadingSpinner size="small" /> : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPlantModal;