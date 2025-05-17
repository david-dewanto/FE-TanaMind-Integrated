import React, { createContext, useContext, useState, ReactNode } from 'react';
import { logs } from '../api';
import { SensorLog, SensorLogRequest, LogSummary } from '../api/logs';

interface SensorContextType {
  isLoading: boolean;
  error: string | null;
  fetchPlantLogs: (plantId: number, limit?: number, from?: string, to?: string) => Promise<SensorLog[]>;
  fetchPlantLogsSummary: (plantId: number) => Promise<LogSummary>;
  createSensorLog: (logData: SensorLogRequest) => Promise<SensorLog>;
  clearError: () => void;
}

// Create the sensor context with default values
const SensorContext = createContext<SensorContextType>({
  isLoading: false,
  error: null,
  fetchPlantLogs: async () => [],
  fetchPlantLogsSummary: async () => ({} as LogSummary),
  createSensorLog: async () => ({} as SensorLog),
  clearError: () => {},
});

// Custom hook to use the sensor context
export const useSensors = () => useContext(SensorContext);

interface SensorProviderProps {
  children: ReactNode;
}

export const SensorProvider: React.FC<SensorProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Clear any error message
  const clearError = () => setError(null);

  // Function to fetch logs for a specific plant
  const fetchPlantLogs = async (
    plantId: number,
    limit?: number,
    from?: string,
    to?: string
  ): Promise<SensorLog[]> => {
    try {
      setIsLoading(true);
      clearError();
      const plantLogs = await logs.getPlantLogs(plantId, limit, from, to);
      return plantLogs;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch logs for plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch logs summary for a specific plant
  const fetchPlantLogsSummary = async (
    plantId: number
  ): Promise<LogSummary> => {
    try {
      setIsLoading(true);
      clearError();
      const summary = await logs.getPlantLogsSummary(plantId);
      return summary;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to fetch logs summary for plant with ID ${plantId}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a new sensor log
  const createSensorLog = async (logData: SensorLogRequest): Promise<SensorLog> => {
    try {
      setIsLoading(true);
      clearError();
      const newLog = await logs.createSensorLog(logData);
      return newLog;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create sensor log');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // The context value
  const value = {
    isLoading,
    error,
    fetchPlantLogs,
    fetchPlantLogsSummary,
    createSensorLog,
    clearError,
  };

  return <SensorContext.Provider value={value}>{children}</SensorContext.Provider>;
};