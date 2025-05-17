import React from 'react';
import { AlertTriangle, XCircle, Info, AlertCircle } from 'lucide-react';

type ErrorType = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  type?: ErrorType;
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type = 'error',
  title,
  message,
  onRetry,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle size={24} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-amber-500" />;
      case 'info':
        return <Info size={24} className="text-blue-500" />;
      default:
        return <AlertCircle size={24} className="text-red-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="ml-3">
          <h3 className="font-medium">{title || getDefaultTitle()}</h3>
          <div className="mt-1 text-sm">{message}</div>
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`text-sm font-medium ${
                    type === 'error'
                      ? 'text-red-600 hover:text-red-700'
                      : type === 'warning'
                      ? 'text-amber-600 hover:text-amber-700'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm font-medium text-gray-600 hover:text-gray-700"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;