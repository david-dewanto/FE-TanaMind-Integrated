import { get, post } from './client';
import { Plant, PlantWithLatestReadings } from './plants';

export interface SensorLog {
  id: number;
  plant_id: number;
  soil_humidity?: number;
  air_humidity?: number;
  temperature?: number;
  luminance?: number;
  timestamp: string;
  watering_done: boolean;
  event_type: 'sensor_reading' | 'manual' | 'auto' | 'scheduled';
}

export interface PlantSummary {
  plant_id: number;
  average_soil_humidity: number;
  average_air_humidity: number;
  average_temperature: number;
  average_luminance: number;
  logs_count: number;
  watering_count: number;
  first_log_date: string;
  last_log_date: string;
}

export interface AIRecommendation {
  plantId: number;
  plantName: string;
  overallHealth: 'excellent' | 'good' | 'concerning' | 'critical';
  recommendations: string[];
  insights: string[];
  nextActions: string[];
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  plantContext?: {
    plantId: number;
    plantName: string;
    currentReadings?: Partial<PlantWithLatestReadings>;
  };
}

export interface ChatRequest {
  message: string;
  plantId?: number;
  context?: 'general' | 'plant-specific' | 'troubleshooting';
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  relatedActions?: string[];
}

class AIAnalyticsService {
  private isInitialized = false;
  private baseUrl: string;
  private initializationPromise: Promise<void> | null = null;
  private initializationCallbacks: Array<() => void> = [];

  constructor() {
    // Check for AI proxy URL environment variable first
    const aiProxyUrl = import.meta.env.VITE_AI_PROXY_URL;
    
    if (aiProxyUrl) {
      // Use dedicated AI proxy URL (for development)
      this.baseUrl = aiProxyUrl;
    } else {
      // Use main API base URL or current origin
      this.baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    }
    
    this.initializationPromise = this.initializeAI();
  }

  private async initializeAI(): Promise<void> {
    // Test if the AI proxy endpoint is available with retries
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Testing AI proxy at: ${this.baseUrl}/api/test (attempt ${attempt}/${maxRetries})`);
        
        const response = await fetch(`${this.baseUrl}/api/test`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Test endpoint response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Test endpoint response:', data);
          this.isInitialized = true;
          console.log('AI service initialized successfully');
          
          // Notify all waiting callbacks
          this.initializationCallbacks.forEach(callback => callback());
          this.initializationCallbacks = [];
          return; // Success, exit the retry loop
        } else {
          console.warn(`Test endpoint failed with status: ${response.status}`);
          if (attempt < maxRetries) {
            console.log(`Retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } catch (error) {
        console.error(`AI proxy endpoint test failed (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.warn('AI features will be disabled after all retry attempts failed.');
        }
      }
    }
  }

  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  onInitialized(callback: () => void): void {
    if (this.isInitialized) {
      callback();
    } else {
      this.initializationCallbacks.push(callback);
    }
  }

  async retryInitialization(): Promise<void> {
    if (!this.isInitialized) {
      console.log('Retrying AI service initialization...');
      this.initializationPromise = this.initializeAI();
      await this.initializationPromise;
    }
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('AI service not available. Please ensure the proxy server is configured.');
    }

    try {
      console.log(`Making AI request to: ${this.baseUrl}/api/ai-chat`);
      
      const response = await fetch(`${this.baseUrl}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      console.log(`AI response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error response:', errorText);
        throw new Error(`AI API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('AI response received successfully');
      return data.response;
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  async getPlantLogs(plantId: number): Promise<SensorLog[]> {
    try {
      return await get<SensorLog[]>(`/api/logs/plant/${plantId}`);
    } catch (error) {
      console.error(`Failed to get logs for plant ${plantId}:`, error);
      throw error;
    }
  }

  async getPlantSummary(plantId: number): Promise<PlantSummary> {
    try {
      return await get<PlantSummary>(`/api/logs/plant/${plantId}/summary`);
    } catch (error) {
      console.error(`Failed to get summary for plant ${plantId}:`, error);
      throw error;
    }
  }

  private createPlantAnalysisPrompt(
    plant: Plant,
    summary: PlantSummary,
    recentLogs: SensorLog[],
    latestReadings?: PlantWithLatestReadings
  ): string {
    const currentConditions = latestReadings ? `
Current Sensor Readings:
- Soil Humidity: ${latestReadings.latest_soil_humidity}% (Target: ${plant.soil_humidity_threshold_min}-${plant.soil_humidity_threshold_max}%)
- Air Humidity: ${latestReadings.latest_air_humidity}% (Target: ${plant.air_humidity_threshold_min}-${plant.air_humidity_threshold_max}%)
- Temperature: ${latestReadings.latest_temperature}°C (Target: ${plant.temperature_threshold_min}-${plant.temperature_threshold_max}°C)
- Luminance: ${latestReadings.latest_luminance} lux (Target: ${plant.luminance_threshold_min}-${plant.luminance_threshold_max} lux)
- Last Reading: ${latestReadings.last_reading_time}
` : '';

    return `As an expert plant care AI assistant, analyze the following plant data and provide comprehensive care recommendations:

Plant Information:
- Name: ${plant.plant_name} (${plant.nickname})
- Species: ${plant.species}
- Category: ${plant.category}
- Location: ${plant.location}
- Age: ${plant.age || 'Not specified'} days since added
- Date Added: ${plant.date_added}
- Last Watered: ${plant.last_watered}
- Health Status: ${plant.health_status}

Plant Care Settings:
- Watering Frequency: Every ${plant.watering_frequency} days
- Sunlight Requirements: ${plant.sunlight_requirements}
- Fertilizer Schedule: ${plant.fertilizer_schedule}
- Auto Watering: ${plant.auto_watering_enabled ? 'Enabled' : 'Disabled'}

Historical Data Summary (${summary.logs_count} readings from ${summary.first_log_date} to ${summary.last_log_date}):
- Average Soil Humidity: ${summary.average_soil_humidity}%
- Average Air Humidity: ${summary.average_air_humidity}%
- Average Temperature: ${summary.average_temperature}°C
- Average Luminance: ${summary.average_luminance} lux
- Total Watering Events: ${summary.watering_count}

${currentConditions}

Recent Trends (Last 10 readings):
${recentLogs.slice(0, 10).map((log, index) => 
  `${index + 1}. ${log.timestamp}: Soil ${log.soil_humidity}%, Air ${log.air_humidity}%, Temp ${log.temperature}°C, Light ${log.luminance} lux${log.watering_done ? ' [Watered]' : ''}`
).join('\n')}

Please provide:
1. Overall health assessment (excellent/good/concerning/critical)
2. Specific recommendations for improvement
3. Key insights about plant behavior and trends
4. Next immediate actions needed
5. Confidence score (0-100) for your assessment

Format as JSON:
{
  "overallHealth": "excellent|good|concerning|critical",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "insights": ["insight1", "insight2", ...],
  "nextActions": ["action1", "action2", ...],
  "confidenceScore": 85
}`;
  }

  async analyzePlantHealth(plant: Plant, latestReadings?: PlantWithLatestReadings): Promise<AIRecommendation> {
    try {
      const [summary, recentLogs] = await Promise.all([
        this.getPlantSummary(plant.id),
        this.getPlantLogs(plant.id)
      ]);

      const prompt = this.createPlantAnalysisPrompt(plant, summary, recentLogs, latestReadings);
      const responseText = await this.callAI(prompt);
      
      try {
        const analysisData = JSON.parse(responseText.replace(/```json\s*|\s*```/g, ''));
        
        return {
          plantId: plant.id,
          plantName: plant.nickname,
          overallHealth: analysisData.overallHealth,
          recommendations: analysisData.recommendations,
          insights: analysisData.insights,
          nextActions: analysisData.nextActions,
          confidenceScore: analysisData.confidenceScore
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Failed to analyze plant health:', error);
      throw error;
    }
  }

  private createChatPrompt(
    message: string,
    plant?: Plant,
    latestReadings?: PlantWithLatestReadings,
    context?: string
  ): string {
    const plantContext = plant ? `
You are helping with plant: ${plant.plant_name} (${plant.nickname})
- Species: ${plant.species}
- Category: ${plant.category}
- Location: ${plant.location}
- Health Status: ${plant.health_status}
- Last Watered: ${plant.last_watered}
- Watering Frequency: Every ${plant.watering_frequency} days
- Sunlight Requirements: ${plant.sunlight_requirements}

Current Sensor Readings:
- Soil Humidity: ${latestReadings?.latest_soil_humidity}% (Target: ${plant.soil_humidity_threshold_min}-${plant.soil_humidity_threshold_max}%)
- Air Humidity: ${latestReadings?.latest_air_humidity}% (Target: ${plant.air_humidity_threshold_min}-${plant.air_humidity_threshold_max}%)
- Temperature: ${latestReadings?.latest_temperature}°C (Target: ${plant.temperature_threshold_min}-${plant.temperature_threshold_max}°C)
- Luminance: ${latestReadings?.latest_luminance} lux (Target: ${plant.luminance_threshold_min}-${plant.luminance_threshold_max} lux)
` : '';

    return `You are TanaMind AI, an expert plant care assistant. You help users understand their plants' needs and provide actionable advice based on sensor data.

${plantContext}

User Question: ${message}

Context: ${context || 'general'}

Please provide a helpful, concise response. Include specific actionable advice when possible. If suggesting actions, be specific about timing and methods.

Format as JSON:
{
  "message": "Your detailed response here",
  "suggestions": ["suggestion1", "suggestion2"],
  "relatedActions": ["action1", "action2"]
}`;
  }

  async chatWithAI(request: ChatRequest): Promise<ChatResponse> {
    try {
      let plant: Plant | undefined;
      let latestReadings: PlantWithLatestReadings | undefined;

      if (request.plantId) {
        try {
          plant = await get<Plant>(`/api/plants/${request.plantId}`);
          latestReadings = await get<PlantWithLatestReadings>(`/api/plants/${request.plantId}/latest-readings`);
        } catch (error) {
          console.warn(`Failed to get plant data for chat context:`, error);
        }
      }

      const prompt = this.createChatPrompt(request.message, plant, latestReadings, request.context);
      const responseText = await this.callAI(prompt);

      try {
        const chatData = JSON.parse(responseText.replace(/```json\s*|\s*```/g, ''));
        
        return {
          message: chatData.message,
          suggestions: chatData.suggestions || [],
          relatedActions: chatData.relatedActions || []
        };
      } catch (parseError) {
        console.error('Failed to parse chat response:', parseError);
        return {
          message: responseText,
          suggestions: [],
          relatedActions: []
        };
      }
    } catch (error) {
      console.error('Failed to chat with AI:', error);
      throw error;
    }
  }

  async analyzeMultiplePlants(plants: Plant[]): Promise<AIRecommendation[]> {
    const analyses = await Promise.allSettled(
      plants.map(plant => this.analyzePlantHealth(plant))
    );

    return analyses
      .filter((result): result is PromiseFulfilledResult<AIRecommendation> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  async getPlantCareSuggestions(plantName: string, species?: string, category?: string): Promise<PlantCareSuggestions> {
    if (!this.isInitialized) {
      throw new Error('AI service not available. Please ensure the proxy server is configured.');
    }

    const prompt = `You are an expert botanist and plant care specialist. Analyze the following plant and provide comprehensive care recommendations:

Plant Name: ${plantName}
${species ? `Species: ${species}` : ''}
${category ? `Category: ${category}` : ''}

Please provide detailed care suggestions. If the plant name is unclear, misspelled, or ambiguous, make your best educated guess based on common houseplants and gardening plants. If you cannot identify the plant at all, provide general plant care recommendations suitable for most common houseplants.

Format your response as JSON with the following structure:
{
  "plantIdentification": {
    "commonName": "The most likely common name of the plant",
    "scientificName": "Scientific/botanical name if identifiable",
    "family": "Plant family if known",
    "confidence": "high|medium|low",
    "isValid": true/false,
    "alternativeNames": ["other possible names"],
    "notes": "Any clarification about the identification"
  },
  "careRequirements": {
    "wateringFrequency": number (days between watering),
    "wateringNotes": "Specific watering instructions",
    "sunlightRequirements": "Low|Medium|High|Full Sun",
    "sunlightNotes": "Detailed light requirements",
    "idealTemperatureMin": number (Celsius),
    "idealTemperatureMax": number (Celsius),
    "temperatureNotes": "Temperature preferences",
    "soilHumidityMin": number (percentage),
    "soilHumidityMax": number (percentage),
    "airHumidityMin": number (percentage),
    "airHumidityMax": number (percentage),
    "humidityNotes": "Humidity preferences",
    "fertilizerSchedule": "Never|Monthly|Bimonthly|Quarterly|Biannually",
    "fertilizerNotes": "Fertilizer recommendations",
    "soilType": "Well-draining|Moisture-retentive|Sandy|Clay|Loamy",
    "soilNotes": "Soil preferences"
  },
  "environmentalThresholds": {
    "temperatureMin": number (critical minimum in Celsius),
    "temperatureMax": number (critical maximum in Celsius),
    "luminanceMin": number (minimum lux),
    "luminanceMax": number (maximum lux),
    "notes": "Critical thresholds to avoid plant stress"
  },
  "generalTips": [
    "tip1",
    "tip2",
    "tip3"
  ],
  "commonIssues": [
    "issue1",
    "issue2"
  ],
  "defaultFallback": true/false (true if using generic defaults due to unclear plant name)
}`;

    try {
      const responseText = await this.callAI(prompt);
      
      try {
        const suggestions = JSON.parse(responseText.replace(/```json\s*|\s*```/g, ''));
        return suggestions as PlantCareSuggestions;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return default suggestions if parsing fails
        return this.getDefaultPlantCareSuggestions(plantName);
      }
    } catch (error) {
      console.error('Failed to get plant care suggestions:', error);
      // Return default suggestions on error
      return this.getDefaultPlantCareSuggestions(plantName);
    }
  }

  private getDefaultPlantCareSuggestions(plantName: string): PlantCareSuggestions {
    return {
      plantIdentification: {
        commonName: plantName || 'Unknown Plant',
        scientificName: 'Unknown',
        family: 'Unknown',
        confidence: 'low',
        isValid: false,
        alternativeNames: [],
        notes: 'Could not identify specific plant. Using general houseplant care guidelines.'
      },
      careRequirements: {
        wateringFrequency: 7,
        wateringNotes: 'Water when top inch of soil is dry. Adjust based on your plant\'s response.',
        sunlightRequirements: 'Medium',
        sunlightNotes: 'Most houseplants prefer bright, indirect light. Observe your plant for signs of too much or too little light.',
        idealTemperatureMin: 18,
        idealTemperatureMax: 24,
        temperatureNotes: 'Average room temperature is suitable for most houseplants.',
        soilHumidityMin: 40,
        soilHumidityMax: 60,
        airHumidityMin: 40,
        airHumidityMax: 60,
        humidityNotes: 'Most plants prefer moderate humidity. Mist occasionally if air is dry.',
        fertilizerSchedule: 'Monthly',
        fertilizerNotes: 'Feed during growing season (spring/summer) with diluted balanced fertilizer.',
        soilType: 'Well-draining',
        soilNotes: 'Use a general potting mix with good drainage.'
      },
      environmentalThresholds: {
        temperatureMin: 10,
        temperatureMax: 35,
        luminanceMin: 1000,
        luminanceMax: 10000,
        notes: 'These are general safe ranges for most houseplants.'
      },
      generalTips: [
        'Start with less water and increase gradually as you learn your plant\'s needs',
        'Rotate the plant occasionally for even growth',
        'Check for pests regularly and clean leaves to prevent dust buildup'
      ],
      commonIssues: [
        'Yellow leaves often indicate overwatering or poor drainage',
        'Brown leaf tips can mean low humidity or fluoride in tap water'
      ],
      defaultFallback: true
    };
  }
}

export interface PlantCareSuggestions {
  plantIdentification: {
    commonName: string;
    scientificName: string;
    family: string;
    confidence: 'high' | 'medium' | 'low';
    isValid: boolean;
    alternativeNames: string[];
    notes: string;
  };
  careRequirements: {
    wateringFrequency: number;
    wateringNotes: string;
    sunlightRequirements: string;
    sunlightNotes: string;
    idealTemperatureMin: number;
    idealTemperatureMax: number;
    temperatureNotes: string;
    soilHumidityMin: number;
    soilHumidityMax: number;
    airHumidityMin: number;
    airHumidityMax: number;
    humidityNotes: string;
    fertilizerSchedule: string;
    fertilizerNotes: string;
    soilType: string;
    soilNotes: string;
  };
  environmentalThresholds: {
    temperatureMin: number;
    temperatureMax: number;
    luminanceMin: number;
    luminanceMax: number;
    notes: string;
  };
  generalTips: string[];
  commonIssues: string[];
  defaultFallback: boolean;
}

export const aiAnalytics = new AIAnalyticsService();
export default aiAnalytics;