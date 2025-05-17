import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { plants } from '../api';
import { Plant, PlantWithLatestReadings, PlantRequest, WaterPlantRequest } from '../api/plants';
import { getCurrentDateUTC7, calculateNextWateringDateUTC7 } from '../utils/dateUtils';

interface PlantContextType {
  plants: Plant[];
  plantsWithReadings: PlantWithLatestReadings[];
  isLoading: boolean;
  error: string | null;
  fetchPlants: () => Promise<void>;
  fetchPlantsWithReadings: () => Promise<void>;
  fetchPlant: (plantId: number) => Promise<Plant>;
  fetchPlantWithReadings: (plantId: number) => Promise<PlantWithLatestReadings>;
  createPlant: (plantData: PlantRequest) => Promise<Plant>;
  updatePlant: (plantId: number, plantData: Partial<PlantRequest>) => Promise<Plant>;
  deletePlant: (plantId: number) => Promise<{message: string}>;
  waterPlant: (plantId: number, waterAmount?: number) => Promise<Plant>;
  clearError: () => void;
}

// Create the plant context with default values
const PlantContext = createContext<PlantContextType>({
  plants: [],
  plantsWithReadings: [],
  isLoading: false,
  error: null,
  fetchPlants: async () => {},
  fetchPlantsWithReadings: async () => {},
  fetchPlant: async () => ({} as Plant),
  fetchPlantWithReadings: async () => ({} as PlantWithLatestReadings),
  createPlant: async () => ({} as Plant),
  updatePlant: async () => ({} as Plant),
  deletePlant: async () => ({ message: '' }),
  waterPlant: async () => ({} as Plant),
  clearError: () => {},
});

// Custom hook to use the plant context
export const usePlants = () => useContext(PlantContext);

interface PlantProviderProps {
  children: ReactNode;
}

export const PlantProvider: React.FC<PlantProviderProps> = ({ children }) => {
  const [plantList, setPlantList] = useState<Plant[]>([]);
  const [plantsWithReadingsList, setPlantsWithReadingsList] = useState<PlantWithLatestReadings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear any error message
  const clearError = () => setError(null);

  // Function to fetch all plants
  const fetchPlants = async () => {
    try {
      // Only set loading state if it's not already loading
      if (!isLoading) {
        setIsLoading(true);
      }
      clearError();
      const fetchedPlants = await plants.getPlants();
      setPlantList(fetchedPlants);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch plants');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch plants with readings
  const fetchPlantsWithReadings = async () => {
    try {
      // Only set loading state if it's not already loading
      if (!isLoading) {
        setIsLoading(true);
      }
      clearError();
      const fetchedPlants = await plants.getPlantsWithLatestReadings();
      setPlantsWithReadingsList(fetchedPlants);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch plants with readings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch a specific plant
  const fetchPlant = async (plantId: number): Promise<Plant> => {
    try {
      setIsLoading(true);
      clearError();
      const plant = await plants.getPlant(plantId);
      return plant;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch a specific plant with readings
  const fetchPlantWithReadings = async (plantId: number): Promise<PlantWithLatestReadings> => {
    try {
      setIsLoading(true);
      clearError();
      const plant = await plants.getPlantWithLatestReadings(plantId);
      return plant;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch plant with readings for ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new plant
  const createPlant = async (plantData: PlantRequest): Promise<Plant> => {
    try {
      setIsLoading(true);
      clearError();
      const newPlant = await plants.createPlant(plantData);
      setPlantList(prevPlants => [...prevPlants, newPlant]);
      return newPlant;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create plant');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update a plant
  const updatePlant = async (plantId: number, plantData: Partial<PlantRequest>): Promise<Plant> => {
    try {
      setIsLoading(true);
      clearError();
      const updatedPlant = await plants.updatePlant(plantId, plantData);
      
      // Update both plant lists
      setPlantList(prevPlants => 
        prevPlants.map(plant => 
          plant.id === plantId ? updatedPlant : plant
        )
      );
      
      // If we also have plants with readings, update that list too
      setPlantsWithReadingsList(prevPlants => {
        // Ensure prevPlants is an array before using findIndex
        if (!Array.isArray(prevPlants)) {
          console.warn('prevPlants is not an array:', prevPlants);
          return []; // Return empty array if prevPlants is not an array
        }
        
        const plantIndex = prevPlants.findIndex(p => p.id === plantId);
        if (plantIndex === -1) return prevPlants; // Plant not in this list
        
        // Preserve any reading data that was in the plant
        const oldPlant = prevPlants[plantIndex];
        const updatedPlantWithReadings: PlantWithLatestReadings = {
          ...updatedPlant,
          latest_soil_humidity: oldPlant.latest_soil_humidity,
          latest_air_humidity: oldPlant.latest_air_humidity,
          latest_temperature: oldPlant.latest_temperature,
          latest_luminance: oldPlant.latest_luminance,
          last_reading_time: oldPlant.last_reading_time
        };
        
        return [
          ...prevPlants.slice(0, plantIndex),
          updatedPlantWithReadings,
          ...prevPlants.slice(plantIndex + 1)
        ];
      });
      
      return updatedPlant;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to update plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a plant
  const deletePlant = async (plantId: number): Promise<{message: string}> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await plants.deletePlant(plantId);
      
      // Update both plant lists
      setPlantList(prevPlants => {
        if (!Array.isArray(prevPlants)) {
          console.warn('prevPlants is not an array in deletePlant (plantList):', prevPlants);
          return [];
        }
        return prevPlants.filter(plant => plant.id !== plantId);
      });
      
      setPlantsWithReadingsList(prevPlants => {
        if (!Array.isArray(prevPlants)) {
          console.warn('prevPlants is not an array in deletePlant (plantsWithReadingsList):', prevPlants);
          return [];
        }
        return prevPlants.filter(plant => plant.id !== plantId);
      });
      
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to delete plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to water a plant
  const waterPlant = async (plantId: number, waterAmount?: number): Promise<Plant> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Call the water plant endpoint
      const waterRequest: WaterPlantRequest = waterAmount ? { amount: waterAmount } : {};
      const updatedPlant = await plants.waterPlant(plantId, waterRequest);
      
      // Update both plant lists
      setPlantList(prevPlants => 
        prevPlants.map(plant => 
          plant.id === plantId ? updatedPlant : plant
        )
      );
      
      // If we also have plants with readings, update that list too
      setPlantsWithReadingsList(prevPlants => {
        // Ensure prevPlants is an array before using findIndex
        if (!Array.isArray(prevPlants)) {
          console.warn('prevPlants is not an array in waterPlant:', prevPlants);
          return []; // Return empty array if prevPlants is not an array
        }
        
        const plantIndex = prevPlants.findIndex(p => p.id === plantId);
        if (plantIndex === -1) return prevPlants; // Plant not in this list
        
        // Get fresh readings data for this plant
        return fetchPlantWithReadings(plantId)
          .then(updatedPlantWithReadings => {
            return [
              ...prevPlants.slice(0, plantIndex),
              updatedPlantWithReadings,
              ...prevPlants.slice(plantIndex + 1)
            ];
          })
          .catch(() => {
            // If fetch with readings fails, just update basic plant info
            const oldPlant = prevPlants[plantIndex];
            const updatedPlantWithReadings: PlantWithLatestReadings = {
              ...updatedPlant,
              latest_soil_humidity: oldPlant.latest_soil_humidity,
              latest_air_humidity: oldPlant.latest_air_humidity,
              latest_temperature: oldPlant.latest_temperature,
              latest_luminance: oldPlant.latest_luminance,
              last_reading_time: oldPlant.last_reading_time
            };
            
            return [
              ...prevPlants.slice(0, plantIndex),
              updatedPlantWithReadings,
              ...prevPlants.slice(plantIndex + 1)
            ];
          });
      });
      
      return updatedPlant;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to water plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch plants when the component mounts - only once
  useEffect(() => {
    // Flag to prevent state updates after component unmount
    let isMounted = true;
    
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch plants and plants with readings in parallel to improve performance
        const [fetchedPlants, fetchedPlantsWithReadings] = await Promise.all([
          plants.getPlants(),
          plants.getPlantsWithLatestReadings()
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setPlantList(fetchedPlants);
          setPlantsWithReadingsList(fetchedPlantsWithReadings);
        }
      } catch (err) {
        console.error("Failed to load initial plant data:", err);
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Failed to load plant data');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // The context value
  const value = {
    plants: plantList,
    plantsWithReadings: plantsWithReadingsList,
    isLoading,
    error,
    fetchPlants,
    fetchPlantsWithReadings,
    fetchPlant,
    fetchPlantWithReadings,
    createPlant,
    updatePlant,
    deletePlant,
    waterPlant,
    clearError,
  };

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
};