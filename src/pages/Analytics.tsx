import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, BarChart3, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Bot, Sparkles } from 'lucide-react';
import { useAIAnalytics } from '../contexts/AIAnalyticsContext';
import { usePlants } from '../contexts/PlantContext';
import { AIRecommendation } from '../api/ai';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

interface PlantAnalysisCardProps {
  recommendation: AIRecommendation;
  onChat: (plantId: number) => void;
}

const PlantAnalysisCard: React.FC<PlantAnalysisCardProps> = ({ recommendation, onChat }) => {
  const getHealthColor = (health: AIRecommendation['overallHealth']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'concerning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (health: AIRecommendation['overallHealth']) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return <CheckCircle size={16} />;
      case 'concerning':
      case 'critical':
        return <AlertTriangle size={16} />;
      default:
        return <BarChart3 size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{recommendation.plantName}</h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(recommendation.overallHealth)}`}>
          {getHealthIcon(recommendation.overallHealth)}
          {recommendation.overallHealth}
        </div>
      </div>

      <div className="space-y-4">
        {recommendation.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">🌱 Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recommendation.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Insights</h4>
            <p className="text-sm text-gray-600">
              {recommendation.insights[0]}
            </p>
          </div>
        )}

        {recommendation.nextActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">⚡ Next Actions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recommendation.nextActions.slice(0, 2).map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Confidence: {recommendation.confidenceScore}%
          </div>
          <button
            onClick={() => onChat(recommendation.plantId)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <MessageCircle size={14} />
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatInterfaceProps {
  activePlantId: number | null;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activePlantId, onClose }) => {
  const { state, sendChatMessage } = useAIAnalytics();
  const { plants } = usePlants();
  const [message, setMessage] = useState('');

  const activePlant = activePlantId ? plants.find(p => p.id === activePlantId) : null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendChatMessage({
      message: message.trim(),
      plantId: activePlantId || undefined,
      context: activePlantId ? 'plant-specific' : 'general'
    });

    setMessage('');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-96 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            TanaMind AI Assistant
          </h3>
          {activePlant && (
            <span className="text-sm text-gray-600">
              - {activePlant.nickname}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Ask me anything about your plants!</p>
            <p className="text-sm mt-2">I can help with care tips, troubleshooting, and analysis.</p>
          </div>
        ) : (
          state.chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  chat.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{chat.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(chat.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {state.isChatting && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={activePlant ? `Ask about ${activePlant.nickname}...` : "Ask about your plants..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={state.isChatting}
          />
          <button
            type="submit"
            disabled={!message.trim() || state.isChatting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

const Analytics: React.FC = () => {
  const { state, analyzeAllPlants, setActiveChatPlant, clearError } = useAIAnalytics();
  const { plants, plantsWithReadings } = usePlants();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (plants.length > 0 && state.isAvailable && Object.keys(state.recommendations).length === 0) {
      analyzeAllPlants(plants);
    }
  }, [plants, state.isAvailable, analyzeAllPlants, state.recommendations]);

  const handleRefreshAnalysis = () => {
    if (plants.length > 0) {
      analyzeAllPlants(plants);
    }
  };

  const handleOpenChat = (plantId?: number) => {
    setActiveChatPlant(plantId || null);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveChatPlant(null);
  };

  const recommendations = Object.values(state.recommendations);
  const healthCounts = recommendations.reduce((acc, rec) => {
    acc[rec.overallHealth] = (acc[rec.overallHealth] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!state.isAvailable) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#056526]">AI Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced plant analysis powered by artificial intelligence</p>
        </div>

        <div className="bg-gradient-to-b from-white to-[#F3FFF6] rounded-xl shadow-lg border border-[#DFF3E2] p-8 text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-[#DFF3E2] rounded-full flex items-center justify-center">
              <Brain size={40} className="text-[#0B9444]" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-[#056526] mb-4">AI Not Available</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            AI Analytics requires a valid Gemini API key. Please configure your API key in environment variables.
          </p>
          
          <div className="bg-[#056526]/5 p-4 rounded-lg inline-block">
            <p className="text-sm text-[#056526]">
              Add VITE_GEMINI_API_KEY to your environment variables to enable AI features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#056526]">AI Analytics</h1>
          <p className="text-gray-600 mt-1">Advanced plant analysis powered by artificial intelligence</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenChat()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={16} />
            Chat with AI
          </button>
          <button
            onClick={handleRefreshAnalysis}
            disabled={state.isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={state.isAnalyzing ? 'animate-spin' : ''} />
            {state.isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>

      {state.error && (
        <ErrorMessage 
          message={state.error} 
          onDismiss={clearError}
        />
      )}

      {plants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Plants to Analyze</h2>
          <p className="text-gray-600">Add some plants to start getting AI-powered insights and recommendations.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Plants</p>
                  <p className="text-2xl font-bold text-gray-800">{plants.length}</p>
                </div>
                <BarChart3 size={32} className="text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Excellent Health</p>
                  <p className="text-2xl font-bold text-green-600">{healthCounts.excellent || 0}</p>
                </div>
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Need Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(healthCounts.concerning || 0) + (healthCounts.critical || 0)}
                  </p>
                </div>
                <AlertTriangle size={32} className="text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Insights</p>
                  <p className="text-2xl font-bold text-purple-600">{recommendations.length}</p>
                </div>
                <Brain size={32} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Plant Analysis Cards */}
          {state.isAnalyzing && recommendations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">AI is analyzing your plants...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          ) : recommendations.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Plant Analysis</h2>
                {state.lastAnalysisTime && (
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(state.lastAnalysisTime).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((recommendation) => (
                  <PlantAnalysisCard
                    key={recommendation.plantId}
                    recommendation={recommendation}
                    onChat={handleOpenChat}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready for Analysis</h2>
              <p className="text-gray-600 mb-4">Click "Refresh Analysis" to get AI-powered insights about your plants.</p>
              <button
                onClick={handleRefreshAnalysis}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Analysis
              </button>
            </div>
          )}
        </>
      )}

      {/* Chat Interface Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <ChatInterface
              activePlantId={state.activeChatPlant}
              onClose={handleCloseChat}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;