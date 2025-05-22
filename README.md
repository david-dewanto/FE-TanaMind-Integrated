# TanaMind - Smart Plant Monitoring Frontend (PWA)

https://tanamind.site

## 🌱 Overview

TanaMind is a smart plant monitoring and watering system that helps users take care of their plants with IoT technology. This repository contains the frontend application built with React, TypeScript, and Tailwind CSS. The application connects to a backend API that manages user authentication, plant data, and sensor readings. TanaMind is now a Progressive Web App (PWA), allowing for offline functionality and installation on devices.

## ✨ Features

- **User Authentication**
  - Registration with email verification
  - Login with JWT-based authentication
  - Password reset functionality

- **Plant Management**
  - Add, edit, and delete plants
  - Categorize plants by location and type
  - Set watering schedules and receive reminders

- **Plant Monitoring**
  - View real-time sensor data (soil humidity, air humidity, temperature, luminance)
  - Track plant health status
  - Record watering events (manual and automatic)

- **Data Visualization**
  - Visual representations of sensor data
  - Historical data in graphs
  - Plant health status indicators

- **AI Analytics** ⭐ NEW
  - AI-powered plant health analysis using Google Gemini
  - Personalized care recommendations based on sensor data
  - Interactive chat with AI plant assistant
  - Historical trend analysis and insights
  - Predictive care suggestions
  - Offline capability for cached recommendations

- **Knowledge Base**
  - Plant care articles and guides
  - Watering and fertilizing tips
  - Troubleshooting common issues

- **Progressive Web App (PWA)**
  - Offline functionality
  - Installable on desktop and mobile
  - Background data synchronization
  - Responsive design for all devices
  - Automatic updates

## 🧰 Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context API
- **Icons**: Lucide React
- **Markdown Rendering**: Marked
- **Build Tool**: Vite
- **Deployment**: Netlify
- **PWA Support**: vite-plugin-pwa & Workbox
- **AI Integration**: Google Gemini API

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn

## 🔧 Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/david-dewanto/FE-TanaMind-Integrated.git
cd FE-TanaMind-Integrated
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env and add your Google Gemini API key:
# VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Build for production
```bash
npm run build
# or
yarn build
```

## 🔌 API Integration

This frontend application connects to the IoT-Enabled Watering System API with endpoints for:

- User authentication and management
- Plant data management
- Sensor logs and readings
- Watering events

The API documentation is available at:
```
https://automatic-watering-system.web.id/docs
```

## 📱 PWA Features

TanaMind is now a Progressive Web App with the following capabilities:

- **Offline Functionality**: Continue using the app without an internet connection
- **Installable**: Add to home screen on mobile devices or install on desktop
- **Data Synchronization**: Changes made offline are synchronized when back online
- **Responsive Design**: Works on all device sizes and orientations
- **Automatic Updates**: Service worker ensures users have the latest version

For more information about PWA implementation, see:
- [PWA-DOCUMENTATION.md](PWA-DOCUMENTATION.md) - Detailed documentation of PWA features
- [PWA-TESTING-PLAN.md](PWA-TESTING-PLAN.md) - Testing guidelines for PWA functionality

## 🤖 AI Analytics Setup

The AI Analytics feature uses Google Gemini API through a secure server-side proxy to provide intelligent plant care recommendations and interactive chat functionality.

### 🔒 Security-First Architecture

The implementation uses a **secure proxy server** to protect the API key:
- ✅ API key stored server-side only (Vercel environment variables)
- ✅ No API key exposure in client code
- ✅ CORS protection and request validation
- ✅ Production-ready security

### Configuration

#### For Development

**Option 1: Use Deployed Proxy (Recommended)**

1. **Deploy to Vercel first** (see Production section below)

2. **Configure local environment**:
   ```bash
   # Create .env file
   echo "VITE_AI_PROXY_URL=https://your-app.vercel.app" > .env
   ```

3. **Run normal development server**:
   ```bash
   npm run dev
   ```

**Option 2: Local Vercel Development**

1. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Generate a new API key

2. **Set up local proxy**:
   ```bash
   # Create local .env file for Vercel functions
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   vercel dev
   ```

#### For Production (Vercel)
1. **Deploy to Vercel**:
   ```bash
   vercel
   ```

2. **Set Environment Variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   # Paste your Gemini API key when prompted
   ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Features Available

- **🧠 Plant Health Analysis**: AI analyzes sensor data and plant history to provide health assessments
- **💡 Personalized Recommendations**: Get specific care advice based on your plant's conditions  
- **💬 Interactive Chat**: Ask the AI assistant questions about plant care
- **📱 Offline Support**: Previously generated recommendations are cached for offline viewing
- **🔒 Secure**: API key never exposed to client-side code

### Usage

- Navigate to **Analytics** page to view AI-powered insights
- Click **"Refresh Analysis"** to generate new recommendations
- Use **"Chat with AI"** for interactive plant care assistance
- Click **"Ask AI"** on individual plant cards for plant-specific chat

### Technical Details

The AI features work through a Vercel serverless function (`/api/ai-chat`) that:
- Receives requests from the frontend
- Validates and sanitizes input
- Calls Gemini API with server-side credentials
- Returns processed responses

### Fallback Behavior

Without the proxy server configured, the Analytics page will show a setup guide. All other app features work normally.

## 📁 Project Structure

```
/
├── public/              # Static assets
│   ├── icons/           # App icons for various sizes
│   ├── manifest.json    # Web App Manifest
│   └── favicon.ico      # Favicon
├── src/
│   ├── api/             # API client and service functions
│   │   ├── ai.ts        # AI Analytics and Gemini API integration
│   │   ├── auth.ts      # Authentication services
│   │   ├── plants.ts    # Plant management services
│   │   └── client.ts    # HTTP client configuration
│   ├── components/      # UI components
│   │   ├── common/      # Shared components (buttons, inputs, etc.)
│   │   ├── Analytics/   # AI Analytics components
│   │   ├── Dashboard/   # Dashboard-specific components
│   │   └── PlantDetails/# Plant details components
│   ├── contexts/        # React context providers
│   │   ├── AIAnalyticsContext.tsx # AI Analytics state management
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── PlantContext.tsx       # Plant data state
│   ├── data/            # Mock data and constants
│   ├── pages/           # Page components
│   │   ├── Analytics.tsx# AI Analytics dashboard
│   │   └── Dashboard.tsx# Main dashboard
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   │   ├── offlineStorage.ts # Offline data management
│   │   └── syncService.ts    # Data synchronization
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── registerSW.ts    # Service Worker registration
├── PWA-DOCUMENTATION.md # PWA features documentation
├── PWA-TESTING-PLAN.md  # Testing plan for PWA functionality
└── README.md            # This file
```

## 🧪 Testing

Run linting checks:
```bash
npm run lint
# or
yarn lint
```

To test PWA features, follow the guidelines in [PWA-TESTING-PLAN.md](PWA-TESTING-PLAN.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or feedback, please contact the project team at:

- Email: team@tanamind.com
- Website: [https://tanamind.site]

---

Built with ❤️ by TanaMind Team