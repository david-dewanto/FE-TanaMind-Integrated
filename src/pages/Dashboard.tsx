import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../components/Dashboard/DashboardStats';
import PlantList from '../components/Dashboard/PlantList';
import PlantDetailsModal from '../components/PlantDetails/PlantDetailsModal';
import AddPlantModal from '../components/Plants/AddPlantModal';
import { Plant, DashboardStats as DashboardStatsType, SensorData } from '../types';
import { Plus } from 'lucide-react';
import { usePlants } from '../contexts/PlantContext';
import { useSensors } from '../contexts/SensorContext';
import { apiToUiPlant } from '../utils/plantConverters';
import { LoadingSpinner, ErrorMessage } from '../components/common';

const Dashboard: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [sensorData, setSensorData] = useState<Record<string, SensorData[]>>({});
  const [stats, setStats] = useState<DashboardStatsType>({
    totalPlants: 0,
    plantsNeedingWater: 0,
    plantsNeedingAttention: 0,
    autoWateredToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { plants, isLoading: plantsLoading, error: plantsError, fetchPlants, fetchPlantsWithReadings } = usePlants();
  const { fetchPlantLogs } = useSensors();
  const navigate = useNavigate();
  
  // Calculate dashboard stats
  useEffect(() => {
    // Skip if there are no plants
    if (!Array.isArray(plants) || plants.length === 0) {
      setStats({
        totalPlants: 0,
        plantsNeedingWater: 0,
        plantsNeedingAttention: 0,
        autoWateredToday: 0
      });
      return;
    }
    
    // Convert API plants to UI plants only within this effect
    const uiPlants = plants.map(apiToUiPlant);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Count plants needing water
    const needingWater = uiPlants.filter(plant => {
      const nextWatering = new Date(plant.tracking.nextWateringDate);
      return nextWatering <= now;
    }).length;
    
    // Count plants needing attention
    const needingAttention = uiPlants.filter(plant => {
      return plant.iotIntegration.healthStatus === 'poor' || 
             plant.iotIntegration.healthStatus === 'critical';
    }).length;
    
    // Count plants auto-watered today
    const autoWateredToday = uiPlants.filter(plant => {
      if (!plant.iotIntegration.lastWatered) return false;
      const lastWatered = new Date(plant.iotIntegration.lastWatered);
      return lastWatered >= today && plant.iotIntegration.autoWateringEnabled;
    }).length;
    
    setStats({
      totalPlants: uiPlants.length,
      plantsNeedingWater: needingWater,
      plantsNeedingAttention: needingAttention,
      autoWateredToday: autoWateredToday
    });
  }, [plants]); // Only depend on the plants array from context
  
  // Initial data loading - we don't need to fetch here since PlantContext already loads data
  // Plants are already loaded once via the PlantContext's useEffect
  // This eliminates duplicate API calls

  // Fetch sensor data once plants are loaded
  useEffect(() => {
    // Skip if plants are still loading
    if (plantsLoading) return;
    
    // If there are no plants, we need to mark loading as false
    if (plants.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Flag to prevent state updates after component unmount
    let isMounted = true;
    
    const loadSensorData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare promises array to fetch all plant data in parallel
        const fetchPromises = plants.map(async (plant) => {
          try {
            const logs = await fetchPlantLogs(plant.id, 24);
            
            // Convert API sensor logs to UI sensor data
            const plantSensorData: SensorData[] = logs.map(log => ({
              timestamp: log.timestamp,
              soilHumidity: log.soil_humidity !== undefined ? log.soil_humidity : 0,
              airHumidity: log.air_humidity !== undefined ? log.air_humidity : 0,
              temperature: log.temperature !== undefined ? log.temperature : 0,
              luminance: log.luminance !== undefined ? log.luminance : 0
            }));
            
            return { plantId: plant.id, data: plantSensorData };
          } catch (err) {
            console.error(`Failed to fetch sensor data for plant ${plant.id}:`, err);
            return { plantId: plant.id, data: [] }; // Return empty data for failed fetches
          }
        });
        
        // Wait for all promises to resolve
        const results = await Promise.allSettled(fetchPromises);
        
        // Process results only if component is still mounted
        if (isMounted) {
          const sensorDataMap: Record<string, SensorData[]> = {};
          
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              sensorDataMap[result.value.plantId] = result.value.data;
            }
          });
          
          setSensorData(sensorDataMap);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to load dashboard data');
          }
          console.error('Dashboard data load error:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadSensorData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
    
    // Only re-run when plants length changes, not when the contents change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantsLoading, plants.length]);
  
  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant);
  };
  
  const handleCloseModal = () => {
    setSelectedPlant(null);
  };

  const [isAddingPlant, setIsAddingPlant] = useState(false);
  
  const handleAddPlantClick = () => {
    navigate('/dashboard/plants');
  };
  
  const handleAddPlantCancel = () => {
    setIsAddingPlant(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#056526]">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your plants</p>
        </div>
      </div>
      
      {isLoading || plantsLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="large" message="Loading dashboard data..." />
        </div>
      ) : error || plantsError ? (
        <ErrorMessage
          message={error || plantsError || 'Failed to load dashboard data'}
          onRetry={() => fetchPlants()}
          type="error"
          className="mx-auto max-w-2xl"
        />
      ) : plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Plants Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't added any plants to your collection yet. Start monitoring your plants by adding your first one!
            </p>
            <button 
              onClick={handleAddPlantClick}
              className="flex items-center justify-center mx-auto bg-[#0B9444] hover:bg-[#056526] text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Plus size={20} className="mr-2" />
              <span>Go to Plants</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <DashboardStats stats={stats} />
          
          <PlantList 
            plants={Array.isArray(plants) && plants.length > 0 ? plants.map(apiToUiPlant) : []} 
            onPlantClick={handlePlantClick}
          />
        </>
      )}
      
      {selectedPlant && (
        <PlantDetailsModal 
          plant={selectedPlant}
          sensorData={sensorData[selectedPlant.id] || []}
          onClose={handleCloseModal}
        />
      )}
      
      {isAddingPlant && (
        <AddPlantModal 
          onClose={handleAddPlantCancel} 
          onSuccess={() => {
            // Refresh plant list after adding a new plant
            fetchPlants();
            fetchPlantsWithReadings();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;