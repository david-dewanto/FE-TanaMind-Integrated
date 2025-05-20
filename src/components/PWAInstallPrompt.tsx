import React, { useState, useEffect } from 'react';
import { Download, X, ExternalLink, Smartphone, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // Check if device is iOS
      const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
      setIsIOS(isIOSDevice);

      // For mobile devices, show fullscreen prompt if not already shown
      if (isMobileDevice && !localStorage.getItem('fullscreenPromptShown')) {
        // Delay the fullscreen prompt to avoid interrupting initial app load
        setTimeout(() => {
          setShowFullscreenPrompt(true);
        }, 3000);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Only show the small prompt if we're not showing the fullscreen one
      if (!showFullscreenPrompt) {
        setIsVisible(true);
      }
    };

    // Check if the app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // The app is already installed, don't show any prompts
        setIsVisible(false);
        setShowFullscreenPrompt(false);
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setShowFullscreenPrompt(false);
      localStorage.setItem('fullscreenPromptShown', 'true');
    });
    
    // Run checks
    checkMobile();
    checkIfInstalled();

    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {
        setIsVisible(false);
        setShowFullscreenPrompt(false);
      });
    };
  }, [showFullscreenPrompt]);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      // For iOS devices we need to show manual installation instructions
      if (isIOS) {
        alert('To install this app on your iOS device: tap the Share icon, then "Add to Home Screen"');
        return;
      }
      return;
    }
    
    // Show the native install prompt
    await installPrompt.prompt();
    
    // Wait for the user's choice
    const choiceResult = await installPrompt.userChoice;
    
    // Handle the user's choice
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the stored prompt
    setInstallPrompt(null);
    // Hide our UI
    setIsVisible(false);
    setShowFullscreenPrompt(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store a flag in localStorage to not show the prompt again for some time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  const handleFullscreenDismiss = () => {
    setShowFullscreenPrompt(false);
    // Mark that we've shown the fullscreen prompt
    localStorage.setItem('fullscreenPromptShown', 'true');
  };

  const handleContinueInBrowser = () => {
    setShowFullscreenPrompt(false);
    // Mark that we've shown the fullscreen prompt
    localStorage.setItem('fullscreenPromptShown', 'true');
  };

  // Render the fullscreen mobile install prompt
  if (showFullscreenPrompt && isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <img src="/icons/icon-96x96.png" alt="TanaMind Logo" className="w-12 h-12 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Install TanaMind App</h2>
              </div>
              <button 
                onClick={handleFullscreenDismiss}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Install TanaMind as an app on your device for the best experience:
              </p>
              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <Smartphone className="mr-2 text-[#0B9444] flex-shrink-0 mt-0.5" size={18} />
                  <p>Access even when offline</p>
                </div>
                <div className="flex items-start">
                  <ExternalLink className="mr-2 text-[#0B9444] flex-shrink-0 mt-0.5" size={18} />
                  <p>Launch directly from your home screen</p>
                </div>
                <div className="flex items-start">
                  <Info className="mr-2 text-[#0B9444] flex-shrink-0 mt-0.5" size={18} />
                  <p>Get real-time plant care notifications</p>
                </div>
              </div>
            </div>
            
            {isIOS ? (
              <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">iOS Installation:</p>
                <p className="text-blue-700">
                  Tap the share icon <span className="px-2 py-1 bg-blue-100 rounded">Share</span> at the bottom of your screen, 
                  then select "Add to Home Screen"
                </p>
              </div>
            ) : null}
            
            <div className="flex flex-col gap-3">
              {!isIOS && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 bg-[#0B9444] hover:bg-[#056526] text-white font-medium rounded-lg flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Install App
                </button>
              )}
              <button
                onClick={handleContinueInBrowser}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Continue in Browser
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the small non-intrusive install prompt
  if (isVisible && !showFullscreenPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-lg shadow-lg p-4 z-50 border border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-[#0B9444] p-2 rounded-full mr-3">
              <Download size={20} color="white" />
            </div>
            <h3 className="font-medium text-gray-900">Install TanaMind</h3>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-gray-400 hover:text-gray-500"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          Install TanaMind on your device for quick access and offline functionality.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleDismiss}
            className="text-sm px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="text-sm px-3 py-1.5 bg-[#0B9444] hover:bg-[#056526] text-white rounded-md flex items-center"
          >
            <Download size={16} className="mr-1" />
            Install
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;