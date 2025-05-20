import React, { useState, useEffect } from 'react';
import { Download, X, ExternalLink, Smartphone, Info, Share2, Menu, ArrowRight } from 'lucide-react';

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
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
      
      // Check if device is iOS
      const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
      setIsIOS(isIOSDevice);

      // Check if device is Android
      const isAndroidDevice = /android/i.test(userAgent.toLowerCase());
      setIsAndroid(isAndroidDevice);

      // For mobile devices, show fullscreen prompt if not already shown for this session
      // We'll check sessionStorage instead of localStorage to show it each new session
      if (isMobileDevice && !sessionStorage.getItem('fullscreenPromptShown')) {
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
      sessionStorage.setItem('fullscreenPromptShown', 'true');
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
      // If we don't have the install prompt but the user clicked install,
      // show detailed instructions based on browser
      setShowInstructions(true);
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
    // Store a flag in localStorage to not show the small prompt again for some time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  const handleFullscreenDismiss = () => {
    setShowFullscreenPrompt(false);
    // Mark that we've shown the fullscreen prompt for this session
    // Using sessionStorage means it will appear again in a new session
    sessionStorage.setItem('fullscreenPromptShown', 'true');
  };

  const handleContinueInBrowser = () => {
    setShowFullscreenPrompt(false);
    // Mark that we've shown the fullscreen prompt for this session only
    sessionStorage.setItem('fullscreenPromptShown', 'true');
  };

  const renderIOSInstructions = () => {
    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">iOS Installation Steps:</h3>
        <ol className="list-decimal ml-6 space-y-3 text-blue-700">
          <li className="ml-0">
            <div className="pl-1">
              Tap the Share button
              <Share2 size={16} className="mx-1 inline align-text-bottom text-blue-600" />
              in Safari
            </div>
          </li>
          <li className="ml-0">
            Scroll down and tap <strong>"Add to Home Screen"</strong>
          </li>
          <li className="ml-0">
            Tap <strong>"Add"</strong> in the top right corner
          </li>
          <li className="ml-0">
            TanaMind is now installed on your home screen!
          </li>
        </ol>
        <div className="mt-3 text-xs text-blue-600">
          Note: PWA installation is only supported in Safari on iOS
        </div>
      </div>
    );
  };

  const renderAndroidInstructions = () => {
    return (
      <div className="mt-4 bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-800 mb-2">Android Installation Steps:</h3>
        <ol className="list-decimal ml-6 space-y-3 text-green-700">
          <li className="ml-0">
            <div className="pl-1">
              Tap the menu button 
              <Menu size={16} className="mx-1 inline align-text-bottom text-green-600" /> 
              in Chrome
            </div>
          </li>
          <li className="ml-0">
            Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>
          </li>
          <li className="ml-0">
            Follow the on-screen instructions
          </li>
          <li className="ml-0">
            TanaMind is now installed on your home screen!
          </li>
        </ol>
      </div>
    );
  };

  const renderGeneralInstructions = () => {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Installation Steps:</h3>
        <ol className="list-decimal ml-6 space-y-3 text-gray-700">
          <li className="ml-0">
            <div className="pl-1">
              Look for the install icon
              <Download size={16} className="mx-1 inline align-text-bottom text-gray-600" />
              in your browser's address bar
            </div>
          </li>
          <li className="ml-0">
            Click it and follow the on-screen instructions
          </li>
          <li className="ml-0">
            If you don't see an install icon, check your browser menu
          </li>
        </ol>
      </div>
    );
  };

  // Render the fullscreen mobile install prompt
  if (showFullscreenPrompt && isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <img src="/logo.png" alt="TanaMind Logo" className="w-10 h-10 mr-3 object-contain" />
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
            
            {!showInstructions ? (
              <>
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
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 bg-[#0B9444] hover:bg-[#056526] text-white font-medium rounded-lg flex items-center justify-center"
                  >
                    <Download size={18} className="mr-2" />
                    Install App
                  </button>
                  <button
                    onClick={handleContinueInBrowser}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Continue in Browser
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    How to Install TanaMind
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Follow these steps to add TanaMind to your home screen:
                  </p>
                </div>
                
                {isIOS ? renderIOSInstructions() : null}
                {isAndroid ? renderAndroidInstructions() : null}
                {!isIOS && !isAndroid ? renderGeneralInstructions() : null}
                
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  >
                    <ArrowRight size={16} className="mr-2 rotate-180" />
                    Back
                  </button>
                  <button
                    onClick={handleContinueInBrowser}
                    className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                  >
                    Continue in Browser
                  </button>
                </div>
              </>
            )}
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