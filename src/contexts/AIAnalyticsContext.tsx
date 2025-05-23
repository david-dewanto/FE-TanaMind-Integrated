import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  AIRecommendation, 
  ChatMessage, 
  ChatRequest, 
  ChatResponse,
  aiAnalytics 
} from '../api/ai';
import { Plant, PlantWithLatestReadings } from '../api/plants';
import { useAuth } from './AuthContext';
import { 
  storeAIRecommendationsOffline, 
  getOfflineAIRecommendations,
  storeChatHistoryOffline,
  getOfflineChatHistory 
} from '../utils/offlineStorage';

interface AIAnalyticsState {
  recommendations: Record<number, AIRecommendation>;
  chatHistory: ChatMessage[];
  isAnalyzing: boolean;
  isChatting: boolean;
  isAvailable: boolean;
  error: string | null;
  lastAnalysisTime: string | null;
  activeChatPlant: number | null;
}

type AIAnalyticsAction =
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_CHATTING'; payload: boolean }
  | { type: 'SET_AVAILABLE'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RECOMMENDATION'; payload: { plantId: number; recommendation: AIRecommendation } }
  | { type: 'SET_RECOMMENDATIONS'; payload: AIRecommendation[] }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_HISTORY'; payload: ChatMessage[] }
  | { type: 'CLEAR_CHAT_HISTORY' }
  | { type: 'SET_ACTIVE_CHAT_PLANT'; payload: number | null }
  | { type: 'SET_LAST_ANALYSIS_TIME'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: AIAnalyticsState = {
  recommendations: {},
  chatHistory: [],
  isAnalyzing: false,
  isChatting: false,
  isAvailable: false,
  error: null,
  lastAnalysisTime: null,
  activeChatPlant: null,
};

function aiAnalyticsReducer(state: AIAnalyticsState, action: AIAnalyticsAction): AIAnalyticsState {
  switch (action.type) {
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload, error: action.payload ? null : state.error };
    case 'SET_CHATTING':
      return { ...state, isChatting: action.payload, error: action.payload ? null : state.error };
    case 'SET_AVAILABLE':
      return { ...state, isAvailable: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isAnalyzing: false, isChatting: false };
    case 'SET_RECOMMENDATION':
      return {
        ...state,
        recommendations: {
          ...state.recommendations,
          [action.payload.plantId]: action.payload.recommendation
        }
      };
    case 'SET_RECOMMENDATIONS':
      const recommendations = action.payload.reduce((acc, rec) => {
        acc[rec.plantId] = rec;
        return acc;
      }, {} as Record<number, AIRecommendation>);
      return { ...state, recommendations };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      };
    case 'SET_CHAT_HISTORY':
      return { ...state, chatHistory: action.payload };
    case 'CLEAR_CHAT_HISTORY':
      return { ...state, chatHistory: [] };
    case 'SET_ACTIVE_CHAT_PLANT':
      return { ...state, activeChatPlant: action.payload };
    case 'SET_LAST_ANALYSIS_TIME':
      return { ...state, lastAnalysisTime: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

interface AIAnalyticsContextType {
  state: AIAnalyticsState;
  analyzePlant: (plant: Plant, latestReadings?: PlantWithLatestReadings) => Promise<AIRecommendation | null>;
  analyzeAllPlants: (plants: Plant[]) => Promise<void>;
  sendChatMessage: (request: ChatRequest) => Promise<void>;
  setActiveChatPlant: (plantId: number | null) => void;
  clearChatHistory: () => void;
  getRecommendation: (plantId: number) => AIRecommendation | null;
  refreshAvailability: () => void;
  clearError: () => void;
}

const AIAnalyticsContext = createContext<AIAnalyticsContextType | undefined>(undefined);

export function AIAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(aiAnalyticsReducer, initialState);
  const { user } = useAuth();

  const refreshAvailability = useCallback(() => {
    const available = aiAnalytics.isAvailable();
    dispatch({ type: 'SET_AVAILABLE', payload: available });
  }, []);

  useEffect(() => {
    // Check initial availability
    refreshAvailability();
    
    // Set up a listener for when AI service initializes
    aiAnalytics.onInitialized(() => {
      refreshAvailability();
    });
    
    // Also wait for initialization promise
    aiAnalytics.waitForInitialization().then(() => {
      refreshAvailability();
    });
  }, [refreshAvailability]);

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET_STATE' });
    } else {
      // Load offline data when user logs in
      const offlineRecommendations = getOfflineAIRecommendations();
      const offlineChatHistory = getOfflineChatHistory();
      
      if (Object.keys(offlineRecommendations).length > 0) {
        const recommendations = Object.values(offlineRecommendations) as AIRecommendation[];
        dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      }
      
      if (offlineChatHistory.length > 0) {
        dispatch({ type: 'SET_CHAT_HISTORY', payload: offlineChatHistory });
      }
    }
  }, [user]);

  // Save to offline storage whenever recommendations change
  useEffect(() => {
    if (user && Object.keys(state.recommendations).length > 0) {
      storeAIRecommendationsOffline(state.recommendations);
    }
  }, [state.recommendations, user]);

  // Save to offline storage whenever chat history changes
  useEffect(() => {
    if (user && state.chatHistory.length > 0) {
      storeChatHistoryOffline(state.chatHistory);
    }
  }, [state.chatHistory, user]);

  const analyzePlant = useCallback(async (
    plant: Plant, 
    latestReadings?: PlantWithLatestReadings
  ): Promise<AIRecommendation | null> => {
    if (!state.isAvailable) {
      dispatch({ type: 'SET_ERROR', payload: 'AI service is not available' });
      return null;
    }

    dispatch({ type: 'SET_ANALYZING', payload: true });

    try {
      const recommendation = await aiAnalytics.analyzePlantHealth(plant, latestReadings);
      dispatch({ 
        type: 'SET_RECOMMENDATION', 
        payload: { plantId: plant.id, recommendation } 
      });
      dispatch({ type: 'SET_LAST_ANALYSIS_TIME', payload: new Date().toISOString() });
      return recommendation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze plant';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  }, [state.isAvailable]);

  const analyzeAllPlants = useCallback(async (plants: Plant[]): Promise<void> => {
    if (!state.isAvailable) {
      dispatch({ type: 'SET_ERROR', payload: 'AI service is not available' });
      return;
    }

    dispatch({ type: 'SET_ANALYZING', payload: true });

    try {
      const recommendations = await aiAnalytics.analyzeMultiplePlants(plants);
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      dispatch({ type: 'SET_LAST_ANALYSIS_TIME', payload: new Date().toISOString() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze plants';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  }, [state.isAvailable]);

  const sendChatMessage = useCallback(async (request: ChatRequest): Promise<void> => {
    if (!state.isAvailable) {
      dispatch({ type: 'SET_ERROR', payload: 'AI service is not available' });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: request.message,
      timestamp: new Date().toISOString(),
      plantContext: request.plantId ? {
        plantId: request.plantId,
        plantName: `Plant ${request.plantId}` // This could be enhanced with actual plant name
      } : undefined
    };

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_CHATTING', payload: true });

    try {
      const response = await aiAnalytics.chatWithAI(request);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        plantContext: userMessage.plantContext
      };

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: assistantMessage });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      const errorResponse: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        plantContext: userMessage.plantContext
      };

      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorResponse });
    } finally {
      dispatch({ type: 'SET_CHATTING', payload: false });
    }
  }, [state.isAvailable]);

  const setActiveChatPlant = useCallback((plantId: number | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT_PLANT', payload: plantId });
  }, []);

  const clearChatHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT_HISTORY' });
  }, []);

  const getRecommendation = useCallback((plantId: number): AIRecommendation | null => {
    return state.recommendations[plantId] || null;
  }, [state.recommendations]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: AIAnalyticsContextType = {
    state,
    analyzePlant,
    analyzeAllPlants,
    sendChatMessage,
    setActiveChatPlant,
    clearChatHistory,
    getRecommendation,
    refreshAvailability,
    clearError,
  };

  return (
    <AIAnalyticsContext.Provider value={value}>
      {children}
    </AIAnalyticsContext.Provider>
  );
}

export function useAIAnalytics(): AIAnalyticsContextType {
  const context = useContext(AIAnalyticsContext);
  if (context === undefined) {
    throw new Error('useAIAnalytics must be used within an AIAnalyticsProvider');
  }
  return context;
}

export default AIAnalyticsContext;