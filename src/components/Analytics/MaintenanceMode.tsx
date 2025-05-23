import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Wrench, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Bell,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import ServerStatusIndicator from './ServerStatusIndicator';
import EnhancedAIIcon from '../common/EnhancedAIIcon';

interface MaintenanceModeProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ onRetry, isRetrying = false }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check if notifications are supported and get permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const features = [
    {
      icon: <Brain size={24} className="text-blue-600" />,
      title: "Smart Plant Analysis",
      description: "AI examines your plant's sensor data and care history",
      status: "maintenance"
    },
    {
      icon: <MessageCircle size={24} className="text-green-600" />,
      title: "AI Chat Assistant",
      description: "Get instant answers to your plant care questions",
      status: "maintenance"
    },
    {
      icon: <TrendingUp size={24} className="text-purple-600" />,
      title: "Predictive Insights",
      description: "Prevent problems before they affect your plants",
      status: "maintenance"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#056526]">AI Analytics</h1>
        <p className="text-gray-600 mt-1">Advanced plant analysis powered by artificial intelligence</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Status Card */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-blue-50 rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
              <div className="relative flex-shrink-0">
                <EnhancedAIIcon 
                  size="xl" 
                  variant="composite" 
                  animate={true}
                  className="shadow-2xl"
                  aria-label="AI System Under Maintenance"
                  role="img"
                />
                {/* Additional glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent animate-ai-pulse" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-orange-100 bg-clip-text">
                  AI Server Maintenance
                </h2>
                <p className="text-orange-100 text-base sm:text-lg leading-relaxed">
                  We're upgrading our AI systems to serve you better
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                  <span className="text-sm text-yellow-200 font-medium">
                    Advanced neural networks coming online soon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Content */}
          <div className="p-8">
            <ServerStatusIndicator 
              onRetry={onRetry}
              isRetrying={isRetrying}
              autoRefresh={true}
              refreshInterval={30}
              className="mb-6"
            />

          </div>
        </div>



      </div>
    </div>
  );
};

export default MaintenanceMode;