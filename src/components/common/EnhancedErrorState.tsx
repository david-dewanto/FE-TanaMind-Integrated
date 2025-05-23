import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Brain, MessageCircle } from 'lucide-react';

interface EnhancedErrorStateProps {
  title?: string;
  message?: string;
  variant?: 'network' | 'ai' | 'general' | 'chat';
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
  showIcon?: boolean;
}

const EnhancedErrorState: React.FC<EnhancedErrorStateProps> = ({
  title,
  message,
  variant = 'general',
  onRetry,
  isRetrying = false,
  className = '',
  showIcon = true
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'network':
        return {
          icon: <WifiOff size={48} className="text-red-500" />,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'ai':
        return {
          icon: <Brain size={48} className="text-purple-500" />,
          defaultTitle: 'AI Service Unavailable',
          defaultMessage: 'The AI analytics service is currently unavailable. Please try again later.',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'chat':
        return {
          icon: <MessageCircle size={48} className="text-blue-500" />,
          defaultTitle: 'Chat Error',
          defaultMessage: 'Unable to send your message. Please check your connection and try again.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          icon: <AlertTriangle size={48} className="text-yellow-500" />,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-8 text-center max-w-md mx-auto ${className}`}>
      {/* Icon */}
      {showIcon && (
        <div className="flex justify-center mb-4 animate-scale-in">
          {config.icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title || config.defaultTitle}
      </h3>

      {/* Message */}
      <p className="text-gray-600 mb-6 leading-relaxed">
        {message || config.defaultMessage}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className={`flex items-center gap-2 px-6 py-3 ${config.buttonColor} text-white rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 mx-auto`}
        >
          {isRetrying ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span>Try Again</span>
            </>
          )}
        </button>
      )}

      {/* Additional help text */}
      {variant === 'network' && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">Troubleshooting tips:</p>
          <ul className="text-xs text-gray-500 space-y-1 text-left">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Disable VPN or proxy if enabled</li>
            <li>• Clear browser cache and cookies</li>
          </ul>
        </div>
      )}

      {variant === 'ai' && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium">While AI is unavailable:</p>
          <ul className="text-xs text-gray-500 space-y-1 text-left">
            <li>• You can still view your plants</li>
            <li>• Manual plant care features work normally</li>
            <li>• Previous AI insights are saved offline</li>
            <li>• Try again in a few minutes</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EnhancedErrorState;