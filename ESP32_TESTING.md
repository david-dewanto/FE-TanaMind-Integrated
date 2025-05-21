# ESP32 Integration Testing Guide

This document provides step-by-step instructions for testing the ESP32 integration with the TanaMind web application.

## Prerequisites

1. ESP32 device with the latest `TanaMind_ESP32.ino` code uploaded
2. TanaMind web application running locally or deployed
3. Computer/phone capable of connecting to Wi-Fi networks

## Testing Procedure

### 1. Upload Updated Code to ESP32

First, ensure the ESP32 has the latest code with CORS fixes and improved token handling:

1. Open the `TanaMind_ESP32.ino` file in Arduino IDE
2. Connect the ESP32 to your computer
3. Select the correct board and port in Arduino IDE
4. Click "Upload"
5. Open the Serial Monitor (baud rate: 115200) to view debug messages

### 2. Initial ESP32 Connection Test

1. Power on the ESP32
2. Look for the ESP32's Wi-Fi Access Point (named "TanaMind_Setup")
3. Connect your computer/phone to this network (password: "password")
4. Open a browser and navigate to http://192.168.4.1/
5. You should see a simple HTML page indicating the ESP32 is running

### 3. Test Token Delivery Using Test Tool

1. Navigate to the token_test.html page (either hosted or open the file directly)
2. Ensure you're connected to the ESP32's AP network
3. Click "Test Connection" to verify basic connectivity
4. Enter a test token (e.g., "test_token_123") in the input field
5. Try each method for sending the token:
   - FormData POST
   - URL Params POST
   - Query Param GET
6. Check the Serial Monitor to confirm token reception on the ESP32
7. Successful token delivery should show "✅ Token received" in the console

### 4. Test Wi-Fi Configuration

1. In token_test.html, enter your Wi-Fi credentials
2. Click "Configure Wi-Fi"
3. Monitor the Serial Monitor for connection progress
4. The ESP32 should maintain its AP while connecting to your Wi-Fi
5. Check if the ESP32 prints its new IP address on your network

### 5. End-to-End Testing with TanaMind App

1. Open the TanaMind web application
2. Log in with valid credentials
3. Navigate to the ESP32 pairing section
4. Connect to the ESP32 AP network (if not already connected)
5. Enter your Wi-Fi credentials in the pairing modal
6. Submit the form and monitor the pairing process
7. Check the following:
   - Application shows correct pairing status
   - ESP32 Serial Monitor shows token receipt
   - ESP32 successfully connects to provided Wi-Fi
   - Application detects when ESP32 transitions to station mode

### 6. Troubleshooting Common Issues

If issues occur during testing, check the following:

1. **No ESP32 AP Network**: Reset the ESP32 and check Serial Monitor for startup messages
2. **Connection Failures**: Ensure correct IP address (192.168.4.1 in AP mode)
3. **CORS Errors**: Check browser console for CORS errors, verify ESP32 is sending correct headers
4. **Token Not Received**: Check ESP32 Serial Monitor for debug messages, try different token sending methods
5. **Wi-Fi Connection Failure**: Verify credentials are correct, ensure signal strength is adequate

Use the browser's developer tools (F12) to monitor network requests and any JavaScript errors during the process.

## Expected Results

- ESP32 creates an access point named "TanaMind_Setup"
- ESP32 accepts Wi-Fi credentials and connects to the network
- ESP32 maintains its AP during the transition
- ESP32 properly receives the authentication token
- Web application successfully detects the ESP32's connection status
- ESP32 begins sending sensor data to the backend API

## Report Issues

If you encounter any issues not covered by the troubleshooting section, please document:
1. The step where the issue occurred
2. Any error messages (from console or Serial Monitor)
3. The expected vs. actual behavior