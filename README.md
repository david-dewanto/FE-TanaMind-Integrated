# TanaMind - Smart Plant Monitoring Frontend

https://tanamind.site

## 🌱 Overview

TanaMind is a smart plant monitoring and watering system that helps users take care of their plants with IoT technology. This repository contains the frontend application built with React, TypeScript, and Tailwind CSS. The application connects to a backend API that manages user authentication, plant data, and sensor readings.

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

- **Knowledge Base**
  - Plant care articles and guides
  - Watering and fertilizing tips
  - Troubleshooting common issues

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

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Build for production
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

## 📁 Project Structure

```
src/
├── api/               # API client and service functions
├── components/        # UI components
│   ├── common/        # Shared components (buttons, inputs, etc.)
│   ├── Dashboard/     # Dashboard-specific components
│   └── PlantDetails/  # Plant details components
├── contexts/          # React context providers
├── data/              # Mock data and constants
├── pages/             # Page components
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## 🧪 Testing

Run linting checks:
```bash
npm run lint
# or
yarn lint
```

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