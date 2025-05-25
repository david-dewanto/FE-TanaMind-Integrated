import React from 'react';
import { AlertCircle, Smartphone, Wifi, Shield, CheckCircle, ExternalLink, Download } from 'lucide-react';

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
            {/* Option 1: Quick Setup Link */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Wifi className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Option 1: Quick Setup (Easiest)
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Connect to ESP32 WiFi, then click the button below:
                  </p>
                  <div className="flex gap-2 mt-2">
                    <a
                      href="http://192.168.4.1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                    >
                      Open ESP32
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="/esp32-setup.html"
                      download="tanamind-esp32-setup.html"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                    >
                      Download Setup Tool
                      <Download className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: Copy Credentials */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Option 2: Copy Configuration
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    Copy your WiFi credentials and auth token to manually configure:
                  </p>
                  <button
                    onClick={() => {
                      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                      const config = {
                        ssid: prompt('Enter your WiFi network name:'),
                        password: prompt('Enter your WiFi password:'),
                        token: token,
                        server: 'https://automatic-watering-system.web.id'
                      };
                      
                      if (config.ssid && config.password) {
                        const configText = JSON.stringify(config, null, 2);
                        navigator.clipboard.writeText(configText);
                        alert('Configuration copied to clipboard! Paste it in the ESP32 setup page.');
                      }
                    }}
                    className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                  >
                    Generate Config
                  </button>
                </div>
              </div>
            </div>

            {/* Option 3: Mobile Browser */}
            <div className="bg-white rounded-md p-3 border border-amber-100">
              <div className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-gray-900">
                    Option 3: Use Mobile Browser
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    On your phone: Connect to ESP32 WiFi, open any browser, and go to 
                    <code className="bg-gray-100 px-1 rounded">192.168.4.1</code>
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