import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'chart';
  lines?: number;
  className?: string;
  animate?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  lines = 3,
  className = '',
  animate = true
}) => {
  const baseClasses = `bg-gray-200 rounded ${animate ? 'animate-pulse' : ''}`;

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }, (_, index) => (
              <div
                key={index}
                className={`${baseClasses} h-4`}
                style={{
                  width: index === lines - 1 ? '75%' : '100%'
                }}
              />
            ))}
          </div>
        );

      case 'card':
        return (
          <div className={`${baseClasses} p-6 space-y-4 ${className}`}>
            <div className="flex items-center space-x-3">
              <div className={`${baseClasses} w-10 h-10 rounded-full`} />
              <div className="flex-1 space-y-2">
                <div className={`${baseClasses} h-4 w-3/4`} />
                <div className={`${baseClasses} h-3 w-1/2`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className={`${baseClasses} h-3 w-full`} />
              <div className={`${baseClasses} h-3 w-5/6`} />
              <div className={`${baseClasses} h-3 w-4/5`} />
            </div>
          </div>
        );

      case 'avatar':
        return (
          <div className={`${baseClasses} w-10 h-10 rounded-full ${className}`} />
        );

      case 'button':
        return (
          <div className={`${baseClasses} h-10 w-24 rounded-md ${className}`} />
        );

      case 'chart':
        return (
          <div className={`${baseClasses} ${className}`}>
            <div className="flex items-end justify-between h-32 p-4 space-x-2">
              {Array.from({ length: 7 }, (_, index) => (
                <div
                  key={index}
                  className={`${baseClasses} w-full rounded-t`}
                  style={{
                    height: `${Math.random() * 80 + 20}%`
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return <div className={`${baseClasses} h-4 w-full ${className}`} />;
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton;