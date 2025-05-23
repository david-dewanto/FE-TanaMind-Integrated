import React, { useState } from 'react';

interface EnhancedTooltipProps {
  title?: string;
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  maxWidth?: string;
}

const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({ 
  title,
  content, 
  children, 
  position = 'top',
  className = '',
  maxWidth = 'max-w-xs'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-900';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-900';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-900';
      default: // top
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-900';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-40 ${getPositionClasses()}`}>
          <div className={`bg-gray-900 text-white text-sm rounded-lg shadow-xl ${maxWidth}`}>
            {title && (
              <div className="px-4 pt-3 pb-2 border-b border-gray-700">
                <h4 className="font-semibold text-white">{title}</h4>
              </div>
            )}
            <div className="px-4 py-3">
              {typeof content === 'string' ? (
                <p className="leading-relaxed text-gray-100">{content}</p>
              ) : (
                content
              )}
            </div>
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTooltip;