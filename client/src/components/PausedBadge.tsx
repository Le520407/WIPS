import React from 'react';
import { XCircle, AlertTriangle, PauseCircle } from 'lucide-react';

interface PausedBadgeProps {
  pauseInfo?: any;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const PausedBadge: React.FC<PausedBadgeProps> = ({ 
  pauseInfo, 
  size = 'md', 
  showLabel = true 
}) => {
  if (!pauseInfo) {
    return null;
  }

  const getIconAndColor = () => {
    if (pauseInfo.severity === 'error') {
      return {
        icon: XCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
      };
    } else {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300'
      };
    }
  };

  const { icon: Icon, bgColor, textColor, borderColor } = getIconAndColor();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${bgColor} ${textColor} ${borderColor}
        ${sizeClasses[size]}
      `}
      title={`Status: ${pauseInfo.status} - ${pauseInfo.reason}`}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && (
        <span className="font-medium">
          {pauseInfo.status}
        </span>
      )}
    </div>
  );
};

export default PausedBadge;
