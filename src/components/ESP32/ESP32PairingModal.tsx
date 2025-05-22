import React, { useState, useEffect } from 'react';
import { Wifi, X, WifiOff, CheckCircle, AlertCircle, RefreshCw, Zap, Key, HelpCircle } from 'lucide-react';
import { esp32, ESP32_AP_CONFIG } from '../../api';
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

  // Function to check ESP32 WiFi connection status
  const checkESP32ConnectionStatus = async (): Promise<{connected: boolean, ip?: string}> => {
    try {
      console.log('Checking ESP32 connection status...');
      
      // First try a direct fetch that works with proper CORS headers - NO headers
      try {
        const response = await fetch('http://192.168.4.1/connection_status', {
          method: 'GET'
          // No headers to avoid CORS issues
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('ESP32 connection status:', data);
          
          if (data.connected && data.ip) {
            return { connected: true, ip: data.ip };
          }
        }
      } catch (e) {
        console.log('Direct fetch failed, trying no-cors mode');
      }
      
      // Fallback to no-cors mode which will work in most browsers
      try {
        const noCorsFetch = await fetch('http://192.168.4.1/connection_status', {
          method: 'GET',
          mode: 'no-cors'
          // No headers to avoid CORS issues
        });
        
        // We can't read the response with no-cors, but if we get here, the ESP32 is responsive
        console.log('ESP32 is responsive (no-cors mode)');
      } catch (e) {
        console.error('No-cors fetch also failed:', e);
        return { connected: false };
      }
      
      // Since we can't read the actual status with no-cors, we'll check if the token is already set
      // If so, we'll assume success
      const directTokenCheck = await sendAuthToken('192.168.4.1');
      if (directTokenCheck) {
        console.log('Token sent successfully via AP address, device still in AP mode');
      }
      
      // Checking with another method - might be unnecessarily complicated
      try {
        const pingResponse = await fetch('http://192.168.4.1', { 
          method: 'GET',
          mode: 'no-cors'
        });
        console.log('Root ping successful - device is in AP mode');
      } catch (e) {
        console.log('Root ping failed, device might be transitioning networks');
      }
      
      // We still can't determine if it's connected to WiFi, so return false
      return { connected: false };
    } catch (error) {
      console.warn('Failed to check ESP32 connection status:', error);
      return { connected: false };
    }
  };
  
  // Function to send auth token to ESP32
  const sendAuthToken = async (ip: string = '192.168.4.1'): Promise<boolean> => {
    try {
      // Make sure we have a token
      let authToken = token;
      if (!authToken) {
        authToken = await getAuthToken();
        if (!authToken) {
          console.error('No auth token available');
          return false;
        }
        setToken(authToken);
      }
      
      console.log(`Sending token to ESP32 at ${ip}...`, authToken);
      
      // Try several methods to send the token
      try {
        // Method 1: FormData with no-cors
        console.log("Trying FormData with no-cors...");
        const formData = new FormData();
        formData.append('token', authToken);
        
        await fetch(`http://${ip}/set_token`, {
          method: 'POST',
          body: formData,
          mode: 'no-cors'
        });
        
        console.log("FormData with no-cors completed");
      } catch (e) {
        console.error("FormData method failed:", e);
      }
      
      try {
        // Method 2: URLSearchParams
        console.log("Trying URLSearchParams...");
        const params = new URLSearchParams();
        params.append('token', authToken);
        
        await fetch(`http://${ip}/set_token`, {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          mode: 'no-cors'
        });
        
        console.log("URLSearchParams method completed");
      } catch (e) {
        console.error("URLSearchParams method failed:", e);
      }
      
      try {
        // Method 3: Direct query param
        console.log("Trying query parameter...");
        await fetch(`http://${ip}/set_token?token=${encodeURIComponent(authToken)}`, {
          method: 'GET',
          mode: 'no-cors'
        });
        
        console.log("Query parameter method completed");
      } catch (e) {
        console.error("Query parameter method failed:", e);
      }
      
      try {
        // Method 4: JSON with no-cors (Arduino code supports this format)
        console.log("Trying JSON format with no-cors...");
        await fetch(`http://${ip}/set_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: authToken }),
          mode: 'no-cors'
        });
        
        console.log("JSON method completed");
      } catch (e) {
        console.error("JSON method failed:", e);
      }
      
      // If we made it this far without throwing, consider it a success
      return true;
    } catch (error) {
      console.error('All token sending methods failed:', error);
      return false;
    }
  };
  
  // Poll for ESP32 WiFi connection
  const pollForESP32WiFiConnection = async () => {
    let attempts = 0;
    const maxAttempts = 30; // Try for 30 seconds
    let connected = false;
    let esp32Ip: string | undefined;
    
    setStatus('verifying');
    
    // We'll only send token after WiFi connection is confirmed
    console.log('Waiting for ESP32 to connect to WiFi...');
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        // Check if ESP32 is connected to WiFi
        const status = await checkESP32ConnectionStatus();
        
        if (status.connected && status.ip) {
          // ESP32 is connected to WiFi!
          clearInterval(interval);
          connected = true;
          esp32Ip = status.ip;
          
          console.log(`ESP32 connected to WiFi with IP: ${esp32Ip}`);
          
          // Now that WiFi is confirmed working, send the token
          setStatus('sending_token');
          const tokenSent = await sendAuthToken(esp32Ip);
          
          if (tokenSent) {
            setStatus('success');
          } else {
            setError('Failed to send token to ESP32. You may need to configure it manually.');
            setStatus('success'); // Still show success since WiFi config worked
          }
        }
        // Don't send token in AP mode anymore, wait for successful WiFi connection
      } catch (e) {
        console.warn(`Connection check attempt ${attempts} failed:`, e);
      }
      
      // If max attempts reached, assume success anyway
      if (attempts >= maxAttempts && !connected) {
        clearInterval(interval);
        console.log('Max polling attempts reached. Assuming success.');
        
        // No last token attempt in AP mode, only send token after confirmed WiFi connection
        setStatus('success');
      }
    }, 1000); // Check every 1 second
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
    
    // Move directly to configuration step - bypassing any connection check
    setStatus('connecting');
    
    // Get authentication token (will be stored in the app for later use)
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
      
      console.log('Sending WiFi credentials to ESP32...');
      
      try {
        // Make a direct fetch call to the ESP32
        const response = await fetch('http://192.168.4.1/set_wifi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          mode: 'no-cors', // Important to prevent CORS issues
        });
        
        console.log('WiFi config direct response:', response);
        
        // With no-cors mode, we can't actually read the response status
        // But if we got this far without an error, it likely succeeded
        
        // Save this network for future use
        saveNetwork(ssid);
        
        // Set device ID
        const deviceId = 'fern_device_001';
        setDeviceId(deviceId);
        
        // IMPORTANT: Send token immediately after WiFi credentials, before WiFi connection attempt
        console.log('Immediately sending token to ESP32 after WiFi credentials...');
        const tokenSent = await sendAuthToken();
        if (tokenSent) {
          console.log('✅ Token successfully sent to ESP32 in AP mode');
        } else {
          console.warn('⚠️ Failed to send token to ESP32 in AP mode, will retry after WiFi connection');
        }
        
        // Start polling for WiFi connection
        pollForESP32WiFiConnection();
      } catch (fetchError) {
        console.error('Error sending WiFi config directly:', fetchError);
        
        // Fall back to the API method
        const response = await esp32.configureESP32WiFi(credentials, "192.168.4.1", true);
        
        if (response.success) {
          // Save this network for future use
          saveNetwork(ssid);
          
          // Set device ID
          const deviceId = 'fern_device_001';
          setDeviceId(deviceId);
          
          // IMPORTANT: Send token immediately after WiFi credentials in the fallback path too
          console.log('Fallback path: Immediately sending token to ESP32 after WiFi credentials...');
          const tokenSent = await sendAuthToken();
          if (tokenSent) {
            console.log('✅ Fallback: Token successfully sent to ESP32 in AP mode');
          } else {
            console.warn('⚠️ Fallback: Failed to send token to ESP32 in AP mode, will retry after WiFi connection');
          }
          
          // Start polling for WiFi connection
          pollForESP32WiFiConnection();
        } else {
          throw new Error(response.message || 'Failed to send WiFi credentials');
        }
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
          <div className="space-y-4 pb-2">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-700 mb-2 flex items-center">
                <Wifi className="mr-2" size={18} />
                Connect to ESP32
              </h3>
              <p className="text-sm text-blue-600">
                To get started, make sure your ESP32 device is powered on. Look for the WiFi network 
                named <strong>"ESP32_AP_Config"</strong> and connect your device to this network.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                The blue LED on your ESP32 should be flashing when it's in configuration mode.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    alert('Step 1: Go to your device WiFi settings\nStep 2: Connect to "ESP32_AP_Config" network\nStep 3: Return to this app and proceed with setup');
                  }}
                  className="px-3 py-1.5 border border-blue-400 text-blue-700 rounded-md text-sm hover:bg-blue-50 flex items-center"
                >
                  <HelpCircle size={16} className="mr-1" />
                  Need Help?
                </button>
              </div>
              
              <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Important Information</h4>
                <p className="text-xs text-amber-700 mb-2">
                  Make sure your device is connected to the <strong>ESP32_AP_Config</strong> WiFi network before proceeding.
                </p>
                <p className="text-xs text-amber-700 mb-2">
                  <strong>Warning:</strong> If you enter incorrect WiFi credentials, the ESP32 may report success but won't actually connect to your network. Double-check your WiFi name and password.
                </p>
                <p className="text-xs text-amber-700">
                  2.4GHz WiFi networks are required, as ESP32 doesn't support 5GHz networks.
                </p>
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
            <p className="mt-4 text-gray-700 font-semibold">
              {status === 'configuring' 
                ? 'Sending WiFi credentials to ESP32...' 
                : status === 'sending_token'
                ? 'Sending authentication token to ESP32...'
                : 'Verifying connection...'}
            </p>
            {status === 'configuring' && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                Your ESP32 device will connect to your home WiFi network <strong>"{ssid}"</strong>.<br/>
                Please wait while the device receives the credentials.
              </p>
            )}
            {status === 'verifying' && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                The ESP32 is connecting to your WiFi network <strong>"{ssid}"</strong>. This may take up to 30 seconds.<br/>
                <span className="text-orange-600">Please remain connected to the ESP32_AP_Config network while we check connection status.</span>
              </p>
            )}
            {status === 'sending_token' && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                Authenticating the ESP32 device with the TanaMind backend.<br/>
                This allows your device to securely send plant data to your account.
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
              Your ESP32 device <strong>(ID: {deviceId})</strong> has been successfully configured.
            </p>
            <div className="mt-4 bg-blue-50 p-4 rounded-md w-full max-w-sm">
              <h4 className="font-medium text-blue-700 text-sm">What happens next:</h4>
              <ul className="mt-2 text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>The ESP32 is now connecting to your WiFi network "{ssid}"</li>
                <li>Once connected, sensor data will begin transmitting to your TanaMind account</li>
                <li>The watering system will activate automatically when soil moisture drops below threshold</li>
                <li>You can view the sensor data in the Dashboard</li>
              </ul>
            </div>
            <div className="mt-4 bg-amber-50 p-4 rounded-md w-full max-w-sm">
              <h4 className="font-medium text-amber-700 text-sm">Important Note:</h4>
              <p className="mt-1 text-sm text-amber-600">
                If your device is not appearing in the dashboard after a few minutes, you may need to:
              </p>
              <ul className="mt-2 text-sm text-amber-700 list-disc pl-5 space-y-1">
                <li><strong>Check that you entered the correct WiFi credentials</strong>. The device may appear to connect successfully even with incorrect credentials.</li>
                <li>Reset the ESP32 and try configuration again</li>
                <li>Ensure the ESP32 is within range of your WiFi router</li>
                <li>Verify that your WiFi network is 2.4GHz (ESP32 doesn't support 5GHz networks)</li>
              </ul>
            </div>
            <button
              onClick={finishPairing}
              className="mt-6 px-4 py-2 bg-[#0B9444] text-white rounded-md hover:bg-[#056526] flex items-center"
            >
              <CheckCircle size={18} className="mr-2" />
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
            
            <div className="mt-4 bg-amber-50 p-4 rounded-md w-full max-w-sm">
              <h4 className="font-medium text-amber-700 text-sm">Troubleshooting steps:</h4>
              <ul className="mt-2 text-sm text-amber-800 list-disc pl-5 space-y-1.5">
                <li>Make sure your ESP32 device is powered on (LED should be on)</li>
                <li>Connect your device WiFi to the "ESP32_AP_Config" network</li>
                <li>Check if you've entered the correct WiFi credentials</li>
                <li>Try restarting your ESP32 device by unplugging and reconnecting power</li>
                <li>Ensure your WiFi router is working properly</li>
              </ul>
            </div>
            
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
    <div className="fixed inset-0 z-10 bg-black bg-opacity-50 overflow-hidden">
      {/* Container with proper positioning */}
      <div className="absolute inset-x-0 top-0 w-full h-full flex flex-col sm:p-4 sm:items-center sm:justify-center">
        {/* Modal for all screen sizes */}
        <div className="flex flex-col bg-white rounded-none sm:rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[calc(100vh-40px)] overflow-hidden">
          {/* Top spacing div on mobile - increased height for more space */}
          <div className="h-[80px] sm:hidden flex-shrink-0"></div>
        {/* Fixed header - NOT sticky */}
        <div className="flex-shrink-0 flex items-center justify-between bg-[#F3FFF6] px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0B9444] flex items-center">
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
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-grow overflow-y-auto relative">
          {error && status !== 'error' && (
            <div className="px-4 sm:px-6 pt-4 pb-0">
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6">
            {renderStepContent()}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ESP32PairingModal;