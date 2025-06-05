import React, { useState } from 'react';
import SplashScreen from './SplashScreen';

const SplashScreenPreview: React.FC = () => {
  const [showSplash, setShowSplash] = useState(false);

  const handleShowSplash = () => {
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Splash Screen Preview</h1>
      <button
        onClick={handleShowSplash}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Show Splash Screen
      </button>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This will show the Lottie splash screen animation:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Mobile: Shows portrait animation (393x852px)</li>
          <li>Desktop: Shows landscape animation (1920x1080px)</li>
          <li>Automatically detects device type</li>
          <li>Falls back to simple animation if Lottie fails</li>
        </ul>
      </div>

      {showSplash && (
        <SplashScreen onAnimationComplete={handleSplashComplete} />
      )}
    </div>
  );
};

export default SplashScreenPreview;