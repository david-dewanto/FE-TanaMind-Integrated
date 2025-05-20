/**
 * ESP32 Service for communicating with ESP32 devices
 */
import { post } from './client';
import { ESP32WiFiCredentials, ESP32ConnectionResponse, ESP32DeviceInfo } from '../types';

/**
 * Default ESP32 Access Point configuration
 */
const ESP32_AP_CONFIG = {
  defaultSsid: 'ESP32_AP_Config',
  defaultIp: '192.168.4.1',
  defaultPort: 80,
  defaultEndpoint: '/set_wifi'
};

/**
 * Check if the device is connected to the ESP32 Access Point
 * This is a best-effort method - it tries to detect if we're on the ESP32 network
 */
export const isConnectedToESP32AP = async (): Promise<boolean> => {
  try {
    // Create a timeout promise that rejects after 3 seconds
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 3000);
    });
    
    // Try to reach the ESP32 device at its default IP
    const fetchPromise = fetch(`http://${ESP32_AP_CONFIG.defaultIp}`, { 
      method: 'HEAD',
      // Short timeout as we just want to check connectivity
      signal: AbortSignal.timeout(3000)
    });
    
    // Race between the fetch and the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response.ok;
  } catch (error) {
    console.warn('ESP32 AP connectivity check failed:', error);
    return false;
  }
};

/**
 * Configure ESP32 with WiFi credentials
 * @param credentials WiFi credentials (SSID and password)
 * @returns ESP32ConnectionResponse
 */
/**
 * Send authentication token to the ESP32 device
 */
export const sendTokenToESP32 = async (
  token: string,
  deviceIp: string = ESP32_AP_CONFIG.defaultIp
): Promise<ESP32ConnectionResponse> => {
  try {
    // First verify we can reach the ESP32
    const isConnected = await isConnectedToESP32AP();
    if (!isConnected) {
      return {
        success: false,
        message: 'Not connected to ESP32 Access Point. Please connect to the ESP32 WiFi network first.'
      };
    }

    // Send token to ESP32
    const url = `http://${deviceIp}/set_token?token=${encodeURIComponent(token)}`;
    
    // Make direct fetch request to ESP32
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        success: false,
        message: `ESP32 returned error: ${response.status} ${response.statusText}`
      };
    }

    const responseText = await response.text();
    
    return {
      success: true,
      message: responseText || 'Authentication token sent successfully'
    };
  } catch (error) {
    console.error('Failed to send token to ESP32:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send authentication token to ESP32'
    };
  }
};

export const configureESP32WiFi = async (
  credentials: ESP32WiFiCredentials,
  deviceIp: string = ESP32_AP_CONFIG.defaultIp
): Promise<ESP32ConnectionResponse> => {
  try {
    // First verify we can reach the ESP32
    const isConnected = await isConnectedToESP32AP();
    if (!isConnected) {
      return {
        success: false,
        message: 'Not connected to ESP32 Access Point. Please connect to the ESP32 WiFi network first.'
      };
    }

    // Send WiFi credentials to ESP32
    const url = `http://${deviceIp}${ESP32_AP_CONFIG.defaultEndpoint}`;
    
    // Make direct fetch request to ESP32 (don't use the API client as the ESP32 is not our backend)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      // Longer timeout as the ESP32 might take time to connect to WiFi
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return {
        success: false,
        message: `ESP32 returned error: ${response.status} ${response.statusText}`
      };
    }

    const responseText = await response.text();
    
    return {
      success: true,
      message: responseText || 'WiFi credentials sent successfully',
      deviceId: 'fern_device_001', // Use the device ID from the Arduino code
    };
  } catch (error) {
    console.error('Failed to configure ESP32 WiFi:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to communicate with ESP32'
    };
  }
};

/**
 * Register an ESP32 device with the backend API
 * In a real application, this would link the device to the user's account in the backend
 */
export const registerESP32Device = async (deviceInfo: ESP32DeviceInfo): Promise<boolean> => {
  try {
    // This would normally call your backend API to register the device
    // For this example, we're just simulating success
    console.log('Registering ESP32 device:', deviceInfo);
    
    // In a real app, you would use something like:
    // await post('/api/devices/register', deviceInfo);
    
    return true;
  } catch (error) {
    console.error('Failed to register ESP32 device:', error);
    return false;
  }
};

/**
 * Get the status of an ESP32 device
 * In a real application, this would check the connection status with the backend
 */
export const getESP32DeviceStatus = async (deviceId: string): Promise<ESP32DeviceInfo> => {
  try {
    // This would normally call your backend API to get device status
    // For this example, we're just simulating a device
    return {
      deviceId,
      deviceName: `ESP32 Device ${deviceId.split('_')[1] || ''}`,
      status: {
        connected: Math.random() > 0.3, // Randomly simulate connection status for demo
        lastConnected: new Date().toISOString(),
        signalStrength: -Math.floor(Math.random() * 60 + 40), // Random signal strength between -40 and -100 dBm
      }
    };
  } catch (error) {
    console.error(`Failed to get ESP32 device status for ${deviceId}:`, error);
    return {
      deviceId,
      status: {
        connected: false
      }
    };
  }
};