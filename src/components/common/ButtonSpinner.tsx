import React from 'react';

interface ButtonSpinnerProps {
  text?: string;
  className?: string;
}

const ButtonSpinner: React.FC<ButtonSpinnerProps> = ({
  text = "Loading...",
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center w-full ${className}`}>
      <div className="w-4 h-4 border-2 border-t-white border-r-white/40 border-b-white/40 border-l-white/40 rounded-full animate-spin mr-2" />
      {text && <span className="text-white">{text}</span>}
    </div>
  );
};

export default ButtonSpinner;