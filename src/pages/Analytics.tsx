import React, { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, BarChart3, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Bot, Sparkles, MoreVertical, Trash2, X, Leaf, MessageSquare, Droplets, AlertCircle, Send, Sun } from 'lucide-react';
import { useAIAnalytics } from '../contexts/AIAnalyticsContext';
import { usePlants } from '../contexts/PlantContext';
import { AIRecommendation, aiAnalytics } from '../api/ai';
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
  const { state, sendChatMessage, clearChatHistory } = useAIAnalytics();
  const { plants } = usePlants();
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearSuccess, setShowClearSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activePlant = activePlantId ? plants.find(p => p.id === activePlantId) : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showClearConfirm) {
          setShowClearConfirm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showClearConfirm, onClose]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isChatting) return;

    await sendChatMessage({
      message: message.trim(),
      plantId: activePlantId || undefined,
      context: activePlantId ? 'plant-specific' : 'general'
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    // Add a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    clearChatHistory();
    setShowClearConfirm(false);
    setShowMenu(false);
    setIsClearing(false);
    
    // Show success feedback
    setShowClearSuccess(true);
    setTimeout(() => setShowClearSuccess(false), 2000);
  };

  const openClearConfirm = () => {
    setShowClearConfirm(true);
    setShowMenu(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              TanaMind AI Assistant
              {state.isAvailable ? (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              ) : (
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              )}
            </h3>
            {activePlant && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Leaf size={12} className="text-green-500" />
                Chatting about {activePlant.nickname}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Clear Chat Button - More Visible */}
          {state.chatHistory.length > 0 && (
            <button
              onClick={openClearConfirm}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
              aria-label="Clear chat history"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          
          {/* Close Button - Red */}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* AI Status Warning */}
      {!state.isAvailable && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={16} className="text-orange-600" />
          <span className="text-sm text-orange-700">AI service is temporarily unavailable</span>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth"
      >
        {state.chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full text-center animate-fadeIn py-8">
            {showClearSuccess ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Chat Cleared!</h4>
                <p className="text-gray-600">Ready to start a fresh conversation</p>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4 group hover:scale-110 transition-transform cursor-pointer mx-auto">
                  <MessageSquare size={28} className="text-green-600 group-hover:rotate-12 transition-transform" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {activePlant ? `Let's talk about ${activePlant.nickname}` : 'Start a Conversation'}
                </h4>
                <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                  Ask me anything about plant care, watering schedules, or get personalized advice!
                </p>
                
                {/* Quick Prompts */}
                <div className="w-full max-w-sm space-y-2">
                  <p className="text-xs font-medium text-gray-500 mb-3">Quick questions:</p>
                  <button
                    onClick={() => setMessage(activePlant ? `How is ${activePlant.nickname} doing?` : "How do I care for my plants?")}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-green-100 rounded-lg text-sm text-gray-700 transition-all duration-200 group"
                  >
                    <Sparkles size={14} className="inline mr-2 text-yellow-500 group-hover:rotate-180 transition-transform" />
                    {activePlant ? `How is ${activePlant.nickname} doing?` : "How do I care for my plants?"}
                  </button>
                  <button
                    onClick={() => setMessage(activePlant ? `When should I water ${activePlant.nickname}?` : "What are signs of overwatering?")}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 rounded-lg text-sm text-gray-700 transition-all duration-200 group"
                  >
                    <Droplets size={14} className="inline mr-2 text-blue-500 group-hover:scale-125 transition-transform" />
                    {activePlant ? `When should I water ${activePlant.nickname}?` : "What are signs of overwatering?"}
                  </button>
                  <button
                    onClick={() => setMessage(activePlant ? `Any care tips for ${activePlant.nickname}?` : "How much light do plants need?")}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-yellow-50 hover:to-yellow-100 rounded-lg text-sm text-gray-700 transition-all duration-200 group"
                  >
                    <Sun size={14} className="inline mr-2 text-yellow-500 group-hover:animate-pulse" />
                    {activePlant ? `Any care tips for ${activePlant.nickname}?` : "How much light do plants need?"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {state.chatHistory.map((chat, index) => (
              <div
                key={chat.id}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
              >
                <div className={`flex max-w-[80%] ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                  {chat.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      chat.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{chat.content}</p>
                    <div className={`text-xs mt-1 ${chat.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {state.isChatting && (
              <div className="flex justify-start animate-slideIn">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={activePlant ? `Ask about ${activePlant.nickname}...` : "Type your message..."}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            disabled={state.isChatting || !state.isAvailable}
          />
          <button
            type="submit"
            disabled={!message.trim() || state.isChatting || !state.isAvailable}
            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
          >
            {state.isChatting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Clear Chat Confirmation Dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 rounded-2xl z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-slideIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear chat history?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">
                You're about to delete <span className="font-medium text-gray-900">{state.chatHistory.length} message{state.chatHistory.length !== 1 ? 's' : ''}</span> from this conversation.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                disabled={isClearing}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Clear chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Analytics: React.FC = () => {
  const { state, analyzeAllPlants, setActiveChatPlant, clearError, refreshAvailability } = useAIAnalytics();
  const { plants, plantsWithReadings } = usePlants();
  const [showChat, setShowChat] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

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

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#0B9444] rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#0B9444] rounded-full translate-x-24 translate-y-24"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon with animated pulse effect */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-br from-[#DFF3E2] to-[#E7F7EF] rounded-full flex items-center justify-center shadow-lg">
                  <Brain size={48} className="text-[#0B9444]" />
                </div>
                <div className="absolute inset-0 h-24 w-24 bg-[#0B9444] rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-3">AI Service Temporarily Offline</h2>
            <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
              Our team is currently working to restore the AI Analytics service. Please try again periodically.
            </p>
            <p className="text-sm text-gray-500 mb-8 max-w-xl mx-auto">
              In the meantime, you can still monitor your plants and access all other features. We apologize for any inconvenience.
            </p>
            
            {/* Retry button */}
            <button
              onClick={async () => {
                setIsRetrying(true);
                try {
                  await aiAnalytics.retryInitialization();
                  refreshAvailability();
                } finally {
                  setIsRetrying(false);
                }
              }}
              disabled={isRetrying}
              className="mb-8 px-6 py-3 bg-[#0B9444] hover:bg-[#056526] disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              {isRetrying ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Retry Connection
                </>
              )}
            </button>
            
            {/* Features preview */}
            <div className="text-left max-w-md mx-auto">
              <p className="text-xs text-gray-500 mb-3 text-center">When enabled, you'll get access to:</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-green-600" />
                  </div>
                  <span>Personalized plant health analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-green-600" />
                  </div>
                  <span>AI-powered care recommendations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={12} className="text-green-600" />
                  </div>
                  <span>Interactive chat assistant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#056526]">AI Analytics</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 hidden sm:block">Advanced plant analysis powered by artificial intelligence</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenChat()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="whitespace-nowrap">Chat</span>
          </button>
          <button
            onClick={handleRefreshAnalysis}
            disabled={state.isAnalyzing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={state.isAnalyzing ? 'animate-spin' : ''} />
            <span className="whitespace-nowrap">{state.isAnalyzing ? 'Analyzing' : 'Refresh'}</span>
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

    </div>

    {/* Chat Interface Modal - Outside main container for full screen coverage */}
    {showChat && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleCloseChat}
      >
        <div 
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ChatInterface
            activePlantId={state.activeChatPlant}
            onClose={handleCloseChat}
          />
        </div>
      </div>
    )}
    </>
  );
};

export default Analytics;