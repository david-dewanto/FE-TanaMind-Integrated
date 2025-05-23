import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';

interface AnimatedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ai' | 'analysis';
  message?: string;
  className?: string;
}

const AnimatedLoadingSpinner: React.FC<AnimatedLoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28
  };

  const getIcon = () => {
    switch (variant) {
      case 'ai':
        return <Brain size={iconSizes[size]} className="text-blue-500" />;
      case 'analysis':
        return <Cpu size={iconSizes[size]} className="text-purple-500" />;
      default:
        return <Sparkles size={iconSizes[size]} className="text-green-500" />;
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'ai':
        return 'from-blue-500 to-blue-600';
      case 'analysis':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Animated Container */}
      <div className="relative">
        {/* Outer Ring */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${getGradient()} opacity-20 animate-ping`}
        />
        
        {/* Middle Ring */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent bg-gradient-to-tr ${getGradient()} animate-spin`}
          style={{
            background: `conic-gradient(from 0deg, transparent, transparent, var(--tw-gradient-stops))`,
            animationDuration: '1.5s'
          }}
        />
        
        {/* Inner Icon */}
        <div className={`absolute inset-0 ${sizeClasses[size]} flex items-center justify-center bg-white rounded-full shadow-sm`}>
          <div className="animate-pulse">
            {getIcon()}
          </div>
        </div>
      </div>

      {/* Loading Message */}
      {message && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 animate-pulse">
            {message}
          </p>
          <div className="flex justify-center mt-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedLoadingSpinner;