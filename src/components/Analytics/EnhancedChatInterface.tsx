import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  Leaf,
  RefreshCw,
  ArrowDown,
  Trash2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { useAIAnalytics } from '../../contexts/AIAnalyticsContext';
import { usePlants } from '../../contexts/PlantContext';

interface EnhancedChatInterfaceProps {
  activePlantId: number | null;
  onClose: () => void;
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
  isLatest?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLatest }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      style={{
        animation: isLatest ? 'slideIn 0.3s ease-out' : 'none'
      }}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
            <Bot size={16} className="text-white" />
          </div>
        )}
        
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  activePlantId, 
  onClose 
}) => {
  const { state, sendChatMessage, clearChatHistory } = useAIAnalytics();
  const { plants } = usePlants();
  const [message, setMessage] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activePlant = activePlantId ? plants.find(p => p.id === activePlantId) : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory]);

  // Handle scroll to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom && state.chatHistory.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [state.chatHistory.length]);

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

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || state.isChatting) return;

    const messageToSend = message.trim();
    setMessage('');
    
    await sendChatMessage({
      message: messageToSend,
      plantId: activePlantId || undefined,
      context: activePlantId ? 'plant-specific' : 'general'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
    setShowMenu(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickPrompts = activePlant 
    ? [
        `How is ${activePlant.nickname} doing?`,
        `When should I water ${activePlant.nickname}?`,
        `Any care tips for ${activePlant.nickname}?`
      ]
    : [
        "How do I care for my plants?",
        "What are signs of overwatering?",
        "How much light do plants need?"
      ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              TanaMind AI
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
          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Chat options"
            >
              <MoreVertical size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={handleClearChat}
                  disabled={state.chatHistory.length === 0}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Clear chat
                </button>
              </div>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={18} />
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

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {state.chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Start a Conversation
            </h4>
            <p className="text-gray-600 mb-6 max-w-sm">
              Ask me anything about plant care, watering schedules, or get personalized advice!
            </p>
            
            {/* Quick Prompts */}
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Try asking:</p>
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(prompt)}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  <Sparkles size={14} className="inline mr-2 text-yellow-500" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {state.chatHistory.map((chat, index) => (
              <MessageBubble 
                key={chat.id} 
                message={chat} 
                isLatest={index === state.chatHistory.length - 1}
              />
            ))}
            
            {/* Typing Indicator */}
            {state.isChatting && (
              <div className="flex justify-start mb-4">
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

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 w-10 h-10 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activePlant 
                  ? `Ask about ${activePlant.nickname}...` 
                  : "Type your message..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
              disabled={state.isChatting || !state.isAvailable}
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={!message.trim() || state.isChatting || !state.isAvailable}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed shadow-md"
          >
            {state.isChatting ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        
        {/* Input hints */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send</span>
          {message.length > 200 && (
            <span>{message.length}/500</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedChatInterface;