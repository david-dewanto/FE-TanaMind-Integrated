/**
 * TanaMind ESP32 Control System
 * - WiFi and Access Point configuration
 * - Web API for frontend integration
 * - Sensor monitoring and automated watering
 * - CORS support for browser access
 */

#include <WiFi.h>
#include <WiFiManager.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <math.h>

#define DHTPIN 13
#define DHTTYPE DHT22
#define SOIL_PIN 36
#define RELAY_PIN 25
#define DEVICE_ID "fern_device_001"

#define SDA_PIN 32
#define SCL_PIN 33
#define FILTER_SIZE 5

DHT dht(DHTPIN, DHTTYPE);
BH1750* lightSensor;
BH1750::Mode lightSensorMode = BH1750::CONTINUOUS_HIGH_RES_MODE; // Store the working mode

WebServer server(80);
String accessToken = "";
String ssid = "", password = "";

// API endpoints from documentation
const char* backend_logs_url = "https://automatic-watering-system.web.id/api/logs";
const char* backend_config_url = "https://automatic-watering-system.web.id/api/plants/with-latest-readings";
const char* backend_plant_url = "https://automatic-watering-system.web.id/api/plants";

int plantId = 1;
float soilMin = 40.0, soilMax = 70.0;
bool autoWatering = true;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 60000;
unsigned long lastConfigFetch = 0;
const unsigned long configInterval = 300000;
unsigned long lastSensorCheck = 0;
const unsigned long sensorCheckInterval = 900000; // Check sensor health every 15 minutes

float luxReadings[FILTER_SIZE];
int luxIndex = 0;

// WiFi connection state
bool wifiConnecting = false;
unsigned long wifiConnectStartTime = 0;
const unsigned long wifiConnectTimeout = 30000; // 30 seconds timeout

// CORS Headers helper function
void addCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  // Include all the headers browsers might send, especially Cache-Control
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cache-Control, Pragma, Origin, Accept, X-Requested-With");
  server.sendHeader("Access-Control-Max-Age", "86400"); // Cache for 24 hours
}

float getSmoothedLux(float newLux) {
  luxReadings[luxIndex] = newLux;
  luxIndex = (luxIndex + 1) % FILTER_SIZE;

  float sum = 0;
  for (int i = 0; i < FILTER_SIZE; i++) {
    sum += luxReadings[i];
  }
  return sum / FILTER_SIZE;
}

void printInstructionsAPMode() {
  Serial.println("==============================================");
  Serial.println("ESP32 Mode: ACCESS POINT (AP) MODE");
  Serial.println("SSID: ESP32_AP_Config");
  Serial.println("IP Address: " + WiFi.softAPIP().toString());
  Serial.println("Please connect your device to this WiFi network.");
  Serial.println("Then send HTTP POST requests to configure:");
  Serial.println(" - WiFi credentials: POST /set_wifi");
  Serial.println("   JSON payload: {\"ssid\":\"yourSSID\", \"password\":\"yourPassword\"}");
  Serial.println(" - Access token: POST /set_token");
  Serial.println("   Form field: token=your_access_token");
  Serial.println(" - Check status: GET /connection_status");
  Serial.println("==============================================");
}

void handleSetToken() {
  // Add CORS headers first
  addCORSHeaders();
  
  // Print all arguments for debugging
  Serial.println("[🔍] Token request received with args:");
  for (int i = 0; i < server.args(); i++) {
    Serial.print("  ");
    Serial.print(server.argName(i));
    Serial.print(": ");
    Serial.println(server.arg(i));
  }
  
  // Handle form data POST and GET query parameter
  if (server.hasArg("token")) {
    accessToken = server.arg("token");
    server.send(200, "text/plain", "✅ Token received");
    Serial.println("[✔] Token received: " + accessToken);
    return;
  }
  
  // Try to parse raw body as JSON
  if (server.hasArg("plain")) {
    String rawBody = server.arg("plain");
    Serial.println("[🔍] Raw body: " + rawBody);
    
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, rawBody);
    
    if (!error && doc.containsKey("token")) {
      accessToken = doc["token"].as<String>();
      server.send(200, "text/plain", "✅ Token received from JSON");
      Serial.println("[✔] Token received from JSON: " + accessToken);
      return;
    }
  }
  
  // Still no token found
  server.send(400, "text/plain", "❌ Token missing - Try sending as form field 'token=' or query parameter '?token='");
  Serial.println("[❌] Token missing in request");
}

void handleWiFiCreds() {
  // Add CORS headers first
  addCORSHeaders();
  
  if (server.method() == HTTP_POST) {
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, server.arg("plain"));
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      Serial.println("[❌] Invalid JSON received in /set_wifi");
      return;
    }
    ssid = doc["ssid"].as<String>();
    password = doc["password"].as<String>();

    server.send(200, "application/json", "{\"status\": \"OK, connecting...\"}");
    Serial.println("[⚙️] Received WiFi credentials:");
    Serial.println("SSID: " + ssid);
    Serial.println("Attempting to connect...");

    // Set WiFi mode to AP+STA to keep the AP active during connection
    WiFi.mode(WIFI_AP_STA);
    
    // Start WiFi connection
    WiFi.begin(ssid.c_str(), password.c_str());
    wifiConnecting = true;
    wifiConnectStartTime = millis();
  } else {
    server.send(405, "text/plain", "Method Not Allowed");
    Serial.println("[❌] Invalid HTTP method on /set_wifi");
  }
}

void handleConnectionStatus() {
  // Add CORS headers
  addCORSHeaders();
  
  DynamicJsonDocument doc(512);
  
  // Basic info always available
  doc["ap_active"] = true;
  doc["device_id"] = DEVICE_ID;
  
  // WiFi connection status
  if (WiFi.status() == WL_CONNECTED) {
    doc["status"] = "connected";
    doc["connected"] = true;
    doc["ip"] = WiFi.localIP().toString();
    doc["ssid"] = WiFi.SSID();
    doc["rssi"] = WiFi.RSSI();
    doc["mac"] = WiFi.macAddress();
  } 
  else if (wifiConnecting) {
    doc["status"] = "connecting";
    doc["connected"] = false;
    doc["ssid"] = ssid;
    unsigned long elapsed = millis() - wifiConnectStartTime;
    doc["connecting_for_ms"] = elapsed;
  }
  else {
    doc["status"] = "ap_only";
    doc["connected"] = false;
  }
  
  doc["has_token"] = accessToken.length() > 0;
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void setupAPForWiFi() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("ESP32_AP_Config");
  Serial.println("[ℹ️] Starting Access Point mode...");
  Serial.println("AP IP address: " + WiFi.softAPIP().toString());

  // Add CORS handling for OPTIONS requests
  server.on("/set_token", HTTP_OPTIONS, []() {
    addCORSHeaders();
    server.send(200, "text/plain", "");
  });
  
  server.on("/set_wifi", HTTP_OPTIONS, []() {
    addCORSHeaders();
    server.send(200, "text/plain", "");
  });
  
  server.on("/connection_status", HTTP_OPTIONS, []() {
    addCORSHeaders();
    server.send(200, "text/plain", "");
  });
  
  // Global handler for OPTIONS
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      addCORSHeaders();
      server.send(200, "text/plain", "");
    } else {
      server.send(404, "text/plain", "Not found");
    }
  });

  // Add your regular handlers with CORS headers
  server.on("/set_token", handleSetToken);
  server.on("/set_wifi", handleWiFiCreds);
  server.on("/connection_status", handleConnectionStatus);
  
  server.begin();
  Serial.println("[ℹ️] HTTP server started");
  printInstructionsAPMode();
}

void scanI2CBus() {
  Serial.println("[🔍] Scanning I2C bus for devices...");
  byte count = 0;
  
  for (byte i = 8; i < 120; i++) {
    Wire.beginTransmission(i);
    byte error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("[✓] I2C device found at address 0x");
      if (i < 16) {
        Serial.print("0");
      }
      Serial.print(i, HEX);
      
      // Known device identifiers
      if (i == 0x23 || i == 0x5C) {
        Serial.println(" (BH1750 Light Sensor)");
      } else {
        Serial.println();
      }
      count++;
    }
  }
  
  if (count == 0) {
    Serial.println("[⚠] No I2C devices found! Check connections.");
  } else {
    Serial.println("[✓] I2C scan complete, found " + String(count) + " device(s)");
  }
}

void setup() {
  Serial.begin(115200); // Higher baud rate for better debugging
  delay(1000); // Give serial time to initialize
  Serial.println("\n\n[ℹ️] TanaMind ESP32 System starting...");
  Serial.println("[ℹ️] Firmware Version: 1.2.0");

  dht.begin();
  analogSetPinAttenuation(SOIL_PIN, ADC_11db);
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(200); // Increased delay for I2C stability
  
  // Scan the I2C bus to see what devices are connected
  scanI2CBus();
  
  // Initialize light sensor with multiple attempts
  lightSensor = new BH1750(0x23); // Default I2C address 0x23
  bool sensorInitialized = false;
  
  // Will use the global lightSensorMode variable
  
  // Try a few times with different modes in case one works better
  for (int attempt = 0; attempt < 3; attempt++) {
    delay(100);
    // Try different modes on each attempt
    switch (attempt) {
      case 0:
        lightSensorMode = BH1750::CONTINUOUS_HIGH_RES_MODE;
        sensorInitialized = lightSensor->begin(lightSensorMode);
        Serial.println("[🔍] Trying BH1750 CONTINUOUS_HIGH_RES_MODE...");
        break;
      case 1:
        lightSensorMode = BH1750::CONTINUOUS_LOW_RES_MODE;
        sensorInitialized = lightSensor->begin(lightSensorMode);
        Serial.println("[🔍] Trying BH1750 CONTINUOUS_LOW_RES_MODE...");
        break;
      case 2:
        // Try with alternate I2C address
        delete lightSensor;
        lightSensor = new BH1750(0x5C); // Alternate I2C address 0x5C
        lightSensorMode = BH1750::CONTINUOUS_HIGH_RES_MODE; // Back to default mode with new address
        sensorInitialized = lightSensor->begin(lightSensorMode);
        Serial.println("[🔍] Trying BH1750 at alternate address 0x5C...");
        break;
    }
    
    if (sensorInitialized) {
      Serial.println("[✔] BH1750 initialized successfully on attempt " + String(attempt + 1));
      break;
    }
  }
  
  if (!sensorInitialized) {
    Serial.println("[❌] BH1750 Initialization failed after multiple attempts.");
    Serial.println("[⚠️] Will use default light values.");
  }

  // Initialize readings array
  for (int i = 0; i < FILTER_SIZE; i++) {
    luxReadings[i] = 0;
  }

  setupAPForWiFi();

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);  // Pompa OFF default
  Serial.println("[ℹ️] Relay pin initialized, pompa OFF");
}

void loop() {
  server.handleClient();

  // Check WiFi connection status
  if (wifiConnecting) {
    unsigned long now = millis();
    
    // If timeout exceeded or connection established, update state
    if (WiFi.status() == WL_CONNECTED || (now - wifiConnectStartTime > wifiConnectTimeout)) {
      wifiConnecting = false;
      
      if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[✅] Connected to WiFi! IP: " + WiFi.localIP().toString());
        Serial.println("AP mode remains active for token configuration.");
      } else {
        Serial.println("\n[❌] Failed to connect to WiFi. Please check credentials and try again.");
        WiFi.disconnect();
      }
    }
    else {
      // Still connecting...
      if ((now - wifiConnectStartTime) % 1000 < 50) {  // Print approx every second
        Serial.print(".");
      }
    }
  }

  // Only proceed with data sending if connected to WiFi and token available
  if (WiFi.status() != WL_CONNECTED) {
    delay(1000); // Wait a bit to avoid busy-waiting if not connected
    return;
  }

  if (accessToken.length() == 0) {
    Serial.println("[⚠️] Waiting for access token. Please POST token to /set_token");
    delay(5000);
    return;
  }

  // Normal operation - connected to WiFi with token
  static unsigned long lastStatusPrint = 0;
  unsigned long now = millis();

  if (now - lastStatusPrint > 30000) { // Status update tiap 30 detik
    Serial.println("[ℹ️] System operational. Reading sensors and sending data...");
    lastStatusPrint = now;
  }

  if (now - lastConfigFetch > configInterval) {
    if (fetchPlantConfig()) {
      Serial.println("[✔] Plant config updated.");
    } else {
      Serial.println("[❌] Failed to fetch plant config.");
    }
    lastConfigFetch = now;
  }
  
  // Periodically check and potentially re-initialize sensors
  if (now - lastSensorCheck > sensorCheckInterval) {
    Serial.println("[ℹ️] Performing periodic sensor health check...");
    
    // Check BH1750 light sensor
    float testLux = lightSensor->readLightLevel();
    if (testLux < 0) {
      // Light sensor needs re-initialization
      Serial.println("[⚠️] Light sensor not responding, re-initializing...");
      
      // Re-initialize the I2C bus and sensor
      Wire.begin(SDA_PIN, SCL_PIN);
      delay(200);
      bool success = lightSensor->begin(lightSensorMode);
      
      if (success) {
        Serial.println("[✔] Light sensor successfully re-initialized");
      } else {
        Serial.println("[❌] Light sensor re-initialization failed");
      }
    } else {
      Serial.println("[✔] Light sensor responding correctly: " + String(testLux) + " lux");
    }
    
    // Check DHT sensor
    float testHumidity = dht.readHumidity();
    float testTemp = dht.readTemperature();
    if (isnan(testHumidity) || isnan(testTemp)) {
      // DHT sensor may be having issues
      Serial.println("[⚠️] DHT sensor returning NaN, re-initializing...");
      dht.begin();
    } else {
      Serial.println("[✔] DHT sensor responding correctly: " + 
        String(testTemp) + "°C, " + String(testHumidity) + "%");
    }
    
    lastSensorCheck = now;
  }

  if (now - lastSendTime > sendInterval) {
    lastSendTime = now;

    // Baca soil moisture dengan penanganan error
    int soilRaw = analogRead(SOIL_PIN);
    if (soilRaw < 0 || soilRaw > 4095) {
      soilRaw = 4950;  // Nilai tinggi agar pompa mati
      Serial.println("[⚠] Soil sensor error, set soilRaw=4950");
    }

    // Baca DHT22 dengan fallback jika error
    float airHumidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    if (isnan(airHumidity)) {
      airHumidity = 0.0;
      Serial.println("[⚠] Air humidity sensor error, set to 0");
    }
    if (isnan(temperature)) {
      temperature = 0.0;
      Serial.println("[⚠] Temperature sensor error, set to 0");
    }

    float soilHumidityPercent = map(soilRaw, 4095, 0, 0, 100);
    soilHumidityPercent = constrain(soilHumidityPercent, 0, 100);

    // Baca cahaya dengan fallback dan recovery attempts
    float rawLux = -1.0;
    
    // Try to read the sensor a few times
    for (int attempt = 0; attempt < 3; attempt++) {
      // Reinitialize the sensor if we've had failures
      if (attempt > 0) {
        Serial.println("[🔧] Attempt " + String(attempt + 1) + " to reinitialize light sensor...");
        Wire.begin(SDA_PIN, SCL_PIN);
        delay(100);
        // Re-begin the sensor with the mode that worked during initialization
        lightSensor->begin(lightSensorMode);
        delay(100);
      }
      
      rawLux = lightSensor->readLightLevel();
      
      // If we got a valid reading, break the retry loop
      if (rawLux > 0) {
        Serial.println("[✔] Valid light sensor reading on attempt " + String(attempt + 1));
        break;
      }
      delay(50);
    }
    
    // If still error, use a more reasonable default than 0
    if (rawLux < 0) {
      // Use time-based approximation for light levels
      long currentHour = (millis() / 3600000) % 24; // Hours since boot, capped at 24
      if (currentHour >= 6 && currentHour <= 18) {
        // Daytime - use moderate light value
        rawLux = 1000.0;
        Serial.println("[⚠] Light sensor error, using daytime default value (1000 lux)");
      } else {
        // Nighttime - use low light value
        rawLux = 100.0;
        Serial.println("[⚠] Light sensor error, using nighttime default value (100 lux)");
      }
    }
    
    float smoothedLux = getSmoothedLux(rawLux);
    float lightPercent = constrain(log10(smoothedLux + 1) / 5.0 * 100.0, 0, 100);

    // Debug output sensor
    Serial.print("Soil Moisture Raw: ");
    Serial.println(soilRaw);
    Serial.print("Soil Humidity %: ");
    Serial.println(soilHumidityPercent);
    Serial.print("Light (Raw): ");
    Serial.print(rawLux);
    Serial.print(" lx, Smoothed: ");
    Serial.print(smoothedLux);
    Serial.println(" lx");
    Serial.print("Light Intensity (%): ");
    Serial.print(lightPercent);
    Serial.println(" %");
    Serial.print("Air Humidity: ");
    Serial.println(airHumidity);
    Serial.print("Temperature: ");
    Serial.println(temperature);

    // Kontrol relay pompa
    if (soilHumidityPercent < soilMin && autoWatering) {
      Serial.println("⚠️ Soil is dry → Pump ON");
      digitalWrite(RELAY_PIN, LOW);
      delay(5000);
      digitalWrite(RELAY_PIN, HIGH);
    } else {
      Serial.println("✅ Soil is wet → Pump OFF");
      digitalWrite(RELAY_PIN, HIGH);
    }

    if (!sendDataToBackend(soilHumidityPercent, airHumidity, temperature, smoothedLux)) {
      Serial.println("[❌] Failed to send sensor data to backend.");
    }

    if (soilHumidityPercent < soilMin && autoWatering) {
      if (!sendWateringLog(soilHumidityPercent, airHumidity, temperature, smoothedLux, 250.0)) {
        Serial.println("[❌] Failed to send watering log to backend.");
      }
    }
  }
}

bool fetchPlantConfig() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[❌] WiFi not connected - cannot fetch config.");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  if (!https.begin(client, backend_config_url)) {
    Serial.println("[❌] Unable to start HTTPS connection for config.");
    return false;
  }
  https.addHeader("Authorization", "Bearer " + accessToken);
  
  // Debug output
  Serial.println("[🔍] Fetching plant config from: " + String(backend_config_url));
  Serial.println("[🔍] Authorization: Bearer " + accessToken.substring(0, 10) + "...");
  
  int code = https.GET();
  String response = https.getString();

  if (code >= 200 && code < 300) {
    // Debug output - truncated if very long
    if (response.length() > 150) {
      Serial.println("[🔍] Response (truncated): " + response.substring(0, 150) + "...");
    } else {
      Serial.println("[🔍] Response: " + response);
    }
    
    DynamicJsonDocument doc(4096);
    auto error = deserializeJson(doc, response);
    if (error) {
      Serial.println("[❌] JSON parse error on config response.");
      Serial.print("[❌] Parse error: ");
      Serial.println(error.c_str());
      https.end();
      return false;
    }

    bool found = false;
    
    // Check if response is an array (should be)
    if (doc.is<JsonArray>()) {
      for (JsonObject p : doc.as<JsonArray>()) {
        if (p.containsKey("device_id") && p["device_id"] == DEVICE_ID) {
          plantId = p["id"];
          soilMin = p["soil_humidity_threshold_min"];
          soilMax = p["soil_humidity_threshold_max"];
          autoWatering = p["auto_watering_enabled"];
          Serial.println("[✅] Found plant config:");
          Serial.printf("  - Plant ID: %d\n", plantId);
          Serial.printf("  - Soil Humidity Range: %.1f%% - %.1f%%\n", soilMin, soilMax);
          Serial.printf("  - Auto Watering: %s\n", autoWatering ? "Enabled" : "Disabled");
          https.end();
          found = true;
          break;
        }
      }
    } else {
      Serial.println("[⚠️] Response is not an array as expected, trying direct access.");
      // Try direct access in case it's a single object
      if (doc.containsKey("device_id") && doc["device_id"] == DEVICE_ID) {
        plantId = doc["id"];
        soilMin = doc["soil_humidity_threshold_min"];
        soilMax = doc["soil_humidity_threshold_max"];
        autoWatering = doc["auto_watering_enabled"];
        Serial.println("[✅] Found plant config as direct object.");
        found = true;
      }
    }
    
    if (!found) {
      // If device not found by ID, try to use the first plant as fallback
      if (doc.is<JsonArray>() && doc.size() > 0) {
        JsonObject firstPlant = doc[0];
        plantId = firstPlant["id"];
        soilMin = firstPlant["soil_humidity_threshold_min"];
        soilMax = firstPlant["soil_humidity_threshold_max"];
        autoWatering = firstPlant["auto_watering_enabled"];
        Serial.println("[⚠️] Device ID not found, using first plant as fallback:");
        Serial.printf("  - Plant ID: %d\n", plantId);
        Serial.printf("  - Soil Humidity Range: %.1f%% - %.1f%%\n", soilMin, soilMax);
        Serial.printf("  - Auto Watering: %s\n", autoWatering ? "Enabled" : "Disabled");
        https.end();
        return true;
      }
      Serial.println("[❌] Device ID not found in config response and no fallback available.");
    } else {
      return true;
    }
  } else {
    Serial.printf("[❌] HTTPS GET failed with code %d\n", code);
    Serial.println("[❌] Response: " + response);
  }

  https.end();
  return false;
}

bool sendDataToBackend(float soilHum, float airHum, float temp, float luminance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[❌] WiFi not connected - cannot send data.");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  if (!https.begin(client, backend_logs_url)) {
    Serial.println("[❌] Unable to start HTTPS connection for sending data.");
    return false;
  }
  https.addHeader("Content-Type", "application/json");
  https.addHeader("Authorization", "Bearer " + accessToken);

  // Debug output for tracking
  Serial.println("[🔍] Sending data to: " + String(backend_logs_url));
  Serial.println("[🔍] Authorization: Bearer " + accessToken.substring(0, 10) + "...");
  
  StaticJsonDocument<512> jsonDoc;
  jsonDoc["plant_id"] = plantId;
  jsonDoc["soil_humidity"] = soilHum;
  jsonDoc["air_humidity"] = airHum;
  jsonDoc["temperature"] = temp;
  jsonDoc["luminance"] = luminance;
  jsonDoc["watering_done"] = false;
  jsonDoc["event_type"] = "sensor_reading"; // Per documentation: should be sensor_reading

  String jsonData;
  serializeJson(jsonDoc, jsonData);
  
  // Debug: print the payload
  Serial.println("[🔍] JSON payload: " + jsonData);
  
  int code = https.POST(jsonData);
  
  // Store response for debugging
  String response = https.getString();
  
  if (code >= 200 && code < 300) {
    Serial.println("[✅] Successfully sent sensor data!");
    https.end();
    return true;
  } else {
    Serial.printf("[❌] Failed sending data, HTTP code: %d\n", code);
    Serial.println("[❌] Response: " + response);
    https.end();
    return false;
  }
}

bool sendWateringLog(float soilHum, float airHum, float temp, float luminance, float amount) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[❌] WiFi not connected - cannot send watering log.");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  // Per documentation: record watering event is a log entry with watering_done=true
  // No need to use separate endpoint, just use the logs endpoint
  if (!https.begin(client, backend_logs_url)) {
    Serial.println("[❌] Unable to start HTTPS connection for watering log.");
    return false;
  }
  https.addHeader("Content-Type", "application/json");
  https.addHeader("Authorization", "Bearer " + accessToken);

  StaticJsonDocument<512> jsonDoc;
  jsonDoc["plant_id"] = plantId;
  jsonDoc["soil_humidity"] = soilHum;
  jsonDoc["air_humidity"] = airHum;
  jsonDoc["temperature"] = temp;
  jsonDoc["luminance"] = luminance;
  jsonDoc["watering_done"] = true;
  jsonDoc["watering_amount"] = amount;
  jsonDoc["event_type"] = "auto_watering";
  jsonDoc["notes"] = "Triggered by soil humidity threshold";

  String jsonData;
  serializeJson(jsonDoc, jsonData);
  int code = https.POST(jsonData);
  
  if (code >= 200 && code < 300) {
    Serial.println("[✅] Successfully sent watering log!");
    https.end();
    
    // Optionally, also call the water endpoint to record a watering event
    // This is a backup mechanism
    String waterUrl = backend_plant_url + String("/") + String(plantId) + String("/water");
    Serial.println("[ℹ️] Also sending to water endpoint: " + waterUrl);
    
    if (https.begin(client, waterUrl)) {
      https.addHeader("Authorization", "Bearer " + accessToken);
      https.addHeader("Content-Type", "application/json");
      
      // For the water endpoint, amount is a query parameter but we'll include in body too
      StaticJsonDocument<128> waterDoc;
      waterDoc["amount"] = amount;
      
      String waterData;
      serializeJson(waterDoc, waterData);
      
      int waterCode = https.POST(waterData);
      https.end();
      
      if (waterCode >= 200 && waterCode < 300) {
        Serial.println("[✅] Successfully recorded watering via water endpoint!");
      } else {
        Serial.printf("[⚠️] Water endpoint call returned code: %d (non-fatal)\n", waterCode);
      }
    }
    
    return true;
  } else {
    Serial.printf("[❌] Failed sending watering log, HTTP code: %d\n", code);
    https.end();
    return false;
  }
}