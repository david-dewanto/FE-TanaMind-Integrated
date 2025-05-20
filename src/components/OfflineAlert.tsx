import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide the alert after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 shadow-md rounded-md max-w-md flex items-center">
        <WifiOff size={20} className="mr-2 flex-shrink-0" />
        <div>
          <p className="font-medium">You're offline</p>
          <p className="text-sm">App is running in offline mode. Some features may be limited.</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-3 flex-shrink-0 text-yellow-700 hover:text-yellow-900"
          aria-label="Dismiss"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OfflineAlert;