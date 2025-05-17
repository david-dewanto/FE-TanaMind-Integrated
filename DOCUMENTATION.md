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

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Requirements:**
- Email must be valid
- Username must be 3-50 characters
- Password must be at least 8 characters

**Response:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "is_verified": false
}
```

**Status Codes:**
- `201 Created`: Account created successfully
- `400 Bad Request`: Email already registered or username taken
- `500 Internal Server Error`: Could not send verification email

**Business Logic:**
- Email addresses and usernames are checked for uniqueness
- Passwords are hashed using bcrypt before storage
- A verification token is generated and stored with the user
- Verification email is sent via Mailgun API

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

**Request Body:**
```json
{
  "username_or_email": "username_or_email@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Status Codes:**
- `200 OK`: Login successful
- `401 Unauthorized`: Invalid credentials or email not verified

**Business Logic:**
- System checks if input is an email or username
- Password is verified against stored hash
- If account is not verified, login is rejected with appropriate message
- JWT access token is generated with 30-day expiration

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

**Request Body:**
```json
{
  "nickname": "My Monstera",
  "plant_name": "Monstera Deliciosa",
  "category": "indoor",
  "species": "Monstera",
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
  "auto_watering_enabled": true
}
```

**Notes:**
- Only `nickname` is required, all other fields are optional
- If `watering_frequency` is provided, `next_watering_date` will be calculated automatically

**Response:**
A complete plant object with all properties including generated IDs and timestamps.

**Status Codes:**
- `201 Created`: Plant created successfully
- `400 Bad Request`: Plant with this nickname already exists for the user
- `401 Unauthorized`: Not authenticated

**Business Logic:**
- Checks for nickname uniqueness per user
- Sets default values for optional fields
- Calculates `next_watering_date` if `watering_frequency` is provided
- Sets `health_status` to "Unknown" initially
- Sets `date_added` to current timestamp

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

**Request Body:**
```json
{
  "plant_id": 1,
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

**Notes:**
- Only `plant_id` is required
- Sensor readings are optional but at least one should be provided
- If `watering_done` is true, the plant's `last_watered` and `next_watering_date` will be updated
- The plant's health status will be updated based on the sensor values compared to thresholds

**Response:**
The created log object with all properties including generated ID and timestamp.

**Status Codes:**
- `201 Created`: Log created successfully
- `404 Not Found`: Plant not found or doesn't belong to the user

**Business Logic:**
- Verifies plant exists and belongs to the authenticated user
- Creates a log entry with the provided values
- Sets `timestamp` to current time if not provided
- Updates plant health status based on sensor readings
- If `watering_done` is true, updates watering schedule
- Always creates a log entry regardless of watering status or value changes

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

**Non-returned fields:**
- `hashed_password`: Bcrypt-hashed password
- `verification_token`: Token for email verification

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
  "last_watered": "2025-05-10T08:00:00.000Z",
  "health_status": "Good",
  
  "next_watering_date": "2025-05-17T08:00:00.000Z",
  "last_fertilized": "2025-05-01T10:00:00.000Z",
  "reminder_enabled": true
}
```

**Required fields:**
- `nickname`: Only required field for creation

**Default values:**
- `health_status`: "Unknown" for new plants
- `date_added`: Current timestamp
- Many thresholds have sensible defaults if not provided

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

## Development Setup

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your configuration:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/plant_db
   SECRET_KEY=your_secret_key_here
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   BASE_URL=http://localhost:8000
   ```
6. Run the development server: `uvicorn app.main:app --reload`

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