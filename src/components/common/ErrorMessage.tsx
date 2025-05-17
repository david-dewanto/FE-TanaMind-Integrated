import React from 'react';

export type ErrorType = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  minimal?: boolean; // For minimal styling (field errors, etc.)
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  onRetry,
  onDismiss,
  className = '',
  minimal = false,
}) => {
  const typeClasses = {
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  const iconMap = {
    error: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 7a1 1 0 102 0v-3a1 1 0 10-2 0v3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  // If minimal is true, use simplified styling for field errors
  if (minimal) {
    return (
      <div className={`text-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-600 text-sm ${className}`}>
        {message}
      </div>
    );
  }

  return (
    <div className={`${typeClasses[type]} border px-4 py-3 rounded relative mb-4 ${className}`} role="alert">
      <div className="flex items-center">
        {iconMap[type]}
        <span className="flex-grow">{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 inline-flex text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-1 px-3 border border-gray-300 rounded shadow-sm text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;