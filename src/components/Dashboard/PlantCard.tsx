import React, { useState } from 'react';
import { Plant } from '../../types';
import { Droplets, Sun, Thermometer, Check, AlertTriangle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { ESP32StatusIndicator } from '../ESP32';

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const daysUntilWatering = () => {
    const nextWatering = new Date(plant.tracking.nextWateringDate);
    const today = new Date();
    const diffTime = nextWatering.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHealthStatusColor = () => {
    switch (plant.iotIntegration.healthStatus) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-[#DFF3E2] text-[#0B9444]';
      case 'fair':
        return 'bg-blue-100 text-blue-800';
      case 'poor':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWateringIndicator = () => {
    const days = daysUntilWatering();
    if (days <= 0) {
      return (
        <div className="flex items-center text-red-500">
          <Droplets size={16} className="mr-1" />
          <span className="text-xs font-medium">Water now!</span>
        </div>
      );
    } else if (days === 1) {
      return (
        <div className="flex items-center text-amber-500">
          <Droplets size={16} className="mr-1" />
          <span className="text-xs font-medium">Tomorrow</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-[#0B9444]">
          <Droplets size={16} className="mr-1" />
          <span className="text-xs font-medium">In {days} days</span>
        </div>
      );
    }
  };

  const getStatus = () => {
    const healthStatus = plant.iotIntegration.healthStatus;
    if (healthStatus === 'excellent' || healthStatus === 'good') {
      return (
        <div className="flex items-center text-[#0B9444]">
          <Check size={16} className="mr-1" />
          <span className="text-xs font-medium">Healthy</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-amber-500">
          <AlertTriangle size={16} className="mr-1" />
          <span className="text-xs font-medium">Needs attention</span>
        </div>
      );
    }
  };
  
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onEdit) onEdit();
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDelete) onDelete();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
    >
      <div 
        className="h-40 bg-gray-200 relative cursor-pointer"
        onClick={onClick}
      >
        {plant.image && (
          <img 
            src={plant.image} 
            alt={plant.nickname} 
            className="w-full h-full object-cover"
          />
        )}
        {plant.iotIntegration.healthStatus !== 'excellent' && plant.iotIntegration.healthStatus !== 'good' && (
          <div 
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor()}`}
          >
            {plant.iotIntegration.healthStatus.charAt(0).toUpperCase() + plant.iotIntegration.healthStatus.slice(1)}
          </div>
        )}
      </div>
      
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-[#056526]">{plant.nickname}</h3>
            <p className="text-xs text-gray-500">{plant.actualName}</p>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical size={16} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10">
                  {onEdit && (
                    <button 
                      onClick={handleEdit}
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit size={14} className="mr-2" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={handleDelete}
                      className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3">
          {getWateringIndicator()}
          {getStatus()}
        </div>
        
        {/* IoT Status Indicator - only show if device_id exists */}
        {plant.iotIntegration.deviceId && (
          <div className="mt-2 border-t pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              {plant.iotIntegration.deviceType === 'ESP32' ? (
                <span>ESP32</span>
              ) : (
                <span>IoT Device</span>
              )}
              {plant.iotIntegration.deviceId && (
                <span className="text-gray-400">({plant.iotIntegration.deviceId.slice(0, 8)})</span>
              )}
            </div>
            <ESP32StatusIndicator 
              isConnected={plant.iotIntegration.isConnected || false} 
              lastConnected={plant.iotIntegration.lastConnected}
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center">
            <Droplets size={16} className="text-blue-500 mb-1" />
            <span className="text-gray-600">Every {plant.wateringFrequency}d</span>
          </div>
          <div className="flex flex-col items-center">
            <Sun size={16} className="text-amber-500 mb-1" />
            <span className="text-gray-600">{plant.sunlightRequirements.split(' ')[0]}</span>
          </div>
          <div className="flex flex-col items-center">
            <Thermometer size={16} className="text-red-400 mb-1" />
            <span className="text-gray-600">{plant.idealTemperatureRange.min}°-{plant.idealTemperatureRange.max}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;