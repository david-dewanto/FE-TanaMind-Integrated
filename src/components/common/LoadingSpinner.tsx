import React from 'react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullPage = false,
  size = 'medium',
  message = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  const spinnerElement = (
    <div className={`${className} flex flex-col items-center justify-center`}>
      <div
        className={`${sizeClasses[size]} border-t-green-500 border-r-green-300 border-b-green-300 border-l-green-300 rounded-full animate-spin`}
      />
      {message && <p className="mt-2 text-gray-600">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;