import React from 'react';

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-white shadow-sm rounded-lg px-3 py-1">
        <span className="text-xs text-gray-600 font-medium">
          {formatDate(date)}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;
