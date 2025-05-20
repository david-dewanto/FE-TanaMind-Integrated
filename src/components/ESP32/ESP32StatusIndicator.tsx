import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Signal } from 'lucide-react';

interface ESP32StatusIndicatorProps {
  isConnected: boolean;
  signalStrength?: number;
  lastConnected?: string;
  showDetails?: boolean;
  className?: string;
}

const ESP32StatusIndicator: React.FC<ESP32StatusIndicatorProps> = ({
  isConnected,
  signalStrength,
  lastConnected,
  showDetails = false,
  className = ''
}) => {
  // Helper to determine signal strength icon based on dBm value
  const getSignalIcon = () => {
    if (!signalStrength) return <Signal size={16} />;
    
    // Typical WiFi signal strength ranges (in dBm):
    // -50 to -30: Excellent
    // -70 to -50: Good
    // -80 to -70: Fair
    // -90 to -80: Poor
    // less than -90: Very Poor
    
    if (signalStrength > -50) {
      return <Signal size={16} className="text-green-600" />; // Excellent
    } else if (signalStrength > -70) {
      return <Signal size={16} className="text-green-500" />; // Good
    } else if (signalStrength > -80) {
      return <Signal size={16} className="text-yellow-500" />; // Fair
    } else {
      return <Signal size={16} className="text-red-500" />; // Poor
    }
  };
  
  // Format the last connected time
  const formatLastConnected = () => {
    if (!lastConnected) return 'Never';
    
    try {
      const date = new Date(lastConnected);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // If less than a minute ago
      if (diffMs < 60000) {
        return 'Just now';
      }
      
      // If less than an hour ago
      if (diffMs < 3600000) {
        const minutes = Math.floor(diffMs / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      
      // If less than a day ago
      if (diffMs < 86400000) {
        const hours = Math.floor(diffMs / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      
      // If less than a week ago
      if (diffMs < 604800000) {
        const days = Math.floor(diffMs / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      
      // Otherwise just show the date
      return date.toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Unknown';
    }
  };
  
  // Simple indicator for compact display
  if (!showDetails) {
    return (
      <div className={`flex items-center ${className}`}>
        {isConnected ? (
          <Wifi size={16} className="text-green-600" />
        ) : (
          <WifiOff size={16} className="text-red-500" />
        )}
      </div>
    );
  }
  
  // Detailed indicator
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi size={16} className="text-green-600" />
          <span className="text-sm text-green-600">Connected</span>
          {signalStrength && (
            <>
              {getSignalIcon()}
              <span className="text-xs text-gray-500">{signalStrength} dBm</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-sm text-red-500">Offline</span>
          {lastConnected && (
            <>
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs text-gray-500">Last seen: {formatLastConnected()}</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ESP32StatusIndicator;