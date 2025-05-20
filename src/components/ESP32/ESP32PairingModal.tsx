import React, { useState, useEffect } from 'react';
import { Wifi, X, WifiOff, CheckCircle, AlertCircle, RefreshCw, Zap, Key } from 'lucide-react';
import { esp32 } from '../../api';
import { ESP32WiFiCredentials, ESP32PairingStatus, ESP32ConnectionResponse } from '../../types';
import { LoadingSpinner } from '../common';
import { useAuth } from '../../contexts/AuthContext';

interface ESP32PairingModalProps {
  onClose: () => void;
  onSuccess: (deviceId: string) => void;
}

const ESP32PairingModal: React.FC<ESP32PairingModalProps> = ({ onClose, onSuccess }) => {
  // Get auth context for token
  const { user, getToken } = useAuth();
  
  // Pairing state
  const [status, setStatus] = useState<ESP32PairingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Form fields
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [savedNetworks, setSavedNetworks] = useState<string[]>([]);
  
  // Check if we're connected to the ESP32 AP on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Only check connection if we're in 'idle' or 'scanning' state
        // to prevent infinite loops
        if (status !== 'connecting' && status !== 'configuring' && 
            status !== 'verifying' && status !== 'success' && status !== 'error') {
          
          setStatus('scanning');
          const isConnected = await esp32.isConnectedToESP32AP();
          
          if (isConnected) {
            setStatus('connecting');
          } else {
            setStatus('idle');
          }
        }
      } catch (err) {
        console.error('Failed to check ESP32 connection:', err);
        setStatus('idle');
      }
    };
    
    // Only run once at component mount
    checkConnection();
    
    // Try to load saved networks from localStorage
    const networks = localStorage.getItem('savedWifiNetworks');
    if (networks) {
      try {
        const parsedNetworks = JSON.parse(networks);
        if (Array.isArray(parsedNetworks)) {
          setSavedNetworks(parsedNetworks);
        }
      } catch (e) {
        console.error('Failed to parse saved networks:', e);
      }
    }
  }, []);
  
  // Function to save a network to localStorage
  const saveNetwork = (networkSsid: string) => {
    if (!savedNetworks.includes(networkSsid)) {
      const networks = [...savedNetworks, networkSsid];
      setSavedNetworks(networks);
      localStorage.setItem('savedWifiNetworks', JSON.stringify(networks));
    }
  };
  
  // Function to get authentication token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const token = await getToken();
      return token;
    } catch (err) {
      console.error('Failed to get authentication token:', err);
      return null;
    }
  };

  // Function to send WiFi credentials to ESP32
  const configureESP32 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ssid.trim()) {
      setError('Please enter your WiFi network name (SSID)');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your WiFi password');
      return;
    }
    
    // Get authentication token
    const authToken = await getAuthToken();
    if (!authToken) {
      setError('Failed to get authentication token. Please make sure you are logged in.');
      return;
    }
    
    setToken(authToken);
    setError(null);
    setStatus('configuring');
    
    try {
      const credentials: ESP32WiFiCredentials = { ssid, password };
      const response = await esp32.configureESP32WiFi(credentials);
      
      if (response.success) {
        // Save this network for future use
        saveNetwork(ssid);
        
        if (response.deviceId) {
          setDeviceId(response.deviceId);
          
          // Now send the authentication token
          setStatus('sending_token');
          const tokenResponse = await esp32.sendTokenToESP32(authToken);
          
          if (tokenResponse.success) {
            setStatus('success');
          } else {
            setError(tokenResponse.message);
            setStatus('error');
          }
        } else {
          setStatus('verifying');
          setTimeout(() => {
            // In a real app, you would check if the ESP32 successfully connected to WiFi
            // For demo, just simulate success
            const mockDeviceId = 'fern_device_001';
            setDeviceId(mockDeviceId);
            
            // Now send the authentication token
            setStatus('sending_token');
            esp32.sendTokenToESP32(authToken)
              .then((tokenResponse) => {
                if (tokenResponse.success) {
                  setStatus('success');
                } else {
                  setError(tokenResponse.message);
                  setStatus('error');
                }
              })
              .catch((err) => {
                console.error('Failed to send token to ESP32:', err);
                setError('Failed to send authentication token to ESP32');
                setStatus('error');
              });
          }, 2000);
        }
      } else {
        setError(response.message);
        setStatus('error');
      }
    } catch (err) {
      console.error('Failed to configure ESP32:', err);
      setError(err instanceof Error ? err.message : 'Failed to configure ESP32 device');
      setStatus('error');
    }
  };
  
  // Function to retry the connection
  const retryConnection = () => {
    setError(null);
    setStatus('idle');
  };
  
  // Function to complete the pairing process
  const finishPairing = () => {
    if (deviceId) {
      onSuccess(deviceId);
    } else {
      setError('No device ID received. Please try again.');
      setStatus('error');
    }
  };
  
  // Helper to show the appropriate step content
  const renderStepContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                <Wifi className="mr-2" size={18} />
                Connect to ESP32
              </h3>
              <p className="text-sm text-blue-600">
                To get started, make sure your ESP32 device is powered on and in configuration mode 
                (blue LED should be flashing). Then connect your device to the ESP32's WiFi network
                named "ESP32_AP_Config".
              </p>
              <div className="mt-3">
                <button
                  onClick={async () => {
                    try {
                      setStatus('scanning');
                      const isConnected = await esp32.isConnectedToESP32AP();
                      if (isConnected) {
                        setStatus('connecting');
                      } else {
                        setStatus('idle');
                        setError('Not connected to ESP32 AP. Please connect to the ESP32_AP_Config WiFi network.');
                      }
                    } catch (err) {
                      console.error('Failed to check ESP32 connection:', err);
                      setStatus('idle');
                      setError('Connection check failed. Please try again.');
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Check Connection
                </button>
              </div>
            </div>
            
            <form onSubmit={configureESP32} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WiFi Network Name (SSID)
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="Enter your WiFi network name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  list="saved-networks"
                />
                {savedNetworks.length > 0 && (
                  <datalist id="saved-networks">
                    {savedNetworks.map((network) => (
                      <option key={network} value={network} />
                    ))}
                  </datalist>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WiFi Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your WiFi password"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full p-2 bg-[#0B9444] text-white rounded-md hover:bg-[#056526] flex items-center justify-center"
                >
                  <Zap size={16} className="mr-2" />
                  Configure ESP32
                </button>
              </div>
            </form>
          </div>
        );
        
      case 'scanning':
      case 'connecting':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-700">
              {status === 'scanning' ? 'Checking for ESP32 device...' : 'Connecting to ESP32...'}
            </p>
          </div>
        );
        
      case 'configuring':
      case 'verifying':
      case 'sending_token':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-700">
              {status === 'configuring' 
                ? 'Sending WiFi credentials to ESP32...' 
                : status === 'sending_token'
                ? 'Sending authentication token to ESP32...'
                : 'Verifying connection...'}
            </p>
            {status === 'verifying' && (
              <p className="mt-2 text-sm text-gray-500">
                The ESP32 is connecting to your WiFi network. This may take a moment...
              </p>
            )}
            {status === 'sending_token' && (
              <p className="mt-2 text-sm text-gray-500">
                Authenticating the ESP32 device with the TanaMind backend...
              </p>
            )}
          </div>
        );
        
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Successfully Paired!</h3>
            <p className="mt-2 text-gray-600 text-center">
              Your ESP32 device (ID: {deviceId}) has been successfully connected to your WiFi network.
              You can now use it to monitor and control your plant.
            </p>
            <button
              onClick={finishPairing}
              className="mt-6 px-4 py-2 bg-[#0B9444] text-white rounded-md hover:bg-[#056526]"
            >
              Complete Setup
            </button>
          </div>
        );
        
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Connection Failed</h3>
            <p className="mt-2 text-red-600 text-center">
              {error || 'Failed to connect to the ESP32 device.'}
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={retryConnection}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between bg-[#F3FFF6] px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#0B9444] flex items-center">
            {status === 'success' ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                ESP32 Connected
              </>
            ) : status === 'error' ? (
              <>
                <AlertCircle size={20} className="mr-2" />
                Connection Error
              </>
            ) : (
              <>
                <Wifi size={20} className="mr-2" />
                ESP32 Setup
              </>
            )}
          </h2>
          
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {error && status !== 'error' && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default ESP32PairingModal;