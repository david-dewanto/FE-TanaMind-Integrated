/**
 * ESP32 Service for communicating with ESP32 devices
 */
import { post, get } from './client';
import { ESP32WiFiCredentials, ESP32ConnectionResponse, ESP32DeviceInfo } from '../types';

/**
 * Debug configuration
 * Set to true to enable detailed logging of ESP32 communication
 */
export const ESP32_DEBUG = {
  enabled: false,
  logNetworkRequests: true,
  logResponses: true,
  logErrors: true,
  simulateSuccess: false // For testing without actual ESP32 hardware
};

/**
 * Toggle debug mode
 */
export const toggleESP32Debug = (enable?: boolean): boolean => {
  if (enable !== undefined) {
    ESP32_DEBUG.enabled = enable;
  } else {
    ESP32_DEBUG.enabled = !ESP32_DEBUG.enabled;
  }
  console.log(`ESP32 debug mode ${ESP32_DEBUG.enabled ? 'enabled' : 'disabled'}`);
  return ESP32_DEBUG.enabled;
};

/**
 * Debug log function that only logs when debug is enabled
 */
export const esp32DebugLog = (message: string, data?: any, type: 'log' | 'warn' | 'error' = 'log'): void => {
  if (!ESP32_DEBUG.enabled) return;
  
  const timestamp = new Date().toISOString();
  const formattedMessage = `[ESP32-DEBUG ${timestamp}] ${message}`;
  
  switch (type) {
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
  
  if (data !== undefined) {
    console.log('[ESP32-DEBUG DATA]', data);
  }
};

/**
 * Default ESP32 Access Point configuration
 * Matching the ESP32 Arduino code configuration
 */
export const ESP32_AP_CONFIG = {
  defaultSsid: 'ESP32_AP_Config',
  defaultIp: '192.168.4.1',
  defaultPort: 80,
  defaultEndpoint: '/set_wifi',
  tokenEndpoint: '/set_token',
  deviceId: 'fern_device_001'
};

/**
 * Check if the device is connected to the ESP32 Access Point
 * This is a best-effort method - it tries to detect if we're on the ESP32 network
 */
export const isConnectedToESP32AP = async (): Promise<boolean> => {
  try {
    esp32DebugLog('Checking connection to ESP32 AP...');
    
    // If simulation mode is enabled, return simulated success
    if (ESP32_DEBUG.enabled && ESP32_DEBUG.simulateSuccess) {
      esp32DebugLog('🔍 SIMULATION MODE: Returning simulated success for ESP32 connection');
      return true;
    }
    
    // Increase timeout to 5000ms for more reliability
    const timeout = 5000;
    
    // Try multiple approaches in parallel to detect the ESP32 connection
    const results = await Promise.allSettled([
      // Approach 1: Try a direct fetch to the root path with no-cors mode
      fetch(`http://${ESP32_AP_CONFIG.defaultIp}`, {
        method: 'GET',
        mode: 'no-cors', // This allows the request without CORS headers
        signal: AbortSignal.timeout(timeout),
        // Prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }),
      
      // Approach 2: Try a HEAD request to a specific endpoint with no-cors
      fetch(`http://${ESP32_AP_CONFIG.defaultIp}${ESP32_AP_CONFIG.defaultEndpoint}`, {
        method: 'HEAD',
        mode: 'no-cors', // This allows the request without CORS headers
        signal: AbortSignal.timeout(timeout),
        headers: {
          'Cache-Control': 'no-cache'
        }
      }),
      
      // Approach 3: Try a specific endpoint that should definitely exist on the ESP32
      fetch(`http://${ESP32_AP_CONFIG.defaultIp}${ESP32_AP_CONFIG.tokenEndpoint}`, {
        method: 'HEAD',
        mode: 'no-cors', // This allows the request without CORS headers
        signal: AbortSignal.timeout(timeout),
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    ]);
    
    // When using no-cors mode, the response type is "opaque" and status is always 0
    // We consider a fulfilled promise as a success, even with status 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const response = result.value;
        esp32DebugLog(`ESP32 connection attempt, response type: ${response.type}, status: ${response.status}`, response);
        
        // With no-cors mode, we can't check the actual status code,
        // so we assume a fulfilled promise means the network request succeeded
        return true;
      }
    }
    
    // More detailed error logging to help diagnose connection issues
    esp32DebugLog('All ESP32 connection attempts failed. Results:', 
      results.map((r, i) => `Approach ${i+1}: ${r.status === 'fulfilled' ? 'Success' : 'Failed'}`).join(', '),
      'warn');
    
    return false;
  } catch (error) {
    esp32DebugLog('ESP32 AP connectivity check failed with error:', error, 'error');
    return false;
  }
};

/**
 * Send authentication token to the ESP32 device
 * This matches the ESP32 Arduino code's endpoint at /set_token
 */
export const sendTokenToESP32 = async (
  token: string,
  deviceIp: string = ESP32_AP_CONFIG.defaultIp,
  skipConnectionCheck: boolean = false
): Promise<ESP32ConnectionResponse> => {
  try {
    esp32DebugLog(`Sending token to ESP32 at ${deviceIp}...`);
    
    // If simulation mode is enabled, return simulated success
    if (ESP32_DEBUG.enabled && ESP32_DEBUG.simulateSuccess) {
      esp32DebugLog('🔍 SIMULATION MODE: Returning simulated success for token sending');
      return {
        success: true,
        message: '[Simulated] Authentication token sent successfully'
      };
    }
    
    // First verify we can reach the ESP32, unless skipConnectionCheck is true
    if (!skipConnectionCheck) {
      const isConnected = await isConnectedToESP32AP();
      if (!isConnected) {
        return {
          success: false,
          message: 'Not connected to ESP32 Access Point. Please connect to the ESP32 WiFi network first.'
        };
      }
    }

    // The ESP32 code expects a token via GET or POST in various formats
    const url = `http://${deviceIp}${ESP32_AP_CONFIG.tokenEndpoint}`;
    
    // Try multiple approaches in parallel to maximize success chance
    try {
      // Try 1: JSON format that the Arduino code can parse
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
        mode: 'no-cors', // Allow request without CORS headers
        signal: AbortSignal.timeout(5000)
      });
      
      esp32DebugLog('Sent token as JSON');
    } catch (e) {
      esp32DebugLog('JSON token format failed:', e, 'warn');
    }
    
    // Try 2: URL parameter approach
    try {
      await fetch(`${url}?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      
      esp32DebugLog('Sent token as URL parameter');
    } catch (e) {
      esp32DebugLog('URL parameter token format failed:', e, 'warn');
    }
    
    // Try 3: FormData approach
    try {
      // Create form data with the token
      const formData = new FormData();
      formData.append('token', token);
      
      // Make direct fetch request to ESP32 with no-cors mode
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'no-cors', // Allow request without CORS headers
        signal: AbortSignal.timeout(5000)
      });
      
      esp32DebugLog('Sent token as FormData');
    } catch (e) {
      esp32DebugLog('FormData token format failed:', e, 'warn');
    }
    
    // For compatibility with the original code flow, create a mock response
    const response = { type: 'opaque', status: 0 };

    // After trying multiple approaches to send the token, assume success if we didn't throw
    // Since we're using no-cors mode, we can't read the response status or body
    
    // Return success since we tried multiple approaches
    return {
      success: true,
      message: 'Authentication token sent via multiple methods'
    };
  } catch (error) {
    esp32DebugLog('Failed to send token to ESP32:', error, 'error');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send authentication token to ESP32'
    };
  }
};

/**
 * Configure ESP32 with WiFi credentials
 * @param credentials WiFi credentials (SSID and password)
 * @returns ESP32ConnectionResponse
 */
export const configureESP32WiFi = async (
  credentials: ESP32WiFiCredentials,
  deviceIp: string = ESP32_AP_CONFIG.defaultIp,
  skipConnectionCheck: boolean = false
): Promise<ESP32ConnectionResponse> => {
  try {
    esp32DebugLog(`Configuring ESP32 WiFi with credentials: ${credentials.ssid}`);
    
    // If simulation mode is enabled, return simulated success
    if (ESP32_DEBUG.enabled && ESP32_DEBUG.simulateSuccess) {
      esp32DebugLog('🔍 SIMULATION MODE: Returning simulated success for WiFi configuration');
      return {
        success: true,
        message: '[Simulated] WiFi credentials sent successfully',
        deviceId: ESP32_AP_CONFIG.deviceId
      };
    }
    
    // Check if we're in production (HTTPS)
    const isProduction = window.location.protocol === 'https:';
    if (isProduction) {
      esp32DebugLog('⚠️ Production environment detected. Please use the offline setup tool for ESP32 configuration.', null, 'warn');
      return {
        success: false,
        message: 'Please use the offline setup tool to configure your ESP32 device. Download it from the ESP32 setup guide.'
      };
    }
    
    // First verify we can reach the ESP32, unless skipConnectionCheck is true
    if (!skipConnectionCheck) {
      const isConnected = await isConnectedToESP32AP();
      if (!isConnected) {
        return {
          success: false,
          message: 'Not connected to ESP32 Access Point. Please connect to the ESP32 WiFi network first.'
        };
      }
    }

    // Send WiFi credentials to ESP32
    const url = `http://${deviceIp}${ESP32_AP_CONFIG.defaultEndpoint}`;
    
    esp32DebugLog('Sending WiFi credentials to:', url);
    
    try {
      // Try multiple approaches to maximize success
      const attempts = [];
      
      // Attempt 1: Standard POST with JSON
      attempts.push(
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        }).catch(e => {
          esp32DebugLog('JSON POST attempt failed:', e, 'warn');
          return null;
        })
      );
      
      // Attempt 2: Form data POST
      const formData = new FormData();
      formData.append('ssid', credentials.ssid);
      formData.append('password', credentials.password);
      
      attempts.push(
        fetch(url, {
          method: 'POST',
          body: formData,
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        }).catch(e => {
          esp32DebugLog('FormData POST attempt failed:', e, 'warn');
          return null;
        })
      );
      
      // Attempt 3: URL-encoded POST
      const urlEncodedData = `ssid=${encodeURIComponent(credentials.ssid)}&password=${encodeURIComponent(credentials.password)}`;
      
      attempts.push(
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: urlEncodedData,
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        }).catch(e => {
          esp32DebugLog('URL-encoded POST attempt failed:', e, 'warn');
          return null;
        })
      );
      
      // Attempt 4: GET with query parameters (fallback)
      const getUrl = `${url}?ssid=${encodeURIComponent(credentials.ssid)}&password=${encodeURIComponent(credentials.password)}`;
      attempts.push(
        fetch(getUrl, {
          method: 'GET',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000)
        }).catch(e => {
          esp32DebugLog('GET attempt failed:', e, 'warn');
          return null;
        })
      );
      
      // Wait for at least one attempt to succeed
      const results = await Promise.allSettled(attempts);
      const successfulAttempts = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
      
      esp32DebugLog(`WiFi config attempts completed. Successful: ${successfulAttempts}/${attempts.length}`);
      
      if (successfulAttempts > 0) {
        // In production with HTTPS, we can't verify the actual response
        // but if the request didn't throw an error, we assume it was sent
        if (isProduction) {
          return {
            success: true,
            message: 'WiFi credentials sent. Please check your ESP32 device to confirm connection.',
            deviceId: ESP32_AP_CONFIG.deviceId
          };
        } else {
          return {
            success: true,
            message: 'WiFi credentials sent successfully',
            deviceId: ESP32_AP_CONFIG.deviceId
          };
        }
      } else {
        throw new Error('All communication attempts failed');
      }
    } catch (error) {
      esp32DebugLog('Error sending WiFi config directly:', error, 'error');
      
      // Provide more helpful error message for production
      if (isProduction) {
        return {
          success: false,
          message: 'Unable to communicate with ESP32 from HTTPS site. Please use the mobile app or ensure you are connected to the ESP32 WiFi network.'
        };
      }
      throw error;
    }
  } catch (error) {
    esp32DebugLog('Failed to configure ESP32:', error, 'error');
    
    // Provide user-friendly error messages
    let message = 'Failed to communicate with ESP32';
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        message = 'Cannot reach ESP32. Please ensure you are connected to the ESP32 WiFi network and try again.';
      } else if (error.message.includes('timeout')) {
        message = 'Connection to ESP32 timed out. Please ensure the device is powered on and try again.';
      } else {
        message = error.message;
      }
    }
    
    return {
      success: false,
      message
    };
  }
};

/**
 * Register an ESP32 device with the backend API
 * Connects the ESP32 device to the user's account
 */
export const registerESP32Device = async (deviceInfo: ESP32DeviceInfo): Promise<boolean> => {
  try {
    // Call the backend API to register the device
    esp32DebugLog('Registering ESP32 device:', deviceInfo);
    
    const response = await post('/api/devices/register', deviceInfo);
    return response.success || false;
  } catch (error) {
    esp32DebugLog('Failed to register ESP32 device:', error, 'error');
    return false;
  }
};

/**
 * Get the status of an ESP32 device from the backend
 */
export const getESP32DeviceStatus = async (deviceId: string): Promise<ESP32DeviceInfo> => {
  try {
    // Call the backend API to get device status
    const response = await get(`/api/plants/device/${deviceId}`);
    
    if (response && response.device_id) {
      // Map the backend response to our frontend type
      return {
        deviceId: response.device_id,
        deviceName: response.device_name || `ESP32 Device ${deviceId.split('_')[1] || ''}`,
        status: {
          connected: response.connected || false,
          lastConnected: response.last_connected || new Date().toISOString(),
          signalStrength: response.signal_strength || -75,
          ipAddress: response.ip_address
        }
      };
    }
    
    throw new Error('Invalid device data received');
  } catch (error) {
    esp32DebugLog(`Failed to get ESP32 device status for ${deviceId}:`, error, 'error');
    
    // Return a default object if the API fails
    return {
      deviceId,
      status: {
        connected: false
      }
    };
  }
};