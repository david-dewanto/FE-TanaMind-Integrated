import React from 'react';
import { AlertCircle, Download, Wifi, CheckCircle } from 'lucide-react';
import { generateESP32SetupHTML } from '../../utils/esp32SetupGenerator';

interface ESP32SetupGuideProps {
  isProduction: boolean;
  onClose?: () => void;
}

const ESP32SetupGuide: React.FC<ESP32SetupGuideProps> = ({ isProduction, onClose }) => {
  if (!isProduction) return null;

  const handleDownloadSetupTool = () => {
    // Get the auth token from storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    
    // Generate the HTML with embedded token
    const html = generateESP32SetupHTML(token);
    
    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tanamind-esp32-setup.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-900 mb-2">
            ESP32 Setup Required
          </h4>
          
          <p className="text-sm text-amber-800 mb-3">
            For security reasons, you need to use our offline setup tool to configure your ESP32 device.
          </p>

          {/* Single method: Download setup tool */}
          <div className="bg-white rounded-md p-4 border border-amber-100">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Download Setup Tool
                </h5>
                
                <ol className="text-xs text-gray-600 space-y-2 mb-3">
                  <li className="flex items-start">
                    <span className="font-semibold mr-1">1.</span>
                    Click the button below to download the setup tool
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-1">2.</span>
                    Connect to <strong>ESP32_AP_Config</strong> WiFi network
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-1">3.</span>
                    Open the downloaded HTML file in your browser
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-1">4.</span>
                    Enter your WiFi credentials and click Configure
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-1">5.</span>
                    Close the page and return to TanaMind to add plants
                  </li>
                </ol>
                
                <button
                  onClick={handleDownloadSetupTool}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download ESP32 Setup Tool
                </button>
                
                {/* Benefits */}
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Your authentication token is automatically included</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Works offline - no internet needed during setup</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-600 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No security restrictions - direct ESP32 communication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important note */}
          <div className="mt-3 p-3 bg-amber-100 rounded-md">
            <h5 className="text-xs font-medium text-amber-900 flex items-center gap-1 mb-1">
              <Wifi className="w-3 h-3" />
              Important Notes:
            </h5>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Make sure your WiFi is 2.4GHz (ESP32 doesn't support 5GHz)</li>
              <li>• The ESP32's blue LED will stop blinking when connected</li>
              <li>• After setup, reconnect to your regular WiFi network</li>
              <li>• Add plants in TanaMind to start recording sensor data</li>
            </ul>
          </div>

          {onClose && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ESP32SetupGuide;