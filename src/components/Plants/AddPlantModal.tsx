import React, { useState } from 'react';
import { X, Wifi, Leaf, Check, Sparkles, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { usePlants } from '../../contexts/PlantContext';
import { PlantRequest } from '../../api/plants';
import { LoadingSpinner, Tooltip, EnhancedTooltip } from '../common';
import { ESP32PairingModal } from '../ESP32';
import { aiAnalytics, PlantCareSuggestions } from '../../api/ai';
import { useAIAnalytics } from '../../contexts/AIAnalyticsContext';

interface AddPlantModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPlantModal: React.FC<AddPlantModalProps> = ({ onClose, onSuccess }) => {
  const { createPlant, isLoading, error, clearError } = usePlants();
  const { state: aiState } = useAIAnalytics();
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // IoT device states
  const [showEsp32Modal, setShowEsp32Modal] = useState(false);
  const [useIotDevice, setUseIotDevice] = useState(false);
  
  // AI Suggestion states
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<PlantCareSuggestions | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false);
  
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
  
  // Function to get AI suggestions for plant care
  const getAISuggestions = async () => {
    if (!formData.plant_name.trim()) {
      setFormErrors({ plant_name: 'Please enter a plant name first' });
      return;
    }
    
    if (!aiState.isAvailable) {
      setFormErrors({ ai: 'AI service is not available at the moment' });
      return;
    }
    
    setIsLoadingAISuggestions(true);
    
    try {
      const suggestions = await aiAnalytics.getPlantCareSuggestions(
        formData.plant_name,
        formData.species || formData.plant_name,
        formData.category
      );
      
      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
      
      // Show a message based on confidence
      if (suggestions.plantIdentification.confidence === 'low' || suggestions.defaultFallback) {
        setFormErrors({ ai: `AI couldn't identify "${formData.plant_name}" specifically. Showing general plant care suggestions.` });
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setFormErrors({ ai: 'Failed to get AI suggestions. Please try again.' });
    } finally {
      setIsLoadingAISuggestions(false);
    }
  };
  
  // Function to apply AI suggestions to the form
  const applyAISuggestions = () => {
    if (!aiSuggestions) return;
    
    const { careRequirements, environmentalThresholds } = aiSuggestions;
    
    setFormData({
      ...formData,
      // Update species if AI found a better match
      species: aiSuggestions.plantIdentification.scientificName !== 'Unknown' 
        ? aiSuggestions.plantIdentification.scientificName 
        : formData.species,
      // Apply care requirements
      watering_frequency: careRequirements.wateringFrequency,
      sunlight_requirements: careRequirements.sunlightRequirements,
      fertilizer_schedule: careRequirements.fertilizerSchedule,
      ideal_temperature_min: careRequirements.idealTemperatureMin,
      ideal_temperature_max: careRequirements.idealTemperatureMax,
      // Apply thresholds
      soil_humidity_threshold_min: careRequirements.soilHumidityMin,
      soil_humidity_threshold_max: careRequirements.soilHumidityMax,
      air_humidity_threshold_min: careRequirements.airHumidityMin,
      air_humidity_threshold_max: careRequirements.airHumidityMax,
      temperature_threshold_min: environmentalThresholds.temperatureMin,
      temperature_threshold_max: environmentalThresholds.temperatureMax,
      luminance_threshold_min: environmentalThresholds.luminanceMin,
      luminance_threshold_max: environmentalThresholds.luminanceMax,
    });
    
    setHasAppliedSuggestions(true);
    setShowAISuggestions(false);
    setFormErrors({}); // Clear any errors
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
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      {showEsp32Modal && (
        <ESP32PairingModal
          onClose={() => setShowEsp32Modal(false)}
          onSuccess={handleESP32PairingSuccess}
        />
      )}
      
      {/* AI Suggestions Modal */}
      {showAISuggestions && aiSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={() => setShowAISuggestions(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={20} />
                  AI Plant Care Suggestions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {aiSuggestions.plantIdentification.confidence === 'high' 
                    ? `Identified as: ${aiSuggestions.plantIdentification.commonName}`
                    : aiSuggestions.defaultFallback
                    ? 'General houseplant care recommendations'
                    : `Best match: ${aiSuggestions.plantIdentification.commonName}`
                  }
                </p>
              </div>
              <button 
                onClick={() => setShowAISuggestions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Plant Identification */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Info size={16} />
                  Plant Identification
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Common Name:</span> {aiSuggestions.plantIdentification.commonName}</p>
                  <p><span className="font-medium">Scientific Name:</span> {aiSuggestions.plantIdentification.scientificName}</p>
                  <p><span className="font-medium">Family:</span> {aiSuggestions.plantIdentification.family}</p>
                  <p><span className="font-medium">Confidence:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      aiSuggestions.plantIdentification.confidence === 'high' ? 'bg-green-100 text-green-700' :
                      aiSuggestions.plantIdentification.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {aiSuggestions.plantIdentification.confidence}
                    </span>
                  </p>
                  {aiSuggestions.plantIdentification.notes && (
                    <p className="text-gray-600 italic mt-2">{aiSuggestions.plantIdentification.notes}</p>
                  )}
                </div>
              </div>
              
              {/* Care Requirements */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Recommended Care Settings</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Watering:</p>
                    <p>Every {aiSuggestions.careRequirements.wateringFrequency} days</p>
                    <p className="text-xs text-gray-600">{aiSuggestions.careRequirements.wateringNotes}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Sunlight:</p>
                    <p>{aiSuggestions.careRequirements.sunlightRequirements}</p>
                    <p className="text-xs text-gray-600">{aiSuggestions.careRequirements.sunlightNotes}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Temperature:</p>
                    <p>{aiSuggestions.careRequirements.idealTemperatureMin}°C - {aiSuggestions.careRequirements.idealTemperatureMax}°C</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Humidity:</p>
                    <p>Soil: {aiSuggestions.careRequirements.soilHumidityMin}%-{aiSuggestions.careRequirements.soilHumidityMax}%</p>
                    <p>Air: {aiSuggestions.careRequirements.airHumidityMin}%-{aiSuggestions.careRequirements.airHumidityMax}%</p>
                  </div>
                </div>
              </div>
              
              {/* Tips and Common Issues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Care Tips</h4>
                  <ul className="text-sm space-y-1">
                    {aiSuggestions.generalTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Common Issues</h4>
                  <ul className="text-sm space-y-1">
                    {aiSuggestions.commonIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Default Fallback Warning */}
              {aiSuggestions.defaultFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle size={16} className="inline mr-2" />
                    These are general plant care recommendations. The AI couldn't identify your specific plant, 
                    but these settings work well for most common houseplants.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowAISuggestions(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={applyAISuggestions}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
              >
                <Check size={16} />
                Apply Suggestions
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Centered modal container with proper spacing */}
      <div className="relative m-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8" onClick={(e) => e.stopPropagation()}>
        {/* Modal with rounded corners matching AI chat */}
        <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full border border-gray-200 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                <Leaf size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {step === 1 && 'Add New Plant - Basic Info'}
                  {step === 2 && 'Add New Plant - Care Requirements'}
                  {step === 3 && 'Add New Plant - Smart Features'}
                </h2>
                <p className="text-sm text-gray-600">
                  {step === 1 && 'Tell us about your new plant'}
                  {step === 2 && 'Set up care preferences'}
                  {step === 3 && 'Configure smart monitoring'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        
          {/* Content area */}
          <div className="px-6 py-6 flex-1 overflow-y-auto">
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
            
            {formErrors.ai && (
              <div className="mb-4 p-3 bg-amber-100 text-amber-700 rounded-md flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm">{formErrors.ai}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* First Row - Nickname and Plant Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nickname Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Nickname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formErrors.nickname ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors`}
                        placeholder="e.g. Living Room Fern"
                      />
                      {formErrors.nickname && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {formErrors.nickname}
                        </p>
                      )}
                    </div>
                    
                    {/* Plant Name Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Plant Name <span className="text-red-500">*</span>
                        </label>
                        {aiState.isAvailable && (
                          <Tooltip
                            content="AI-powered plant care available"
                            position="bottom"
                          >
                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-flex items-center gap-1 border border-purple-200">
                              <Sparkles size={12} className="animate-pulse" />
                              AI Available
                            </span>
                          </Tooltip>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative group">
                          <input
                            type="text"
                            name="plant_name"
                            value={formData.plant_name}
                            onChange={(e) => {
                              handleInputChange(e);
                              setHasAppliedSuggestions(false);
                            }}
                            className={`w-full px-4 py-3 border rounded-lg ${
                              formErrors.plant_name ? 'border-red-500' : 'border-gray-300'
                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors`}
                            placeholder="e.g. Boston Fern, Snake Plant, Monstera"
                          />
                        </div>
                        
                        {/* AI Suggestion Button - Separate from input */}
                        <div className="flex justify-end">
                          <Tooltip
                            content={
                              !aiState.isAvailable 
                                ? 'AI service temporarily offline - manual entry still available'
                                : !formData.plant_name.trim()
                                ? 'Enter your plant name above to get AI-powered care suggestions'
                                : 'Click to get personalized care recommendations from AI'
                            }
                            position="left"
                          >
                            <button
                              type="button"
                              onClick={getAISuggestions}
                              disabled={isLoadingAISuggestions || !formData.plant_name.trim() || !aiState.isAvailable}
                              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
                                aiState.isAvailable && formData.plant_name.trim()
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              }`}
                            >
                              {isLoadingAISuggestions ? (
                                <>
                                  <div className="relative">
                                    <Loader2 size={16} className="animate-spin" />
                                  </div>
                                  <span>Analyzing...</span>
                                </>
                              ) : (
                                <>
                                  <div className={`relative ${aiState.isAvailable && formData.plant_name.trim() ? 'text-yellow-300' : 'text-gray-400'}`}>
                                    <Sparkles size={16} className={aiState.isAvailable && formData.plant_name.trim() ? 'animate-pulse' : ''} />
                                  </div>
                                  <span>Get AI Suggestions</span>
                                </>
                              )}
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                      
                      {formErrors.plant_name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {formErrors.plant_name}
                        </p>
                      )}
                      
                      {hasAppliedSuggestions && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check size={14} />
                          AI suggestions applied
                        </p>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* Second Row - Species and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Species Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Species <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="species"
                        value={formData.species}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          formErrors.species ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors`}
                        placeholder="e.g. Nephrolepis exaltata"
                      />
                      {formErrors.species && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {formErrors.species}
                        </p>
                      )}
                    </div>
                    
                    {/* Category Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-colors appearance-none bg-white"
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
                  
                  {/* Location Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors"
                      placeholder="e.g. Living Room Window"
                    />
                  </div>
                  
                  {/* Description Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-colors resize-none"
                      placeholder="Add any notes or details about your plant..."
                    />
                  </div>
                </div>
              )}
              
              {/* Step 2: Care Requirements */}
              {step === 2 && (
                <div className="space-y-4">
                  {hasAppliedSuggestions && (
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg flex items-center gap-2">
                      <Sparkles className="text-purple-600" size={16} />
                      <span className="text-sm text-purple-700">
                        Care requirements have been enhanced with AI suggestions for {formData.plant_name}
                      </span>
                    </div>
                  )}
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
          
          {/* Footer with navigation buttons */}
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex justify-between items-center border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
              >
                Cancel
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[120px]"
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