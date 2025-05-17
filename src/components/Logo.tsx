import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`text-[#39B54A] ${className}`}>
      <Leaf size={32} strokeWidth={2} />
    </div>
  );
};

export default Logo;