import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import IncomingCallNotification from './IncomingCallNotification';

const NotificationManager = () => {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const callTimeoutRef = useRef<number | null>(null);

  const { connected, error } = useNotifications({
    onIncomingCall: (data) => {
      console.log('📞 Incoming call notification:', data);
      setIncomingCall(data);
    },
    onCallStatusUpdate: (data) => {
      console.log('📊 Call status update:', data);
      
      // Close notification if call ended, rejected, missed, cancelled, or failed
      // We check against the data to close any matching call
      if (data.status === 'ended' || data.status === 'rejected' || data.status === 'missed' || data.status === 'cancelled' || data.status === 'failed') {
        console.log('🔕 Closing incoming call notification due to status:', data.status);
        // Close the notification by checking if it matches
        setIncomingCall((current: any) => {
          if (current && (data.call_id === current.call_id || data.id === current.id)) {
            console.log('✅ Notification closed - call_id matched');
            return null;
          }
          return current;
        });
      }
    },
    onPermissionUpdate: (data) => {
      console.log('🔐 Permission update:', data);
      // You can show a toast notification here
    },
  });

  // Auto-close notification after 60 seconds (fallback in case status update is missed)
  useEffect(() => {
    if (incomingCall) {
      console.log('⏰ Setting auto-close timeout for incoming call notification (60s)');
      
      // Clear any existing timeout
      if (callTimeoutRef.current) {
        window.clearTimeout(callTimeoutRef.current);
      }
      
      // Set new timeout
      callTimeoutRef.current = window.setTimeout(() => {
        console.log('⏰ Auto-closing incoming call notification (timeout)');
        setIncomingCall(null);
      }, 60000); // 60 seconds
    } else {
      // Clear timeout when notification is closed
      if (callTimeoutRef.current) {
        window.clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (callTimeoutRef.current) {
        window.clearTimeout(callTimeoutRef.current);
      }
    };
  }, [incomingCall]);

  return (
    <>
      {/* Connection status indicator (only show if error and not dismissed) */}
      {error && !errorDismissed && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 pr-10 rounded-lg shadow-lg z-50 max-w-md">
          <button
            onClick={() => setErrorDismissed(true)}
            className="absolute top-2 right-2 text-red-700 hover:text-red-900"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm">
            <span className="font-medium">Notification Service:</span> {error}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Real-time notifications are disabled. You can still use all features manually.
          </p>
        </div>
      )}

      {/* Connection status indicator (only in development) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connected
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {connected ? '🟢 Connected' : '⚪ Disconnected'}
          </div>
        </div>
      )}

      {/* Incoming call notification */}
      {incomingCall && (
        <IncomingCallNotification
          callData={incomingCall}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </>
  );
};

export default NotificationManager;
