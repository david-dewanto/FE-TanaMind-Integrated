import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  linkTo?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-8 w-auto", 
  showText = false, 
  textClassName = "text-[#056526] font-bold text-xl ml-2",
  linkTo
}) => {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <img src={logoImage} alt="TanaMind Logo" className="h-full w-auto" />
      {showText && <span className={textClassName}>TanaMind</span>}
    </div>
  );

  // If linkTo is provided, wrap in Link component, otherwise just render content
  if (linkTo) {
    return (
      <Link to={linkTo} className="cursor-pointer">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;