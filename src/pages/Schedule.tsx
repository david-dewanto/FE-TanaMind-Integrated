import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplets, Loader2 } from 'lucide-react';
import { usePlants } from '../contexts/PlantContext';
import { apiToUiPlant } from '../utils/plantConverters';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import { toUTC7, formatDateTimeUTC7 } from '../utils/dateUtils';
import { Plant as UIPlant } from '../types';

const Schedule: React.FC = () => {
  const { plants, isLoading, error, waterPlant: contextWaterPlant } = usePlants();
  const [wateringPlant, setWateringPlant] = useState<string | null>(null);
  const [localPlants, setLocalPlants] = useState<UIPlant[]>([]);
  
  // Update local plants when context plants change
  useEffect(() => {
    // Convert API plants to UI plants and sort by next watering date (in UTC+7)
    const sortedPlants = plants.map(apiToUiPlant).sort((a, b) => 
      toUTC7(a.tracking.nextWateringDate).getTime() - toUTC7(b.tracking.nextWateringDate).getTime()
    );
    setLocalPlants(sortedPlants);
  }, [plants]);

  const formatDate = (dateStr: string) => {
    // Use our UTC+7 formatter for consistent timezone display
    const dateUTC7 = toUTC7(dateStr);
    return dateUTC7.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dateStr: string) => {
    // Get current time in UTC+7
    const now = new Date();
    // Convert target date to UTC+7
    const target = toUTC7(dateStr);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const handleWaterPlant = async (plantId: string) => {
    try {
      setWateringPlant(plantId);
      
      // Call the backend API to water the plant
      const updatedPlant = await contextWaterPlant(parseInt(plantId));
      
      // Update local state immediately for responsive UI
      // This ensures the user sees the updated watering info without refreshing
      setLocalPlants(prevPlants => {
        return prevPlants.map(plant => {
          if (plant.id === plantId) {
            // Create an updated plant with new watering information
            return {
              ...plant,
              iotIntegration: {
                ...plant.iotIntegration,
                lastWatered: updatedPlant.last_watered
              },
              tracking: {
                ...plant.tracking,
                nextWateringDate: updatedPlant.next_watering_date
              }
            };
          }
          return plant;
        }).sort((a, b) => 
          toUTC7(a.tracking.nextWateringDate).getTime() - toUTC7(b.tracking.nextWateringDate).getTime()
        );
      });
    } catch (error) {
      console.error('Failed to water plant:', error);
    } finally {
      setWateringPlant(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#056526]">Watering Schedule</h1>
        <p className="text-gray-600 mt-1">Keep track of your plants' watering needs</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="large" message="Loading watering schedule..." />
        </div>
      ) : error ? (
        <ErrorMessage
          message={error || 'Failed to load watering schedule'}
          onRetry={() => usePlants().fetchPlants()}
          type="error"
          className="mx-auto max-w-2xl"
        />
      ) : localPlants.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Plants to Schedule</h3>
          <p className="text-gray-600">Add plants to see their watering schedule.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {localPlants.map((plant) => {
            const now = new Date();
            // Convert next watering and last watered dates to UTC+7 for comparison
            const nextWatering = toUTC7(plant.tracking.nextWateringDate);
            const lastWatered = toUTC7(plant.iotIntegration.lastWatered);
            const isOverdue = nextWatering < now;
            const timeSinceLastWatered = now.getTime() - lastWatered.getTime();
            const totalWateringPeriod = nextWatering.getTime() - lastWatered.getTime();
            const progressPercentage = Math.min(100, Math.max(0, 
              (timeSinceLastWatered / totalWateringPeriod) * 100
            ));
            
            return (
              <div key={plant.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      {plant.image && (
                        <img 
                          src={plant.image} 
                          alt={plant.nickname} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#056526]">{plant.nickname}</h3>
                      <p className="text-sm text-gray-500">{plant.actualName}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Calendar size={16} className="mr-1" />
                        <span>{formatDate(plant.tracking.nextWateringDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="mr-1 text-gray-500" />
                      <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                        {getTimeRemaining(plant.tracking.nextWateringDate)} {isOverdue ? '' : 'remaining'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleWaterPlant(plant.id)}
                      disabled={wateringPlant === plant.id}
                      className={`mt-2 flex items-center px-3 py-1 ${
                        isOverdue 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-[#DFF3E2] text-[#0B9444] hover:bg-[#CDE0D4]'
                      } rounded-md text-sm transition-colors`}
                    >
                      {wateringPlant === plant.id ? (
                        <LoadingSpinner size="small" className="mr-1" />
                      ) : (
                        <Droplets size={16} className="mr-1" />
                      )}
                      Water Now
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverdue ? 'bg-red-500' : 'bg-[#0B9444]'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    Every {plant.wateringFrequency} days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Schedule;