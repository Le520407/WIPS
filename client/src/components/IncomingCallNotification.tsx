import { useState, useEffect } from 'react';
import { Phone, PhoneOff, X } from 'lucide-react';
import api from '../services/api';
import { WhatsAppCallInterface } from './WhatsAppCallInterface';

interface IncomingCallNotificationProps {
  callData: {
    id: number;
    call_id: string;
    from_number: string;
    to_number: string;
    status: string;
    timestamp: string;
    sdp?: string; // SDP offer from WhatsApp webhook
  };
  onClose: () => void;
}

const IncomingCallNotification = ({ callData, onClose }: IncomingCallNotificationProps) => {
  const [responding, setResponding] = useState(false);
  const [ringingDuration, setRingingDuration] = useState(0);
  const [showCallInterface, setShowCallInterface] = useState(false);

  useEffect(() => {
    // Play ringtone (you can add actual audio here)
    console.log('🔔 Incoming call from:', callData.from_number);

    // Count ringing duration
    const interval = setInterval(() => {
      setRingingDuration((prev) => {
        const newDuration = prev + 1;
        // Auto-close after 60 seconds of ringing
        if (newDuration >= 60) {
          console.log('⏰ Call timed out after 60 seconds');
          onClose();
        }
        return newDuration;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [callData, onClose]);

  const handleAnswer = () => {
    // Show WebRTC call interface
    console.log('✅ Answering call with WebRTC:', callData.call_id);
    setShowCallInterface(true);
  };

  const handleReject = async () => {
    setResponding(true);
    try {
      // Reject the call via WhatsApp API
      await api.post('/calls/reject', {
        call_id: callData.call_id,
      });
      
      console.log('❌ Call rejected');
      onClose();
    } catch (error) {
      console.error('Failed to reject call:', error);
      setResponding(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show call interface if answered
  if (showCallInterface) {
    return (
      <WhatsAppCallInterface
        callId={callData.call_id}
        callerNumber={callData.from_number}
        remoteSdp={callData.sdp}
        onCallEnd={() => {
          setShowCallInterface(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-green-500 p-6 w-96">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Call info */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-10 h-10 text-green-600 animate-pulse" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Incoming Call</h3>
          <p className="text-lg text-gray-700 font-medium">{callData.from_number}</p>
          <p className="text-sm text-gray-500 mt-2">Ringing... {formatDuration(ringingDuration)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleReject}
            disabled={responding}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            <PhoneOff className="w-5 h-5" />
            Reject
          </button>
          
          <button
            onClick={handleAnswer}
            disabled={responding}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            <Phone className="w-5 h-5" />
            Answer
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Click "Answer" to accept the call with WebRTC. Microphone access required.
        </p>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
