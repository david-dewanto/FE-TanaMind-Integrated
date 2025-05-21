import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, Signal, RefreshCw } from 'lucide-react';
import { esp32 } from '../../api';

interface ESP32StatusIndicatorProps {
  deviceId: string;
  isConnected?: boolean;
  signalStrength?: number;
  lastConnected?: string;
  showDetails?: boolean;
  className?: string;
  autoRefresh?: boolean;
}

const ESP32StatusIndicator: React.FC<ESP32StatusIndicatorProps> = ({
  deviceId,
  isConnected: initialIsConnected,
  signalStrength: initialSignalStrength,
  lastConnected: initialLastConnected,
  showDetails = false,
  className = '',
  autoRefresh = false
}) => {
  // Local state to track device status
  const [status, setStatus] = useState({
    isConnected: initialIsConnected || false,
    signalStrength: initialSignalStrength,
    lastConnected: initialLastConnected,
    isLoading: false
  });

  // Fetch device status
  const fetchDeviceStatus = async () => {
    if (!deviceId) return;
    
    setStatus(prev => ({ ...prev, isLoading: true }));
    try {
      const deviceInfo = await esp32.getESP32DeviceStatus(deviceId);
      setStatus({
        isConnected: deviceInfo.status.connected,
        signalStrength: deviceInfo.status.signalStrength,
        lastConnected: deviceInfo.status.lastConnected,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to fetch ESP32 status:', error);
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Auto-refresh status if enabled
  useEffect(() => {
    if (autoRefresh) {
      // Initial fetch
      fetchDeviceStatus();
      
      // Set up interval for refreshing
      const intervalId = setInterval(fetchDeviceStatus, 60000); // Refresh every minute
      
      return () => clearInterval(intervalId);
    }
  }, [deviceId, autoRefresh]);
  
  // Helper to determine signal strength icon based on dBm value
  const getSignalIcon = () => {
    if (!status.signalStrength) return <Signal size={16} />;
    
    // Typical WiFi signal strength ranges (in dBm):
    // -50 to -30: Excellent
    // -70 to -50: Good
    // -80 to -70: Fair
    // -90 to -80: Poor
    // less than -90: Very Poor
    
    if (status.signalStrength > -50) {
      return <Signal size={16} className="text-green-600" />; // Excellent
    } else if (status.signalStrength > -70) {
      return <Signal size={16} className="text-green-500" />; // Good
    } else if (status.signalStrength > -80) {
      return <Signal size={16} className="text-yellow-500" />; // Fair
    } else {
      return <Signal size={16} className="text-red-500" />; // Poor
    }
  };
  
  // Format the last connected time
  const formatLastConnected = () => {
    if (!status.lastConnected) return 'Never';
    
    try {
      const date = new Date(status.lastConnected);
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
        {status.isLoading ? (
          <RefreshCw size={16} className="text-gray-500 animate-spin" />
        ) : status.isConnected ? (
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
      {status.isLoading ? (
        <>
          <RefreshCw size={16} className="text-gray-500 animate-spin" />
          <span className="text-sm text-gray-500">Checking status...</span>
        </>
      ) : status.isConnected ? (
        <>
          <Wifi size={16} className="text-green-600" />
          <span className="text-sm text-green-600">Connected</span>
          {status.signalStrength && (
            <>
              {getSignalIcon()}
              <span className="text-xs text-gray-500">{status.signalStrength} dBm</span>
            </>
          )}
          <button 
            onClick={fetchDeviceStatus}
            className="ml-2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Refresh status"
          >
            <RefreshCw size={14} />
          </button>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-sm text-red-500">Offline</span>
          {status.lastConnected && (
            <>
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs text-gray-500">Last seen: {formatLastConnected()}</span>
            </>
          )}
          <button 
            onClick={fetchDeviceStatus}
            className="ml-2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            title="Refresh status"
          >
            <RefreshCw size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default ESP32StatusIndicator;