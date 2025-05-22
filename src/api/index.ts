/**
 * API module exports
 */
export * from './client';
export * as auth from './auth';
export * as plants from './plants';
export * as logs from './logs';
export * as esp32 from './esp32';
export * as notifications from './notifications';

// Re-export ESP32 constants for direct import
import { ESP32_AP_CONFIG, ESP32_DEBUG, toggleESP32Debug, esp32DebugLog } from './esp32';
export { ESP32_AP_CONFIG, ESP32_DEBUG, toggleESP32Debug, esp32DebugLog };