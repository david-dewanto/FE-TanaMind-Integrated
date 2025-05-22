# IoT-Enabled Watering System API Documentation

## Overview

This documentation provides comprehensive details about the IoT-Enabled Watering System API. The API is built using FastAPI and provides endpoints for user authentication, plant management, and sensor log tracking for an automatic plant watering system with IoT integration.

## Table of Contents

- [Base URL](#base-url)
- [Authentication System](#authentication-system)
  - [Token System Overview](#token-system-overview)
  - [Token Blacklisting](#token-blacklisting)
  - [Registration and Email Verification Flow](#registration-and-email-verification-flow)
  - [Authentication Endpoints](#authentication-endpoints)
- [Plant Management](#plant-management)
  - [Plant Health Status Logic](#plant-health-status-logic)
  - [Watering Logic](#watering-logic)
  - [Plant Endpoints](#plant-endpoints)
- [Log Management](#log-management)
  - [Log Types and Event Types](#log-types-and-event-types)
  - [Log Endpoints](#log-endpoints)
- [Notification System](#notification-system)
  - [Notification Types](#notification-types)
  - [Notification Endpoints](#notification-endpoints)
- [Common Error Responses](#common-error-responses)
- [Data Models Reference](#data-models-reference)
- [Frontend Development Guidelines](#frontend-development-guidelines)
- [Development Setup](#development-setup)
- [API Testing](#api-testing)

## Base URL


``
https://automatic-watering-system.web.id
```

API documentation is available at:
```
https://automatic-watering-system.web.id/docs
```

## Authentication System

### Token System Overview

The API uses JWT (JSON Web Token) authentication with the following key features:

- Token algorithm: HS256
- Token lifespan: 30 days
- Token types:
  - **Access tokens**: Standard tokens for API access
  - **Verification tokens**: Single-use tokens for email verification
  - **Password reset tokens**: Single-use tokens for password resets

All protected endpoints require a valid token passed in the HTTP Authorization header:

```
Authorization: Bearer {your_access_token}
```

### Token Blacklisting

The system implements a robust token blacklisting mechanism:

- Tokens are blacklisted when a user logs out
- Blacklisted tokens are stored in a JSON file (`token_blacklist.json`)
- Blacklisted tokens are automatically cleaned up after expiration
- The system prevents token reuse after logout

### Registration and Email Verification Flow

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────────┐     ┌────────────────┐
│  Register   │────►│ Verification     │────►│ User clicks link  │────►│ Account is     │
│  Account    │     │ Email Sent       │     │ in email          │     │ verified       │
└─────────────┘     └──────────────────┘     └───────────────────┘     └────────────────┘
```

1. User registers with email, username, and password
2. System sends a verification email with a token
3. User clicks the verification link with the token
4. System verifies the token and activates the account
5. User can now log in and access protected endpoints

**Important Note About Verification:** 
The email verification process is embedded within the login and register endpoints. Frontend developers do not need to call the `/auth/verify-email` endpoint directly, as the verification link is automatically included in the email sent to users. The verification link will direct users to a pre-built HTML page confirming successful verification.

### Authentication Endpoints

#### Register a new user

```
POST /auth/register
```

Creates a new user account and sends a verification email.

**Request Body Schema:**
```json
{
  "email": "user@example.com",        // Required: Valid email address
  "username": "username",             // Required: 3-50 characters
  "password": "password123"           // Required: Minimum 8 characters
}
```

**Field Requirements:**
- `email` (string, **required**): Must be a valid email format
- `username` (string, **required**): Must be 3-50 characters long, unique across all users
- `password` (string, **required**): Must be at least 8 characters long

**Example Request:**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe2024",
  "password": "mySecurePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe2024",
  "is_verified": false
}
```

**Error Responses:**

**400 Bad Request - Email Already Exists:**
```json
{
  "detail": "Email already registered"
}
```

**400 Bad Request - Username Already Taken:**
```json
{
  "detail": "Username already taken"
}
```

**422 Unprocessable Entity - Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error - Email Service Failed:**
```json
{
  "detail": "Could not send verification email. Please try again later."
}
```

**Status Codes:**
- `201 Created`: Account created successfully, verification email sent
- `400 Bad Request`: Email already registered or username taken
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: Could not send verification email

**Business Logic:**
- Email addresses and usernames are checked for uniqueness before creation
- Passwords are hashed using bcrypt with automatic salt generation
- A verification token (JWT) is generated with 60-minute expiration
- Verification email is sent via Mailgun API with HTML template
- User account is created only if verification email is sent successfully
- Account remains unverified (`is_verified: false`) until email verification

#### Verify Email

```
GET /auth/verify-email?token={verification_token}
```

Verifies a user's email address using the token sent in the verification email.

**Response:**
- HTML page confirming successful verification or showing an error

**Status Codes:**
- `200 OK`: Token is valid (with success or error message in HTML)

**Business Logic:**
- Token is decoded and validated
- User's `is_verified` flag is updated to `true`
- Token becomes invalid after use

**Frontend Implementation Note:**
Frontend developers do not need to implement this endpoint in their application code. This endpoint is automatically accessed when users click the verification link in their email. The system handles the verification process and displays an appropriate HTML response to the user. After successful verification, users should be directed to the login page.

#### Login

```
POST /auth/login
```

Authenticates a user and returns an access token.

**Request Body Schema:**
```json
{
  "username_or_email": "username_or_email@example.com",  // Required: Username or email
  "password": "password123"                              // Required: User's password
}
```

**Field Requirements:**
- `username_or_email` (string, **required**): Either a username or email address
- `password` (string, **required**): The user's password

**Example Requests:**

*Login with Email:*
```json
{
  "username_or_email": "john.doe@example.com",
  "password": "mySecurePassword123"
}
```

*Login with Username:*
```json
{
  "username_or_email": "johndoe2024",
  "password": "mySecurePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MTcwOTY0NjAwMCwidHlwZSI6ImFjY2VzcyJ9.signature",
  "token_type": "bearer"
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "detail": "Incorrect username/email or password",
  "headers": {
    "WWW-Authenticate": "Bearer"
  }
}
```

**401 Unauthorized - Email Not Verified:**
```json
{
  "detail": "Email not verified. Please check your email for verification link."
}
```

**422 Unprocessable Entity - Missing Fields:**
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Login successful, token returned
- `401 Unauthorized`: Invalid credentials or email not verified
- `422 Unprocessable Entity`: Request validation failed

**Business Logic:**
- System first attempts to find user by email, then by username if not found
- Password is verified against stored bcrypt hash
- Account must be verified (`is_verified: true`) to login
- JWT access token is generated with 30-day expiration (43,200 minutes)
- Token includes user email in the `sub` claim and type `access`
- Token algorithm: HS256

#### Logout

```
POST /auth/logout
```

Logs out the current user by blacklisting their token.

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

**Status Codes:**
- `200 OK`: Logout successful
- `401 Unauthorized`: Invalid or expired token

**Business Logic:**
- Current token is added to the blacklist
- Token remains in blacklist until it expires
- System prevents reuse of blacklisted tokens

#### Get Current User Profile

```
GET /auth/me
```

Returns the authenticated user's profile information.

**Response:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "is_verified": true
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

**Business Logic:**
- User information is retrieved from token payload
- Only verified accounts can access this endpoint

#### Forgot Password

```
POST /auth/forgot-password
```

Starts the password reset process by sending a reset link to the user's email.

**Request Body:**
```json
{
  "username_or_email": "username_or_email@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email or username exists, a password reset link has been sent."
}
```

**Status Codes:**
- `200 OK`: Request processed (note: always returns success for security reasons)

**Business Logic:**
- System tries to find user by email or username
- If user exists, generates a password reset token
- Sends reset link to user's email via Mailgun
- Always returns success message (even if user not found) for security

#### Reset Password (API)

```
POST /auth/reset-password
```

Resets a user's password using a valid reset token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

**Status Codes:**
- `200 OK`: Password reset successful
- `400 Bad Request`: Invalid token or password doesn't meet requirements
- `404 Not Found`: User not found

**Business Logic:**
- Token is validated and decoded to identify user
- Password is validated against complexity requirements
- Password is hashed and stored
- Token becomes invalid after use

#### Reset Password Form

```
GET /auth/reset-password?token={reset_token}
```

Serves an HTML form for resetting the password.

**Response:**
- HTML page with password reset form or error message

**Business Logic:**
- Token is validated before showing the form
- Form submits to the form-specific endpoint

#### Reset Password Form Submit

```
POST /auth/reset-password-form
```

Processes the HTML form submission for password reset.

**Form Data:**
- `token`: The reset token
- `password`: The new password

**Response:**
- HTML success or error page

**Business Logic:**
- Uses the same logic as the API endpoint
- Renders HTML response instead of JSON

## Plant Management

### Plant Health Status Logic

The plant's health status is determined by comparing sensor readings to the configured thresholds:

```
Function: update_plant_health_status(plant, readings)

1. Count issues by comparing readings to thresholds:
   - soil_humidity outside [plant.soil_humidity_threshold_min, plant.soil_humidity_threshold_max]
   - air_humidity outside [plant.air_humidity_threshold_min, plant.air_humidity_threshold_max]
   - temperature outside [plant.temperature_threshold_min, plant.temperature_threshold_max]
   - luminance outside [plant.luminance_threshold_min, plant.luminance_threshold_max]

2. Set health_status based on issues count:
   - "Good": No issues (0)
   - "Warning": One issue (1)
   - "Critical": Multiple issues (>1)

3. Special case: If only soil_humidity is low and watering is done, update to "Good"
```

Status descriptions:
- `Good`: All sensor readings are within thresholds
- `Warning`: One sensor reading outside thresholds
- `Critical`: Multiple sensor readings outside thresholds
- `Unknown`: No sensor readings yet

### Watering Logic

```
Function: update_watering_schedule(plant, watering_done)

1. If watering_done is True:
   - Update plant.last_watered to current time
   - Calculate plant.next_watering_date = current_time + plant.watering_frequency days
   - Return True

2. Otherwise:
   - Return False
```

The system tracks:
- `watering_frequency`: How often the plant should be watered (in days)
- `last_watered`: When the plant was last watered
- `next_watering_date`: When the plant should be watered next

The frontend should show:
- Plants due for watering (current date >= next_watering_date)
- Days until next watering for each plant

### Plant Endpoints

#### Create a New Plant

```
POST /api/plants
```

Creates a new plant for the authenticated user.

**Request Body Schema:**
```json
{
  "nickname": "My Monstera",                          // Required: Plant nickname (unique per user)
  "plant_name": "Monstera Deliciosa",                 // Optional: Scientific/common name
  "category": "indoor",                               // Optional: Plant category
  "species": "Monstera",                              // Optional: Plant species
  "age": 365,                                         // Optional: Age in days
  "location": "Living Room",                          // Optional: Physical location
  "description": "My favorite plant",                 // Optional: User notes
  "watering_frequency": 7,                            // Optional: Days between watering
  "sunlight_requirements": "bright indirect",         // Optional: Light requirements
  "fertilizer_schedule": "Once a month during growing season", // Optional: Fertilizer info
  "ideal_temperature_min": 18.0,                      // Optional: Ideal temp range (°C)
  "ideal_temperature_max": 30.0,                      // Optional: Ideal temp range (°C)
  "soil_humidity_threshold_min": 30.0,                // Optional: Default 20.0
  "soil_humidity_threshold_max": 70.0,                // Optional: Default 60.0
  "air_humidity_threshold_min": 50.0,                 // Optional: Default 40.0
  "air_humidity_threshold_max": 80.0,                 // Optional: Default 70.0
  "temperature_threshold_min": 18.0,                  // Optional: Default 18.0
  "temperature_threshold_max": 30.0,                  // Optional: Default 28.0
  "luminance_threshold_min": 1000.0,                  // Optional: Default 500.0
  "luminance_threshold_max": 10000.0,                 // Optional: Default 10000.0
  "device_id": "device123",                           // Optional: IoT device ID
  "auto_watering_enabled": true                       // Optional: Default true
}
```

**Field Requirements:**
- `nickname` (string, **required**): Must be unique for the user, 1-100 characters
- All other fields are **optional** and will use defaults if not provided

**Minimal Request Example:**
```json
{
  "nickname": "My New Plant"
}
```

**Complete Request Example:**
```json
{
  "nickname": "Monstera Deliciosa",
  "plant_name": "Monstera deliciosa",
  "category": "indoor",
  "species": "Araceae",
  "location": "Living Room Window",
  "description": "Large houseplant with split leaves",
  "watering_frequency": 7,
  "sunlight_requirements": "bright indirect light",
  "fertilizer_schedule": "Monthly during growing season",
  "soil_humidity_threshold_min": 35.0,
  "soil_humidity_threshold_max": 65.0,
  "air_humidity_threshold_min": 50.0,
  "air_humidity_threshold_max": 70.0,
  "temperature_threshold_min": 18.0,
  "temperature_threshold_max": 27.0,
  "luminance_threshold_min": 800.0,
  "luminance_threshold_max": 8000.0,
  "device_id": "plant_sensor_001",
  "auto_watering_enabled": true
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 123,
  "nickname": "Monstera Deliciosa",
  "plant_name": "Monstera deliciosa",
  "category": "indoor",
  "species": "Araceae",
  "date_added": "2025-05-22T10:30:00.000Z",
  "age": null,
  "location": "Living Room Window",
  "description": "Large houseplant with split leaves",
  "watering_frequency": 7,
  "sunlight_requirements": "bright indirect light",
  "fertilizer_schedule": "Monthly during growing season",
  "ideal_temperature_min": null,
  "ideal_temperature_max": null,
  "soil_humidity_threshold_min": 35.0,
  "soil_humidity_threshold_max": 65.0,
  "air_humidity_threshold_min": 50.0,
  "air_humidity_threshold_max": 70.0,
  "temperature_threshold_min": 18.0,
  "temperature_threshold_max": 27.0,
  "luminance_threshold_min": 800.0,
  "luminance_threshold_max": 8000.0,
  "device_id": "plant_sensor_001",
  "auto_watering_enabled": true,
  "last_watered": null,
  "health_status": "Unknown",
  "next_watering_date": "2025-05-29T10:30:00.000Z",
  "last_fertilized": null,
  "reminder_enabled": true
}
```

**Error Responses:**

**400 Bad Request - Duplicate Nickname:**
```json
{
  "detail": "A plant with this nickname already exists. Please choose a different nickname."
}
```

**401 Unauthorized - Not Authenticated:**
```json
{
  "detail": "Not authenticated"
}
```

**422 Unprocessable Entity - Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "nickname"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Status Codes:**
- `201 Created`: Plant created successfully
- `400 Bad Request`: Plant with this nickname already exists for the user
- `401 Unauthorized`: Not authenticated
- `422 Unprocessable Entity`: Request validation failed

**Business Logic:**
- Checks for nickname uniqueness per user (case-sensitive)
- Automatically assigns the next available ID number
- Sets default values for optional threshold fields if not provided
- Calculates `next_watering_date` if `watering_frequency` is provided
- Sets `health_status` to "Unknown" initially (updated when sensor data is received)
- Sets `date_added` to current timestamp
- Sets `reminder_enabled` to true by default

#### Get All User Plants

```
GET /api/plants
```

Returns all plants belonging to the authenticated user.

**Response:**
An array of plant objects with all properties.

**Business Logic:**
- Filters plants by the authenticated user's ID
- Returns empty array if user has no plants

#### Get Plants with Latest Readings

```
GET /api/plants/with-latest-readings
```

Returns all plants with their most recent sensor readings.

**Response:**
An array of plant objects with additional properties:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "nickname": "My Monstera",
    "plant_name": "Monstera Deliciosa",
    "category": "indoor",
    "species": "Monstera",
    "date_added": "2025-05-01T10:00:00.000Z",
    "location": "Living Room",
    "description": "My favorite plant",
    "watering_frequency": 7,
    "sunlight_requirements": "bright indirect",
    "fertilizer_schedule": "Once a month during growing season",
    "ideal_temperature_min": 18.0,
    "ideal_temperature_max": 30.0,
    "soil_humidity_threshold_min": 30.0,
    "soil_humidity_threshold_max": 70.0,
    "air_humidity_threshold_min": 50.0,
    "air_humidity_threshold_max": 80.0,
    "temperature_threshold_min": 18.0,
    "temperature_threshold_max": 30.0,
    "luminance_threshold_min": 1000.0,
    "luminance_threshold_max": 15000.0,
    "device_id": "device123",
    "auto_watering_enabled": true,
    "health_status": "Good",
    "next_watering_date": "2025-05-17T08:00:00.000Z",
    "last_watered": "2025-05-10T08:00:00.000Z",
    "latest_soil_humidity": 45.5,
    "latest_air_humidity": 60.2,
    "latest_temperature": 23.5,
    "latest_luminance": 1200.0,
    "last_reading_time": "2025-05-15T14:30:00.000Z"
  }
]
```

**Business Logic:**
- For each plant, finds the most recent log entry
- Extracts sensor values from the log
- Adds these values as additional properties
- Returns null for sensors with no readings

#### Get Plant by ID

```
GET /api/plants/{plant_id}
```

Returns details for a specific plant.

**Path Parameters:**
- `plant_id`: The ID of the plant to retrieve

**Response:**
The complete plant object with all properties.

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Returns detailed plant information

#### Update Plant

```
PUT /api/plants/{plant_id}
```

Updates an existing plant. Only fields provided in the request body will be updated.

**Path Parameters:**
- `plant_id`: The ID of the plant to update

**Request Body:**
Any plant properties you want to update. For example:
```json
{
  "nickname": "Updated Nickname",
  "location": "Bedroom",
  "watering_frequency": 5
}
```

**Response:**
The updated plant object with all properties.

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: New nickname already exists for another plant
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Checks for nickname uniqueness if updating nickname
- Updates only the fields provided in the request
- If `watering_frequency` is updated, recalculates `next_watering_date`

#### Delete Plant

```
DELETE /api/plants/{plant_id}
```

Deletes a plant and all associated logs.

**Path Parameters:**
- `plant_id`: The ID of the plant to delete

**Response:**
```json
{
  "message": "Plant 'Plant Nickname' has been successfully deleted"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Deletes all log entries associated with the plant
- Deletes the plant itself
- Cascade deletes are handled at the database level

#### Get Plant with Latest Readings

```
GET /api/plants/{plant_id}/latest-readings
```

Returns a specific plant with its most recent sensor readings.

**Path Parameters:**
- `plant_id`: The ID of the plant

**Response:**
The plant object with additional sensor reading properties.

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Finds the most recent log entry for the plant
- Adds sensor values from the log as additional properties

#### Record Manual Watering

```
POST /api/plants/{plant_id}/water
```

Records a manual watering event for a plant.

**Path Parameters:**
- `plant_id`: The ID of the plant to water

**Query Parameters:**
- `amount` (optional): The amount of water in ml

**Response:**
The updated plant object with all properties.

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Updates `last_watered` to current timestamp
- Calculates `next_watering_date` based on `watering_frequency`
- Creates a log entry with `watering_done = true` and `event_type = "manual"`
- Sets `health_status` to "Good" if the only issue was low soil humidity

## Log Management

### Log Types and Event Types

Logs can record different types of events:

1. **Sensor readings**: Regular readings from sensors
   - Event type: `sensor_reading`
   - May include any or all sensor values

2. **Watering events**: Records when a plant was watered
   - Event type: `scheduled`, `manual`, or `auto`
   - Contains `watering_done = true` and optionally `watering_amount`

Sensor data includes:
- `soil_humidity`: Percentage (0-100)
- `air_humidity`: Percentage (0-100)
- `temperature`: Celsius
- `luminance`: Lux (light level)

### Log Endpoints

#### Create a Log Entry

```
POST /api/logs
```

Creates a new sensor log entry for a plant.

**Request Body Schema:**
```json
{
  "plant_id": 1,                              // Required: ID of the plant
  "soil_humidity": 45.5,                      // Optional: Soil humidity percentage (0-100)
  "air_humidity": 60.2,                       // Optional: Air humidity percentage (0-100)
  "temperature": 23.5,                        // Optional: Temperature in Celsius
  "luminance": 1200.0,                        // Optional: Light level in lux
  "watering_done": false,                     // Optional: Default false
  "watering_amount": null,                    // Optional: Water amount in ml
  "event_type": "sensor_reading",             // Optional: Event type
  "notes": "Regular sensor reading"           // Optional: Additional notes
}
```

**Field Requirements:**
- `plant_id` (integer, **required**): Must be a valid plant ID owned by the user
- All sensor readings are **optional** and can be null
- `watering_done` (boolean, **optional**): Default false
- `watering_amount` (float, **optional**): Only relevant if watering_done is true
- `event_type` (string, **optional**): "sensor_reading", "manual", "auto", "scheduled"
- `notes` (string, **optional**): Max 255 characters

**Minimal Request Example (Sensor Reading Only):**
```json
{
  "plant_id": 1,
  "soil_humidity": 42.0
}
```

**Complete Sensor Reading Example:**
```json
{
  "plant_id": 1,
  "soil_humidity": 45.5,
  "air_humidity": 60.2,
  "temperature": 23.5,
  "luminance": 1200.0,
  "watering_done": false,
  "event_type": "sensor_reading",
  "notes": "Automatic sensor reading from IoT device"
}
```

**Watering Event Example:**
```json
{
  "plant_id": 1,
  "soil_humidity": 25.0,
  "watering_done": true,
  "watering_amount": 250.0,
  "event_type": "auto",
  "notes": "Auto-watering triggered by low soil humidity"
}
```

**Success Response (201 Created):**
```json
{
  "id": 156,
  "plant_id": 1,
  "timestamp": "2025-05-22T14:30:00.000Z",
  "soil_humidity": 45.5,
  "air_humidity": 60.2,
  "temperature": 23.5,
  "luminance": 1200.0,
  "watering_done": false,
  "watering_amount": null,
  "event_type": "sensor_reading",
  "notes": "Automatic sensor reading from IoT device"
}
```

**Error Responses:**

**404 Not Found - Plant Not Found:**
```json
{
  "detail": "Plant not found or does not belong to authenticated user"
}
```

**401 Unauthorized - Not Authenticated:**
```json
{
  "detail": "Not authenticated"
}
```

**422 Unprocessable Entity - Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "plant_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Status Codes:**
- `201 Created`: Log created successfully
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Plant not found or doesn't belong to the user
- `422 Unprocessable Entity`: Request validation failed

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Creates a log entry with the provided values
- Sets `timestamp` to current UTC time automatically
- Updates plant health status based on sensor readings compared to thresholds:
  - "Good": All readings within thresholds
  - "Warning": One reading outside thresholds
  - "Critical": Multiple readings outside thresholds
- If `watering_done` is true:
  - Updates plant's `last_watered` to current time
  - Recalculates `next_watering_date` based on watering frequency
  - Creates notification if event_type is "auto"
- Checks sensor readings against thresholds and creates notifications for warnings
- Always creates a log entry regardless of whether sensor values changed

#### Get Logs for Plant

```
GET /api/logs/plant/{plant_id}
```

Returns all sensor logs for a specific plant.

**Path Parameters:**
- `plant_id`: The ID of the plant

**Response:**
An array of log objects with all properties, sorted by timestamp (newest first).

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Returns all logs for the plant, ordered by timestamp descending
- Filters out logs where all sensor readings are null
- Includes watering events

#### Get Plant Logs Summary

```
GET /api/logs/plant/{plant_id}/summary
```

Returns aggregated statistics of sensor logs for a plant.

**Path Parameters:**
- `plant_id`: The ID of the plant

**Response:**
```json
{
  "plant_id": 1,
  "nickname": "My Monstera",
  "logs_count": 42,
  "latest_reading": {
    "id": 123,
    "plant_id": 1,
    "timestamp": "2025-05-15T14:30:00.000Z",
    "soil_humidity": 45.5,
    "air_humidity": 60.2,
    "temperature": 23.5,
    "luminance": 1200.0,
    "watering_done": false,
    "watering_amount": null,
    "event_type": "sensor_reading",
    "notes": null
  },
  "average_soil_humidity": 48.3,
  "average_air_humidity": 62.1,
  "average_temperature": 22.7,
  "average_luminance": 1150.0,
  "watering_count": 5,
  "first_log_date": "2025-04-01T10:00:00.000Z",
  "last_log_date": "2025-05-15T14:30:00.000Z"
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Counts total logs for the plant
- Retrieves the most recent log
- Calculates average values for each sensor (excluding null values)
- Counts watering events
- Determines time range of logs

## Common Error Responses

The API uses standard HTTP status codes and provides detailed error messages. Here are the common error responses:

### 400 Bad Request

```json
{
  "detail": "Error message describing the validation error"
}
```

Examples:
- "Email already registered"
- "Username already taken"
- "Plant with this nickname already exists for this user"
- "Password must be at least 8 characters long"

### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

Happens when:
- No token provided
- Token is invalid or expired
- Token is blacklisted (after logout)

The frontend should redirect to the login page in this case.

### 403 Forbidden

```json
{
  "detail": "Account not verified. Please check your email for verification link."
}
```

Happens when:
- User is authenticated but email is not verified

The frontend should prompt the user to check their email and verify their account.

### 404 Not Found

```json
{
  "detail": "Not found"
}
```

Examples:
- "Plant not found"
- "User not found"

### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error message",
      "type": "validation_error"
    }
  ]
}
```

Happens when:
- Request validation fails (invalid data types, missing required fields, etc.)

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

Happens when:
- Unexpected server-side errors occur
- Email service is unavailable

## Notification System

The notification system provides real-time updates about plants that need attention. Notifications are generated for various events related to plant care.

### Notification Types

The system generates notifications for the following events:

1. **Missed Watering** (`missed_watering`):
   - Generated when a plant has passed its scheduled watering date
   - System automatically checks every 6 hours for plants with missed watering dates
   - Contains information about the plant and when it should have been watered

2. **Sensor Warning** (`sensor_warning`):
   - Generated when sensor readings are outside optimal ranges
   - Created whenever new sensor data is recorded with values outside thresholds
   - Contains details about which parameters are outside their optimal ranges
   - Checks soil humidity, air humidity, temperature, and light levels

3. **Auto Watering** (`auto_watering`):
   - Generated when the system automatically waters a plant
   - Created when a log entry with event_type="auto" and watering_done=true is recorded
   - Contains information about the plant and the amount of water used

### Notification Endpoints

#### Get User Notifications

```
GET /api/notifications
```

Returns all notifications for the authenticated user.

**Query Parameters:**
- `skip` (integer, **optional**): Number of notifications to skip for pagination (default: 0)
- `limit` (integer, **optional**): Maximum number of notifications to return (default: 100, max: 1000)
- `unread_only` (boolean, **optional**): If true, returns only unread notifications (default: false)
- `type_filter` (string, **optional**): Filter by notification type

**Valid Type Filter Values:**
- `"missed_watering"`: Plants overdue for watering
- `"sensor_warning"`: Sensor readings outside optimal ranges
- `"auto_watering"`: Automatic watering events

**Example Requests:**

*Get all notifications:*
```
GET /api/notifications
```

*Get only unread notifications:*
```
GET /api/notifications?unread_only=true
```

*Get sensor warnings with pagination:*
```
GET /api/notifications?type_filter=sensor_warning&skip=0&limit=20
```

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "plant_id": 2,
    "notification_type": "missed_watering",
    "title": "Watering Needed: My Monstera",
    "message": "Your plant 'My Monstera' is past due for watering. It should have been watered on 2025-05-15.",
    "is_read": false,
    "created_at": "2025-05-17T10:30:00.000Z",
    "plant_nickname": "My Monstera"
  },
  {
    "id": 2,
    "user_id": 1,
    "plant_id": 3,
    "notification_type": "sensor_warning",
    "title": "Attention Needed: Snake Plant",
    "message": "Your plant 'Snake Plant' has the following issues: Soil humidity is too low (15% < 20%). Temperature is too high (32°C > 30°C).",
    "is_read": true,
    "created_at": "2025-05-16T14:45:00.000Z",
    "plant_nickname": "Snake Plant"
  },
  {
    "id": 3,
    "user_id": 1,
    "plant_id": 1,
    "notification_type": "auto_watering",
    "title": "Auto-Watering: Philodendron",
    "message": "Your plant 'Philodendron' has been automatically watered with 200ml of water.",
    "is_read": false,
    "created_at": "2025-05-16T09:15:00.000Z",
    "plant_nickname": "Philodendron"
  }
]
```

**Empty Response (No Notifications):**
```json
[]
```

**Error Responses:**

**401 Unauthorized - Not Authenticated:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden - Account Not Verified:**
```json
{
  "detail": "Account not verified. Please check your email for verification link."
}
```

**Status Codes:**
- `200 OK`: Success (may return empty array)
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

**Response Field Descriptions:**
- `id`: Unique notification identifier
- `user_id`: ID of the user who owns the notification
- `plant_id`: ID of the related plant (null for general notifications)
- `notification_type`: Type of notification (see valid values above)
- `title`: Short notification title
- `message`: Detailed notification message
- `is_read`: Whether the user has marked this notification as read
- `created_at`: ISO 8601 timestamp when notification was created
- `plant_nickname`: Name of the related plant (added dynamically, not stored in DB)

#### Update Notification

```
PUT /api/notifications/{notification_id}
```

Updates a notification's status (mark as read/unread).

**Path Parameters:**
- `notification_id`: The ID of the notification to update

**Request Body:**
```json
{
  "is_read": true
}
```

**Response:**
The updated notification object with all properties.

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Notification not found or doesn't belong to the user
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

#### Delete Notification

```
DELETE /api/notifications/{notification_id}
```

Deletes a specific notification.

**Path Parameters:**
- `notification_id`: The ID of the notification to delete

**Response:**
No content on success

**Status Codes:**
- `204 No Content`: Success
- `404 Not Found`: Notification not found or doesn't belong to the user
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

#### Delete All Notifications

```
DELETE /api/notifications
```

Deletes all notifications for the current user, with option to delete only read notifications.

**Query Parameters:**
- `read_only` (optional): If set to true, deletes only read notifications

**Response:**
No content on success

**Status Codes:**
- `204 No Content`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

#### Mark All Notifications as Read

```
PUT /api/mark-all-read
```

Marks all unread notifications as read for the current user.

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Account not verified

## Data Models Reference

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_verified": true
}
```

**Relationships:**
- One-to-many with Plants
- One-to-many with Notifications

**Non-returned fields:**
- `hashed_password`: Bcrypt-hashed password
- `verification_token`: Token for email verification

### Notification

```json
{
  "id": 1,
  "user_id": 1,
  "plant_id": 2,
  "notification_type": "missed_watering",
  "title": "Watering Needed: My Monstera",
  "message": "Your plant 'My Monstera' is past due for watering. It should have been watered on 2025-05-15.",
  "is_read": false,
  "created_at": "2025-05-17T10:30:00.000Z",
  "plant_nickname": "My Monstera"
}
```

**Relationships:**
- Many-to-one with User
- Many-to-one with Plant (optional)

**Fields:**
- `notification_type`: Type of notification ("missed_watering", "sensor_warning", "auto_watering")
- `is_read`: Whether the notification has been read by the user
- `plant_nickname`: Virtual field added when retrieving notifications (not stored in DB)

### Plant

```json
{
  "id": 1,
  "user_id": 1,
  
  "nickname": "My Monstera",
  "plant_name": "Monstera Deliciosa",
  "category": "indoor",
  "species": "Monstera",
  "date_added": "2025-05-01T10:00:00.000Z",
  "age": 30,
  "location": "Living Room",
  "description": "My favorite plant",
  
  "watering_frequency": 7,
  "sunlight_requirements": "bright indirect",
  "fertilizer_schedule": "Once a month during growing season",
  "ideal_temperature_min": 18.0,
  "ideal_temperature_max": 30.0,
  
  "soil_humidity_threshold_min": 20.0,
  "soil_humidity_threshold_max": 60.0,
  "air_humidity_threshold_min": 40.0,
  "air_humidity_threshold_max": 70.0,
  "temperature_threshold_min": 18.0,
  "temperature_threshold_max": 28.0,
  "luminance_threshold_min": 500.0,
  "luminance_threshold_max": 10000.0,
  
  "device_id": "device123",
  "auto_watering_enabled": true,
  "last_watered": "2025-05-10T08:00:00.000Z",
  "health_status": "Good",
  
  "next_watering_date": "2025-05-17T08:00:00.000Z",
  "last_fertilized": "2025-05-01T10:00:00.000Z",
  "reminder_enabled": true
}
```

**Field Types and Constraints:**
- `id` (integer): Auto-generated unique identifier
- `user_id` (integer): Foreign key to users table
- `nickname` (string, **required**): 1-100 characters, unique per user
- `plant_name` (string, optional): 1-100 characters
- `category` (string, optional): 1-50 characters
- `species` (string, optional): 1-100 characters
- `date_added` (datetime): Auto-set to current UTC time
- `age` (integer, optional): Age in days, can be null
- `location` (string, optional): 1-100 characters
- `description` (text, optional): Unlimited length
- `watering_frequency` (integer, optional): Days between watering
- `sunlight_requirements` (string, optional): 1-50 characters
- `fertilizer_schedule` (string, optional): 1-100 characters
- `ideal_temperature_min/max` (float, optional): Celsius
- All threshold fields (float): Sensor monitoring ranges
- `device_id` (string, optional): 1-50 characters
- `auto_watering_enabled` (boolean): Default true
- `last_watered` (datetime, optional): Can be null
- `health_status` (string): "Unknown", "Good", "Warning", "Critical"
- `next_watering_date` (datetime, optional): Auto-calculated if frequency set
- `last_fertilized` (datetime, optional): Can be null
- `reminder_enabled` (boolean): Default true

**Default Values (Applied if Not Provided):**
- `soil_humidity_threshold_min`: 20.0
- `soil_humidity_threshold_max`: 60.0
- `air_humidity_threshold_min`: 40.0
- `air_humidity_threshold_max`: 70.0
- `temperature_threshold_min`: 18.0
- `temperature_threshold_max`: 28.0
- `luminance_threshold_min`: 500.0
- `luminance_threshold_max`: 10000.0
- `auto_watering_enabled`: true
- `health_status`: "Unknown"
- `reminder_enabled`: true
- `date_added`: Current UTC timestamp

**Business Rules:**
- `nickname` must be unique per user (case-sensitive)
- If `watering_frequency` is provided, `next_watering_date` is auto-calculated
- `health_status` is automatically updated based on sensor readings
- Threshold values are used for health status calculations and notifications

**Relationships:**
- Many-to-one with User (plants.user_id → users.id)
- One-to-many with Logs (plant.id → logs.plant_id)
- One-to-many with Notifications (plant.id → notifications.plant_id)

### Log

```json
{
  "id": 1,
  "plant_id": 1,
  "timestamp": "2025-05-15T14:30:00.000Z",
  
  "soil_humidity": 45.5,
  "air_humidity": 60.2,
  "temperature": 23.5,
  "luminance": 1200.0,
  
  "watering_done": false,
  "watering_amount": null,
  "event_type": "sensor_reading",
  "notes": "Regular sensor reading"
}
```

**Required fields:**
- `plant_id`: Only required field for creation

**Calculated fields:**
- `timestamp`: Defaults to current time if not provided

### Plant with Latest Readings

```json
{
  "id": 1,
  "user_id": 1,
  "nickname": "My Monstera",
  "plant_name": "Monstera Deliciosa",
  "category": "indoor",
  "species": "Monstera",
  "date_added": "2025-05-01T10:00:00.000Z",
  "location": "Living Room",
  "description": "My favorite plant",
  "watering_frequency": 7,
  "sunlight_requirements": "bright indirect",
  "fertilizer_schedule": "Once a month during growing season",
  "ideal_temperature_min": 18.0,
  "ideal_temperature_max": 30.0,
  "soil_humidity_threshold_min": 30.0,
  "soil_humidity_threshold_max": 70.0,
  "air_humidity_threshold_min": 50.0,
  "air_humidity_threshold_max": 80.0,
  "temperature_threshold_min": 18.0,
  "temperature_threshold_max": 30.0,
  "luminance_threshold_min": 1000.0,
  "luminance_threshold_max": 15000.0,
  "device_id": "device123",
  "auto_watering_enabled": true,
  "health_status": "Good",
  "next_watering_date": "2025-05-17T08:00:00.000Z",
  "last_watered": "2025-05-10T08:00:00.000Z",
  "latest_soil_humidity": 45.5,
  "latest_air_humidity": 60.2,
  "latest_temperature": 23.5,
  "latest_luminance": 1200.0,
  "last_reading_time": "2025-05-15T14:30:00.000Z"
}
```

**Special merged type:**
- Combines plant data with latest sensor readings
- Useful for dashboard displays
- `last_reading_time` shows when readings were taken

## Frontend Development Guidelines

### Notification Integration

1. **Notification Center:**
   - Use the `/api/notifications` endpoint to retrieve user notifications
   - Implement a notification dropdown or dedicated page
   - Show unread counts with badges in the UI
   - Allow marking notifications as read with one-click
   - Provide filters for different notification types
   - Display relative timestamps (e.g., "2 hours ago")

2. **Real-time Updates:**
   - Poll for new notifications periodically (e.g., every 5 minutes)
   - Highlight new notifications to draw attention
   - Consider push notifications for mobile applications

3. **Notification Management:**
   - Add options to clear all notifications or only read ones
   - Provide direct links from notifications to relevant plants
   - Implement mark all as read functionality for convenience

4. **Example Implementation:**
   ```javascript
   // Example notification polling function
   function pollNotifications(interval = 300000) { // 5 minutes
     return setInterval(async () => {
       try {
         const response = await axios.get('/api/notifications?unread_only=true');
         updateNotificationBadge(response.data.length);
         updateNotificationList(response.data);
       } catch (error) {
         console.error('Error fetching notifications:', error);
       }
     }, interval);
   }
   ```

### Authentication and Session Management

1. **Token Storage:**
   - Store the JWT token in localStorage or a secure cookie
   - Include it in all API requests as an Authorization header
   - Implement an interceptor to add the token to all requests

2. **Token Refreshing:**
   - The system does not use refresh tokens (access tokens are valid for 30 days)
   - When a token expires, redirect to login

3. **Authentication Flow Integration:**
   - After registration, show a message to check email for verification
   - The verification link in the email will handle verification automatically through pre-built HTML pages
   - Instruct users to return to the application and login after they see the verification success page
   - After login, store token and redirect to dashboard
   - Add a logout button that calls the logout endpoint before clearing token

4. **Error Handling:**
   ```javascript
   // Example axios interceptor for handling auth errors
   axios.interceptors.response.use(
     response => response,
     error => {
       if (error.response?.status === 401) {
         // Clear token and redirect to login
         localStorage.removeItem('token');
         window.location.href = '/login';
       }
       if (error.response?.status === 403) {
         // Show verification reminder
         notification.warning('Please verify your email to access this feature');
       }
       return Promise.reject(error);
     }
   );
   ```

### Plant Management Integration

1. **Dashboard:**
   - Use the `/api/plants/with-latest-readings` endpoint for the main dashboard
   - Group plants by health status (Critical, Warning, Good)
   - Highlight plants that need watering (current date >= next_watering_date)
   - Display sensor data with visual indicators for values outside thresholds
   - Show notification count with badge (especially unread notifications)

2. **Plant Details:**
   - Use both `/api/plants/{plant_id}` and `/api/plants/{plant_id}/latest-readings`
   - Show historical data with the logs endpoint
   - Use the summary endpoint for statistics and charts
   - Implement watering button that calls the watering endpoint

3. **Health Status Visualization:**
   ```javascript
   function getHealthStatusColor(status) {
     switch (status) {
       case 'Good': return 'green';
       case 'Warning': return 'orange';
       case 'Critical': return 'red';
       default: return 'gray'; // Unknown
     }
   }

   function getHealthStatusIcon(status) {
     switch (status) {
       case 'Good': return '✓';
       case 'Warning': return '⚠️';
       case 'Critical': return '⛔';
       default: return '?'; // Unknown
     }
   }
   ```

4. **Sensor Data Visualization:**
   - Color-code values based on threshold comparisons
   - Implement gauges or meters for current readings
   - Plot time-series charts for historical data
   - Show recommended ranges based on thresholds

5. **Watering Schedule:**
   ```javascript
   function getDaysUntilWatering(nextWateringDate) {
     const today = new Date();
     const next = new Date(nextWateringDate);
     const diffTime = next - today;
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     return diffDays;
   }

   function getWateringStatus(nextWateringDate) {
     const days = getDaysUntilWatering(nextWateringDate);
     if (days < 0) return 'Overdue';
     if (days === 0) return 'Today';
     if (days === 1) return 'Tomorrow';
     return `In ${days} days`;
   }
   ```

### Real-time Updates and Polling

For applications requiring near real-time updates:

```javascript
// Example polling function for latest readings
function pollLatestReadings(plantId, interval = 60000) {
  setInterval(async () => {
    try {
      const response = await axios.get(`/api/plants/${plantId}/latest-readings`);
      updatePlantData(response.data);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, interval);
}
```

For a more efficient approach, implement a pooling strategy:

```javascript
// Poll all plants with latest readings every 5 minutes
function pollAllPlantsWithReadings() {
  return setInterval(async () => {
    try {
      const response = await axios.get('/api/plants/with-latest-readings');
      updateDashboard(response.data);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5 * 60 * 1000);
}
```

### Mobile Responsiveness

Tips for mobile views:

1. Implement smaller, card-based views for the plant list on mobile
2. Use expandable/collapsible sections for detailed plant information
3. Ensure buttons and interactive elements are at least 44x44 pixels for touch targets
4. Optimize charts and gauges for smaller screens
5. Consider a bottom navigation bar for mobile vs. sidebar for desktop

### Error Handling

```javascript
// Example function for API error handling
function handleApiError(error, defaultMessage = 'An error occurred') {
  let message = defaultMessage;
  
  if (error.response) {
    // Server responded with a non-2xx status
    const status = error.response.status;
    const detail = error.response.data.detail;
    
    if (Array.isArray(detail)) {
      // Validation errors (422)
      message = detail.map(err => `${err.loc.slice(1).join('.')}: ${err.msg}`).join(', ');
    } else if (typeof detail === 'string') {
      // Simple error message
      message = detail;
    }
    
    // Add status to message for debugging
    console.error(`API Error ${status}: ${message}`);
  } else if (error.request) {
    // Request was made but no response received
    message = 'No response from server. Please check your internet connection.';
    console.error('Network Error:', error.request);
  } else {
    // Error setting up the request
    console.error('Request Error:', error.message);
  }
  
  // Display to user (use your UI framework's notification system)
  showNotification('error', message);
  
  return message;
}
```

### Date and Time Handling

```javascript
// Format dates for display
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString();
}

// Format dates with time
function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString();
}

// Format relative time
function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  
  return formatDate(isoString);
}
```

## System Features

### Background Tasks

The system includes automated background tasks that run continuously:

#### Missed Watering Detection
- **Frequency**: Every 6 hours
- **Purpose**: Checks all plants with `reminder_enabled: true` for overdue watering
- **Logic**: Creates "missed_watering" notifications for plants where `next_watering_date` is more than 1 day in the past
- **Implementation**: Threaded background task started on application startup

#### Token Blacklist Cleanup
- **Frequency**: Every hour
- **Purpose**: Removes expired tokens from the blacklist file
- **Logic**: Compares token expiration timestamps with current time
- **Storage**: File-based storage in `token_blacklist.json`

### Security Features

#### Authentication & Authorization
- **JWT Tokens**: HS256 algorithm with 30-day expiration
- **Token Blacklisting**: Prevents token reuse after logout
- **Email Verification**: Required for account activation
- **Password Security**: Bcrypt hashing with automatic salt generation

#### Data Protection
- **User Isolation**: All endpoints filter data by authenticated user
- **Input Validation**: Pydantic schemas validate all request data
- **CORS Policy**: Configured for specific frontend domains
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries

#### Environment Configuration
- **Secret Management**: Environment variables for sensitive data
- **Database Security**: Connection string validation and SSL support
- **Email Security**: Mailgun API integration with domain verification

### Performance Features

#### Database Optimization
- **Indexing**: Primary keys and foreign keys automatically indexed
- **Connection Pooling**: SQLAlchemy session management
- **Cascade Deletes**: Automatic cleanup of related records

#### API Performance
- **Pagination**: Built-in pagination for large datasets
- **Filtering**: Query parameters for efficient data retrieval
- **Caching**: Future consideration for frequent queries

## Development Setup

### Prerequisites
- Python 3.12.3 (see `runtime.txt`)
- PostgreSQL database
- Mailgun account for email services

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IoT-Enabled-Watering-System_Backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:password@localhost:5432/plant_db
   
   # Security
   SECRET_KEY=your_secret_key_here
   
   # Email Service
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   
   # Application
   BASE_URL=http://localhost:8000
   ```

5. **Database setup**
   ```bash
   # The application will automatically create tables on startup
   # Make sure PostgreSQL is running and the database exists
   ```

6. **Run development server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Production Deployment

The application is configured for deployment on platforms like Heroku:

- **Procfile**: Defines web process with Gunicorn + Uvicorn workers
- **Runtime**: Python 3.12.3 specified
- **Database**: Automatic PostgreSQL URL handling
- **Static files**: None required (API only)

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Yes | JWT signing key | `your-secret-key-here` |
| `MAILGUN_API_KEY` | Yes | Mailgun API key | `key-1234567890abcdef` |
| `MAILGUN_DOMAIN` | Yes | Mailgun domain | `mail.yourdomain.com` |
| `BASE_URL` | Yes | Application base URL | `https://yourdomain.com` |

## API Testing

Swagger UI documentation is available at:
```
https://automatic-watering-system.web.id/docs
```

This provides an interactive interface to test all API endpoints directly.

For developing against the API, you can use:
- The Swagger UI for quick tests
- Postman or Insomnia for more complex testing
- The built-in `/docs` endpoint for reference

---

**Note for Developers:** If you encounter any issues or need clarification, please contact the development team at developer@automatic-watering-system.web.id.