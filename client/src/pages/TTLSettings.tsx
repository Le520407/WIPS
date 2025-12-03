import { useState } from 'react';
import { Clock, Info, Save, AlertCircle } from 'lucide-react';

interface TTLPreset {
  name: string;
  category: string;
  ttl: number; // seconds
  description: string;
  useCase: string;
}

const TTLSettings = () => {
  const [customTTL, setCustomTTL] = useState({
    hours: 0,
    minutes: 5,
    seconds: 0
  });

  const ttlPresets: TTLPreset[] = [
    {
      name: 'OTP Code',
      category: 'AUTHENTICATION',
      ttl: 5 * 60, // 5 minutes
      description: 'Short-lived verification codes',
      useCase: 'Two-factor authentication'
    },
    {
      name: 'Password Reset',
      category: 'AUTHENTICATION',
      ttl: 15 * 60, // 15 minutes
      description: 'Password reset links',
      useCase: 'Account recovery'
    },
    {
      name: 'Flash Sale',
      category: 'MARKETING',
      ttl: 60 * 60, // 1 hour
      description: 'Time-sensitive offers',
      useCase: 'Limited time promotions'
    },
    {
      name: 'Event Reminder',
      category: 'MARKETING',
      ttl: 24 * 60 * 60, // 1 day
      description: 'Upcoming event notifications',
      useCase: 'Event marketing'
    },
    {
      name: 'Order Update',
      category: 'UTILITY',
      ttl: 7 * 24 * 60 * 60, // 7 days
      description: 'Order status changes',
      useCase: 'E-commerce notifications'
    },
    {
      name: 'General Notice',
      category: 'UTILITY',
      ttl: 30 * 24 * 60 * 60, // 30 days
      description: 'Long-term notifications',
      useCase: 'Account updates'
    }
  ];

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (s