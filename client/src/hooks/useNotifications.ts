import { useEffect, useRef, useState, useCallback } from 'react';

interface Notification {
  type: string;
  data: any;
  timestamp: string;
}

interface UseNotificationsOptions {
  onIncomingCall?: (data: any) => void;
  onCallStatusUpdate?: (data: any) => void;
  onPermissionUpdate?: (data: any) => void;
  onNotification?: (notification: Notification) => void;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      // EventSource doesn't support custom headers, so pass token as query parameter
      const url = `${apiUrl}/api/notifications/subscribe?token=${encodeURIComponent(token)}`;
      
      console.log('📡 Connecting to notifications:', url.replace(token, '***'));
      
      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('✅ Connected to notifications');
        setConnected(true);
        setError(null); // Clear any previous errors
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          console.log('📩 Notification received:', notification);

          // Call appropriate handler based on notification type
          switch (notification.type) {
            case 'incoming_call':
              optionsRef.current.onIncomingCall?.(notification.data);
              break;
            case 'call_status_update':
              optionsRef.current.onCallStatusUpdate?.(notification.data);
              break;
            case 'permission_update':
              optionsRef.current.onPermissionUpdate?.(notification.data);
              break;
            case 'connected':
            case 'heartbeat':
              // Ignore these
              break;
            default:
              optionsRef.current.onNotification?.(notification);
          }
        } catch (err) {
          console.error('Error parsing notification:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('❌ Notification connection error:', err);
        setConnected(false);
        
        // Close the connection
        eventSource.close();
        
        // Attempt to reconnect with exponential backoff
        const maxAttempts = 5;
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxAttempts})`);
          
          // Don't show error yet, we're retrying
          setError(null);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error('❌ Max reconnection attempts reached');
          setError('Unable to connect. Notifications disabled.');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      console.error('Error creating EventSource:', err);
      setError('Failed to create connection');
    }
  }, []); // Remove options dependency

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      console.log('📡 Disconnecting from notifications');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []); // Only run once on mount

  return {
    connected,
    error,
    reconnect: connect,
    disconnect,
  };
};
