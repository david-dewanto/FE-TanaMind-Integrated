/**
 * ESP32 Types and Interfaces
 */

export interface ESP32WiFiCredentials {
  ssid: string;
  password: string;
}

export interface ESP32ConnectionResponse {
  success: boolean;
  message: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface ESP32DeviceStatus {
  connected: boolean;
  ipAddress?: string;
  lastConnected?: string;
  signalStrength?: number; // WiFi signal strength in dBm
}

export interface ESP32DeviceInfo {
  deviceId: string;
  deviceName?: string;
  status: ESP32DeviceStatus;
}

export interface ESP32PairingOptions {
  autoConnect: boolean;
  saveCredentials: boolean;
}

export type ESP32PairingStatus = 
  | 'idle'           // Not currently pairing
  | 'scanning'       // Scanning for ESP32 device
  | 'connecting'     // Connecting to ESP32 AP
  | 'configuring'    // Sending WiFi credentials
  | 'verifying'      // Verifying connection
  | 'sending_token'  // Sending authentication token
  | 'success'        // Successfully paired
  | 'error';         // Error occurred during pairing