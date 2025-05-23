import React from 'react';

interface TypingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5', 
    lg: 'w-2 h-2'
  };

  const containerClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      <div 
        className={`${sizeClasses[size]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${sizeClasses[size]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '160ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${sizeClasses[size]} bg-gray-400 rounded-full animate-bounce`}
        style={{ animationDelay: '320ms', animationDuration: '1.4s' }}
      />
    </div>
  );
};

export default TypingIndicator;