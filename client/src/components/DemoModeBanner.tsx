import { useEffect, useState } from 'react';

const DemoModeBanner = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(localStorage.getItem('demo_mode') === 'true');
  }, []);

  if (!isDemoMode) return null;

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      🎭 Demo Mode - All data is simulated and will not be sent to WhatsApp
    </div>
  );
};

export default DemoModeBanner;
