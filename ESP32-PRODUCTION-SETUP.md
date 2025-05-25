# ESP32 Production Setup Guide

## 🚨 Important: HTTPS/HTTP Mixed Content Issue

When accessing TanaMind from a production HTTPS URL (like `https://tanamind.vercel.app`), direct communication with ESP32 devices is restricted due to browser security policies.

### Why This Happens

1. **Mixed Content Blocking**: Modern browsers block HTTP requests from HTTPS pages
2. **CORS Restrictions**: ESP32 devices typically don't support CORS headers
3. **No SSL on ESP32**: ESP32 devices use HTTP (not HTTPS) for their configuration server

### Solutions for Production

#### Option 1: Mobile App (Recommended)
- Use the TanaMind mobile app which doesn't have the same browser restrictions
- Native apps can communicate with local HTTP servers without issues

#### Option 2: Local Development Setup
1. Clone the repository locally
2. Run `npm install` and `npm run dev`
3. Access the app at `http://localhost:5173`
4. Complete ESP32 setup from the local HTTP environment
5. Once configured, the ESP32 will communicate with the backend API directly

#### Option 3: Manual Configuration
1. Connect to the ESP32 WiFi network (ESP32_AP_Config)
2. Open a browser and go to `http://192.168.4.1`
3. Manually enter:
   - WiFi credentials
   - Authentication token (get from browser DevTools localStorage)
   - Backend API URL

#### Option 4: Progressive Web App
- Install TanaMind as a PWA on your device
- Some PWAs have relaxed security restrictions for local network access

### Technical Details

The ESP32 communication uses multiple fallback methods:
1. JSON POST request
2. Form data POST
3. URL-encoded POST
4. GET with query parameters

In production, these requests are sent with `mode: 'no-cors'` which prevents reading responses but allows the request to be sent.

### Code Implementation

The frontend now includes:
- Detection of HTTPS environment
- User-friendly error messages
- Setup guide component for production users
- Multiple communication attempts for better success rate

### For Developers

If you're developing ESP32 features:
1. Always test in both HTTP (local) and HTTPS (production) environments
2. Implement proper error handling for mixed content scenarios
3. Consider implementing a WebSocket proxy server for production ESP32 communication
4. Document any ESP32 communication changes in this file

### Future Improvements

1. **WebSocket Proxy**: Implement a secure WebSocket proxy server
2. **Backend Configuration API**: Allow ESP32 configuration through the backend
3. **QR Code Configuration**: Generate QR codes with WiFi credentials
4. **Bluetooth Configuration**: Use Web Bluetooth API for configuration