import React, { useState, useEffect } from 'react';
import { X, Loader2, Wifi, WifiOff, Leaf, Zap, RefreshCw, Sparkles, Info, Check, AlertTriangle, Image } from 'lucide-react';
import { Plant } from '../types';
import { usePlants } from '../contexts/PlantContext';
import { apiToUiPlant, uiToApiPlantRequest } from '../utils/plantConverters';
import { ESP32PairingModal, ESP32StatusIndicator } from './ESP32';
import { aiAnalytics, PlantCareSuggestions } from '../api/ai';
import { useAIAnalytics } from '../contexts/AIAnalyticsContext';
import { Tooltip } from './common';
import { generatePlantImage } from '../api/images';

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
  const [fertilizerSchedule, setFertilizerSchedule] = useState('Monthly');
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
  
  const { createPlant, updatePlant } = usePlants();
  const { state: aiState } = useAIAnalytics();
  
  // AI Suggestion states
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<PlantCareSuggestions | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false);
  
  // Image generation states
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Initialize form if we're editing
  useEffect(() => {
    if (plant) {
      setNickname(plant.nickname);
      setActualName(plant.actualName);
      setDescription(plant.description);
      setLocation(plant.location);
      setWateringFrequency(plant.wateringFrequency);
      setSunlightRequirements(plant.sunlightRequirements);
      setFertilizerSchedule(plant.fertilizerSchedule);
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
      
      // Set existing image if editing
      if (plant.image) {
        setPlantImage(plant.image);
      }
    }
  }, [plant]);
  
  // Handle ESP32 pairing completion
  const handleESP32PairingSuccess = (newDeviceId: string) => {
    setDeviceId(newDeviceId);
    setDeviceType('ESP32');
    setIsDeviceConnected(true);
    setShowESP32Modal(false);
  };
  
  // Generate plant image based on name
  const handleGenerateImage = async () => {
    if (!actualName && !nickname) {
      setFormError('Please enter a plant name first');
      return;
    }
    
    setIsGeneratingImage(true);
    setFormError(null);
    
    try {
      const imageUrl = await generatePlantImage({
        plantName: actualName || nickname,
        species: actualName // Use species if available
      });
      
      if (imageUrl) {
        setPlantImage(imageUrl);
      } else {
        setFormError('Could not generate image. Will use default.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setFormError('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Function to toggle IoT device usage
  const toggleIotDevice = (useDevice: boolean) => {
    setUseIotDevice(useDevice);
    if (!useDevice) {
      // Reset device settings when disabling IoT
      setDeviceId('');
      setDeviceIp('');
      setIsDeviceConnected(false);
    } else {
      // Always set device type to ESP32 when enabling
      setDeviceType('ESP32');
    }
  };
  
  // Function to get AI suggestions for plant care
  const getAISuggestions = async () => {
    if (!actualName.trim()) {
      setFormError('Please enter a plant name first');
      return;
    }
    
    if (!aiState.isAvailable) {
      setFormError('AI service is not available at the moment');
      return;
    }
    
    setIsLoadingAISuggestions(true);
    setFormError(null);
    
    try {
      const suggestions = await aiAnalytics.getPlantCareSuggestions(
        actualName,
        actualName, // Using actualName as species for now
        'Indoor' // Default category
      );
      
      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
      
      // Show a message based on confidence
      if (suggestions.plantIdentification.confidence === 'low' || suggestions.defaultFallback) {
        setFormError(`AI couldn't identify "${actualName}" specifically. Showing general plant care suggestions.`);
      }
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setFormError('Failed to get AI suggestions. Please try again.');
    } finally {
      setIsLoadingAISuggestions(false);
    }
  };
  
  // Function to apply AI suggestions to the form
  const applyAISuggestions = () => {
    if (!aiSuggestions) return;
    
    const { careRequirements, environmentalThresholds } = aiSuggestions;
    
    // Apply care requirements
    setWateringFrequency(careRequirements.wateringFrequency);
    setSunlightRequirements(careRequirements.sunlightRequirements);
    setMinTemp(careRequirements.idealTemperatureMin);
    setMaxTemp(careRequirements.idealTemperatureMax);
    
    // Apply thresholds
    setSoilHumidityMin(careRequirements.soilHumidityMin);
    setSoilHumidityMax(careRequirements.soilHumidityMax);
    setAirHumidityMin(careRequirements.airHumidityMin);
    setAirHumidityMax(careRequirements.airHumidityMax);
    setTempMin(environmentalThresholds.temperatureMin);
    setTempMax(environmentalThresholds.temperatureMax);
    setLightMin(environmentalThresholds.luminanceMin);
    setLightMax(environmentalThresholds.luminanceMax);
    
    setHasAppliedSuggestions(true);
    setShowAISuggestions(false);
    setFormError(null);
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
      
      // Generate image if not already generated and creating new plant
      if (!isEditMode && !plantImage && actualName) {
        try {
          const imageUrl = await generatePlantImage({
            plantName: actualName,
            species: actualName
          });
          if (imageUrl) {
            setPlantImage(imageUrl);
          }
        } catch (error) {
          console.error('Failed to auto-generate image:', error);
          // Continue without image
        }
      }
      
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
        fertilizerSchedule,
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
          autoWateringEnabled: useIotDevice && deviceType === 'ESP32' ? true : false,
          lastWatered: plant?.iotIntegration.lastWatered || new Date().toISOString(),
          healthStatus: plant?.iotIntegration.healthStatus || 'good',
        },
        tracking: {
          nextWateringDate: plant?.tracking.nextWateringDate || new Date().toISOString(),
          reminderSettings: {
            enabled: true,
            frequency: 1,
          },
        },
        image: plantImage || plant?.image,
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
      
      {/* AI Suggestions Modal */}
      {showAISuggestions && aiSuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
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
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="actualName" className="block text-sm font-medium text-gray-700">
                      Species Name *
                    </label>
                    {aiState.isAvailable && (
                      <Tooltip 
                        content="Get AI-powered care suggestions based on your plant's species. Our AI will recommend optimal watering, lighting, and environmental conditions."
                        position="left"
                      >
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full cursor-help flex items-center gap-1">
                          <Sparkles size={12} />
                          AI Available
                        </span>
                      </Tooltip>
                    )}
                  </div>
                  
                  <div className="relative">
                    <input
                      id="actualName"
                      type="text"
                      value={actualName}
                      onChange={(e) => {
                        setActualName(e.target.value);
                        setHasAppliedSuggestions(false); // Reset when name changes
                      }}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-24 sm:pr-32 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                      placeholder="e.g. Boston Fern, Snake Plant, Monstera"
                      required
                    />
                    
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <Tooltip 
                        content={
                          !aiState.isAvailable 
                            ? 'AI service is currently unavailable. You can still add your plant manually.' 
                            : !actualName.trim()
                            ? 'Enter a plant name first, then click to get AI-powered care suggestions'
                            : 'Get personalized care recommendations including watering schedule, lighting needs, and optimal growing conditions'
                        }
                        position="left"
                      >
                        <button
                          type="button"
                          onClick={getAISuggestions}
                          disabled={isLoadingAISuggestions || !actualName.trim() || !aiState.isAvailable}
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                            aiState.isAvailable && actualName.trim()
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isLoadingAISuggestions ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span className="hidden md:inline">Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>AI Suggest</span>
                            </>
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    {hasAppliedSuggestions && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check size={14} />
                        AI suggestions applied to care requirements
                      </p>
                    )}
                    
                    {!aiState.isAvailable && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Info size={12} />
                        AI suggestions unavailable - you can still add your plant manually
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plant Image
                  </label>
                  <div className="flex items-center space-x-3">
                    {plantImage ? (
                      <div className="relative">
                        <img 
                          src={plantImage} 
                          alt={nickname || actualName}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setPlantImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image size={32} className="text-gray-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || (!actualName && !nickname)}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        !isGeneratingImage && (actualName || nickname)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Image size={16} />
                          Generate Image
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    AI will generate an image based on the plant name
                  </p>
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
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-medium text-gray-700">Care Requirements</h3>
                  {hasAppliedSuggestions && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Sparkles size={12} />
                      AI Enhanced
                    </span>
                  )}
                </div>
                
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
                  <label htmlFor="fertilizerSchedule" className="block text-sm font-medium text-gray-700 mb-1">
                    Fertilizer Schedule
                  </label>
                  <select
                    id="fertilizerSchedule"
                    value={fertilizerSchedule}
                    onChange={(e) => setFertilizerSchedule(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
                  >
                    <option value="Never">Never</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Biweekly">Every 2 weeks</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Every 3 months</option>
                    <option value="Biannually">Twice a year</option>
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
                        ESP32 Device
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => setShowESP32Modal(true)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <Wifi size={14} className="mr-1.5" />
                        {deviceId ? 'Change Device' : 'Pair New Device'}
                      </button>
                    </div>
                    
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
                  
                  {deviceId && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-700">
                        <Info size={16} className="inline mr-1.5" />
                        Automatic watering will be enabled when the ESP32 device is connected and configured.
                      </p>
                    </div>
                  )}
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