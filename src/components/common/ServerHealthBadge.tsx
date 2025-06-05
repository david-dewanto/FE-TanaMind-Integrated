import React, { useState, useRef, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { useAIAnalytics } from '../../contexts/AIAnalyticsContext';

interface ServerHealthBadgeProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const ServerHealthBadge: React.FC<ServerHealthBadgeProps> = ({
  showLabel = false,
  size = 'sm',
  className = '',
  onClick
}) => {
  const { state } = useAIAnalytics();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  const getStatusConfig = () => {
    if (state.isAnalyzing) {
      return {
        iconColor: 'text-blue-600',
        label: 'AI Analyzing',
        description: 'Processing your plant data...',
        statusIcon: <Activity size={14} className="text-blue-600" />,
        animate: true
      };
    }
    
    if (state.isAvailable) {
      return {
        iconColor: 'text-green-600',
        label: 'AI Ready',
        description: 'Click to view AI Analytics',
        statusIcon: <CheckCircle size={14} className="text-green-600" />,
        animate: false
      };
    }
    
    return {
      iconColor: 'text-orange-600',
      label: 'AI Offline',
      description: 'Service temporarily unavailable',
      statusIcon: <AlertCircle size={14} className="text-orange-600" />,
      animate: false
    };
  };

  const config = getStatusConfig();

  const handleToggleDropdown = () => {
    setShowTooltip(!showTooltip);
  };

  const handleNavigate = () => {
    if (onClick) {
      onClick();
      setShowTooltip(false);
    }
  };

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        className={`relative p-2 ${config.iconColor} hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B9444] focus:ring-offset-2 rounded-lg transition-colors ${className}`}
        onClick={handleToggleDropdown}
        aria-label={config.label}
      >
        {/* Main AI Icon - matching notification bell style */}
        <Brain className={`h-6 w-6 opacity-90 ${config.animate ? 'animate-pulse' : ''}`} />
      </button>

      {/* Dropdown - matching notification dropdown style */}
      {showTooltip && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50 sm:w-80"
          style={{
            right: isMobile ? '50%' : '0',
            transform: isMobile ? 'translateX(50%)' : 'none'
          }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">AI Analytics</h3>
              <span className={`${
                state.isAvailable ? 'bg-green-100 text-green-800' : 
                state.isAnalyzing ? 'bg-blue-100 text-blue-800' : 
                'bg-orange-100 text-orange-800'
              } text-xs font-medium px-2 py-1 rounded-full`}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-4 sm:px-4 sm:py-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 ${
                state.isAvailable ? 'bg-green-50' : 
                state.isAnalyzing ? 'bg-blue-50' : 
                'bg-orange-50'
              } rounded-full flex items-center justify-center`}>
                {state.isAvailable ? (
                  <Brain size={32} className="text-green-600" />
                ) : state.isAnalyzing ? (
                  <Brain size={32} className="text-blue-600 animate-pulse" />
                ) : (
                  <Brain size={32} className="text-orange-600" />
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {config.statusIcon}
                <span className="text-sm font-medium text-gray-900">{config.label}</span>
              </div>
              <p className="text-sm text-gray-600">{config.description}</p>
              
              {state.isAvailable && state.recommendations && Object.keys(state.recommendations).length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-500">Plants analyzed</span>
                    <span className="font-medium text-gray-900">{Object.keys(state.recommendations).length}</span>
                  </div>
                </div>
              )}

              {!state.isAvailable && (
                <p className="mt-3 text-xs text-gray-500">
                  Our team is working to restore the service. Please try again later.
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          {onClick && (
            <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-gray-200">
              <button
                onClick={handleNavigate}
                className="w-full text-center text-[#0B9444] hover:text-[#056526] text-xs sm:text-sm font-medium transition-colors"
              >
                Go to AI Analytics
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServerHealthBadge;