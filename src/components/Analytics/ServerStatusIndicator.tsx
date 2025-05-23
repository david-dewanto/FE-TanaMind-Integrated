import React, { useState, useEffect } from 'react';
import { 
  Server, 
  RefreshCw, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Wifi,
  Activity,
  Zap
} from 'lucide-react';
import AnimatedLoadingSpinner from '../common/AnimatedLoadingSpinner';

interface ServerStatusIndicatorProps {
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({
  onRetry,
  isRetrying = false,
  className = '',
  autoRefresh = true,
  refreshInterval = 30
}) => {
  const [countdown, setCountdown] = useState(refreshInterval);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (!autoRefresh || isRetrying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsAutoRetrying(true);
          setRetryCount(count => count + 1);
          onRetry();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, isRetrying, onRetry, refreshInterval]);

  // Reset countdown when retry state changes
  useEffect(() => {
    if (!isRetrying && isAutoRetrying) {
      setIsAutoRetrying(false);
      setCountdown(refreshInterval);
    }
  }, [isRetrying, isAutoRetrying, refreshInterval]);

  const handleManualRetry = () => {
    setCountdown(refreshInterval);
    setRetryCount(count => count + 1);
    onRetry();
  };

  const getStatusIcon = () => {
    if (isRetrying || isAutoRetrying) {
      return <RefreshCw size={24} className="text-blue-500 animate-spin" />;
    }
    return <Server size={24} className="text-orange-500" />;
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">AI Server Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-600 font-medium">
                {isRetrying || isAutoRetrying ? 'Checking...' : 'Temporarily Unavailable'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Manual Retry Button */}
        <button
          onClick={handleManualRetry}
          disabled={isRetrying || isAutoRetrying}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isRetrying || isAutoRetrying ? (
            <AnimatedLoadingSpinner size="sm" className="w-4 h-4" />
          ) : (
            <RefreshCw size={16} />
          )}
          <span className="text-sm font-medium">
            {isRetrying || isAutoRetrying ? 'Checking' : 'Check Now'}
          </span>
        </button>
      </div>

      {/* Status Message */}
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          Our AI analytics server is currently undergoing maintenance and will be back online soon.
        </p>
        <p className="text-sm text-gray-600">
          We're working hard to restore full functionality. Thank you for your patience!
        </p>
      </div>

      {/* Auto-refresh Timer */}
      {autoRefresh && !isRetrying && !isAutoRetrying && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Auto-checking in</span>
            </div>
            <span className="text-lg font-mono font-bold text-orange-600">
              {formatTime(countdown)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((refreshInterval - countdown) / refreshInterval) * 100}%` 
              }}
            />
          </div>
        </div>
      )}


      {/* What You Can Do */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">While AI is unavailable:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={14} className="text-green-500" />
            <span>View and manage your plants</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={14} className="text-green-500" />
            <span>Monitor sensor readings</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={14} className="text-green-500" />
            <span>Manual watering controls</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={14} className="text-green-500" />
            <span>Access saved AI insights</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ServerStatusIndicator;