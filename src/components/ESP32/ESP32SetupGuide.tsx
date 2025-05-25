import React from 'react';
import { AlertCircle, Smartphone, Wifi, Shield, CheckCircle, ExternalLink } from 'lucide-react';

interface ESP32SetupGuideProps {
  isProduction: boolean;
  onClose?: () => void;
}

const ESP32SetupGuide: React.FC<ESP32SetupGuideProps> = ({ isProduction, onClose }) => {
  const isLocalNetwork = window.location.hostname.includes('192.168.') || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname.includes('127.0.0.1');

  if (!isProduction) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">
            ESP32 Setup in Production Mode
          </h4>
          
          <p className="text-sm text-amber-800 mb-3">
            Due to browser security restrictions, direct communication with ESP32 devices 
            from HTTPS websites is limited. Here are your options:
          </p>

          <div className="space-y-3">
            {/* Option 1: Mobile App */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Recommended: Use Mobile App
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Download the TanaMind mobile app for seamless ESP32 setup without security restrictions.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Local Network */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Wifi className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Alternative: Local Network Setup
                  </h5>
                  <ol className="text-xs text-gray-600 mt-1 space-y-1">
                    <li>1. Connect your computer to the ESP32 WiFi network</li>
                    <li>2. Access the app locally at <code className="bg-gray-100 px-1 rounded">http://localhost:5173</code></li>
                    <li>3. Complete the setup process</li>
                    <li>4. Switch back to your regular WiFi</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Option 3: Manual Setup */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Advanced: Manual Configuration
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Connect to ESP32 AP and visit <code className="bg-gray-100 px-1 rounded">http://192.168.4.1</code> 
                    directly to configure WiFi settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Why this happens */}
          <div className="mt-4 p-3 bg-amber-100 rounded-md">
            <h5 className="text-xs font-medium text-amber-900 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Why does this happen?
            </h5>
            <p className="text-xs text-amber-800 mt-1">
              Modern browsers block HTTP requests from HTTPS websites for security. 
              Since ESP32 devices use HTTP (not HTTPS), direct communication is restricted 
              when accessing TanaMind from a secure (HTTPS) connection.
            </p>
          </div>

          {onClose && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESP32SetupGuide;