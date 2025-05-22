import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  className = '',
  maxCount = 99 
}) => {
  if (count === 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span 
      className={`
        absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold 
        rounded-full h-5 w-5 flex items-center justify-center
        min-w-[1.25rem] px-1
        ${className}
      `}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;