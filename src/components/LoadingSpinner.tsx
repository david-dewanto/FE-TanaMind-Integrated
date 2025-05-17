import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 36,
  message = 'Loading...',
  fullPage = false,
}) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <Loader2 size={size} className="text-[#0B9444] animate-spin" />
        {message && <p className="mt-4 text-[#056526] font-medium">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 size={size} className="text-[#0B9444] animate-spin" />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;