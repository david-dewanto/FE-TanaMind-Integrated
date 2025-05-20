import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show our custom install UI
      setIsVisible(true);
    };

    // Check if the app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // The app is already installed, don't show the prompt
        setIsVisible(false);
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsVisible(false));
    
    // Check if already installed
    checkIfInstalled();

    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsVisible(false));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
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
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store a flag in localStorage to not show the prompt again for some time
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
  };

  // Don't render anything if the prompt is not visible
  if (!isVisible) return null;

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
};

export default PWAInstallPrompt;