import React, { useState, useEffect } from 'react';
import PlantList from '../components/Dashboard/PlantList';
import PlantDetailsModal from '../components/PlantDetails/PlantDetailsModal';
import AddPlantModal from '../components/Plants/AddPlantModal';
import EditPlantModal from '../components/Plants/EditPlantModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Plant, SensorData } from '../types';
import { Plus } from 'lucide-react';
import { usePlants } from '../contexts/PlantContext';
import { useSensors } from '../contexts/SensorContext';
import { apiToUiPlant } from '../utils/plantConverters';
import { LoadingSpinner, ErrorMessage } from '../components/common';

const Plants: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [sensorData, setSensorData] = useState<Record<string, SensorData[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form and Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { plants, isLoading: plantsLoading, error: plantsError, fetchPlants, deletePlant } = usePlants();
  const { fetchPlantLogs } = useSensors();
  
  // Convert API plants to UI plants - handle empty plants array
  const uiPlants = Array.isArray(plants) && plants.length > 0 ? plants.map(apiToUiPlant) : [];
  
  // Track if we've already loaded the data to prevent infinite loops
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Initial data load when component mounts - only runs ONCE
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (initialLoadDone) return; // Skip if we've already loaded initial data
      
      try {
        setIsLoading(true);
        await fetchPlants();
        
        if (isMounted) {
          setInitialLoadDone(true);
        }
      } catch (err) {
        console.error("Initial plant load error:", err);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  // Run this effect only once when component mounts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle loading state for empty plants array
  useEffect(() => {
    // Once the plants data is loaded (no longer loading) and there are no plants
    // we need to ensure loading state is set to false
    if (!plantsLoading && initialLoadDone) {
      setIsLoading(false);
    }
  }, [plantsLoading, initialLoadDone]);

  // Only fetch sensor data after plants are loaded successfully and there are plants to load data for
  useEffect(() => {
    // Only run this effect when:
    // 1. Initial plant data is loaded
    // 2. Plant data is not currently loading
    // 3. There are actual plants to fetch data for
    if (!initialLoadDone || plantsLoading || plants.length === 0) {
      return;
    }
    
    let isMounted = true;
    
    const loadSensorData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Create an array of promises for concurrent fetching
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
            return { plantId: plant.id, data: [] }; // Return empty data on error
          }
        });
        
        // Wait for all promises to resolve
        const results = await Promise.allSettled(fetchPromises);
        
        if (isMounted) {
          // Create sensor data map
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
            setError('Failed to load plants data');
          }
          console.error('Plants data load error:', err);
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
  // CRITICAL: Sensor data should only reload if plants.length changes OR initialLoadDone changes
  // This prevents infinite loops while still ensuring we get data when plants change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoadDone, plants.length]);
  
  const handlePlantClick = (plant: Plant) => {
    setSelectedPlant(plant);
  };
  
  const handleCloseModal = () => {
    setSelectedPlant(null);
  };

  const handleOpenAddForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = async () => {
    // Set loading state to show loading spinner
    setIsLoading(true);
    
    try {
      // Fetch plants with the latest data
      await fetchPlants();
      
      // Note: No need to reset initialLoadDone because it's already set to true
      // and we rely on plants.length changing to trigger the sensor data fetch
    } catch (err) {
      console.error("Error fetching plants after adding new plant:", err);
      // Ensure loading state is set to false in case of error
      setIsLoading(false);
    }
  };

  const handleEditClick = (plant: Plant) => {
    setPlantToEdit(plant);
    setIsEditFormOpen(true);
    setSelectedPlant(null);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setPlantToEdit(null);
  };

  const handleEditSuccess = async () => {
    // Set loading state to show loading spinner
    setIsLoading(true);
    
    try {
      // Fetch plants with the latest data
      await fetchPlants();
    } catch (err) {
      console.error("Error fetching plants after editing plant:", err);
      // Ensure loading state is set to false in case of error
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (plant: Plant) => {
    setPlantToDelete(plant);
    setIsDeleteModalOpen(true);
    setSelectedPlant(null);
  };

  const handleConfirmDelete = async () => {
    if (plantToDelete) {
      try {
        setIsDeleting(true);
        await deletePlant(plantToDelete.id);
        setIsDeleteModalOpen(false);
        setPlantToDelete(null);
        
        // Manually set loading state to true to show spinner while refetching
        setIsLoading(true);
        await fetchPlants();
        
        // Loading state will be updated automatically in the effects
      } catch (error) {
        console.error('Failed to delete plant:', error);
        // Make sure loading states are reset in case of error
        setIsLoading(false);
        setIsDeleting(false);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPlantToDelete(null);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#056526]">My Plants</h1>
          <p className="text-gray-600 mt-1">Manage your plant collection</p>
        </div>
        
        <button 
          onClick={handleOpenAddForm}
          className="mt-4 sm:mt-0 flex items-center bg-[#0B9444] hover:bg-[#056526] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} className="mr-1" />
          <span>Add New Plant</span>
        </button>
      </div>
      
      {isLoading || plantsLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size="large" message="Loading plants..." />
        </div>
      ) : error || plantsError ? (
        <ErrorMessage
          message={error || plantsError || 'Failed to load plants'}
          onRetry={() => fetchPlants()}
          type="error"
          className="mx-auto max-w-2xl"
        />
      ) : uiPlants.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Plants Yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first plant to your collection.</p>
          <button 
            onClick={handleOpenAddForm}
            className="inline-flex items-center bg-[#0B9444] hover:bg-[#056526] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-1" />
            <span>Add My First Plant</span>
          </button>
        </div>
      ) : (
        <PlantList 
          plants={uiPlants} 
          onPlantClick={handlePlantClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}
      
      {/* Plant Details Modal */}
      {selectedPlant && (
        <PlantDetailsModal 
          plant={selectedPlant}
          sensorData={sensorData[selectedPlant.id] || []}
          onClose={handleCloseModal}
          onEdit={() => handleEditClick(selectedPlant)}
          onDelete={() => handleDeleteClick(selectedPlant)}
        />
      )}
      
      {/* Plant Form Modal */}
      {isFormOpen && (
        <AddPlantModal
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {/* Plant Edit Modal */}
      {isEditFormOpen && plantToEdit && (
        <EditPlantModal
          plant={plantToEdit}
          onClose={handleCloseEditForm}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        title="Delete Plant"
        message={`Are you sure you want to delete ${plantToDelete?.nickname}? This action cannot be undone.`}
        confirmLabel="Delete Plant"
        isOpen={isDeleteModalOpen}
        isLoading={isDeleting}
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Plants;