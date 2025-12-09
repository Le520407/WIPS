import React, { useState, useEffect } from 'react';
import api from '../services/api';

const MissedCallBadge: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const response = await api.get('/missed-calls/count');
      setCount(response.data.count);
    } catch (error) {
      console.error('Error fetching missed calls count:', error);
    }
  };

  if (count === 0) return null;

  return (
    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
      {count}
    </span>
  );
};

export default MissedCallBadge;
