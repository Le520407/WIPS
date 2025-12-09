import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { useWhatsAppWebRTC } from '../hooks/useWhatsAppWebRTC';

interface WhatsAppCallInterfaceProps {
  callId: string;
  callerNumber: string;
  remoteSdp?: string; // SDP offer from WhatsApp webhook
  onCallEnd: () => void;
}

export const WhatsAppCallInterface = ({ callId, callerNumber, remoteSdp, onCallEnd }: WhatsAppCallInterfaceProps) => {
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const {
    acceptCall,
    endCall,
    toggleMute,
    isConnecting,
    isConnected,
    isMuted,
    error,
    remoteStream,
  } = useWhatsAppWebRTC({
    callId,
    onConnected: () => {
      console.log('✅ Call connected');
      setStatus('connected');
    },
    onDisconnected: () => {
      console.log('📞 Call disconnected');
      onCallEnd();
    },
    onError: (err) => {
      console.error('❌ Call error:', err);
      setStatus('error');
    },
  });

  // Auto-accept call on mount (only once)
  useEffect(() => {
    let mounted = true;
    
    const doAccept = async () => {
      if (mounted) {
        await acceptCall(remoteSdp);
      }
    };
    
    doAccept();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update call duration
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Play remote audio
  useEffect(() => {
    if (remoteStream) {
      console.log('🔊 Setting up remote audio stream:', remoteStream.id);
      console.log('🔊 Remote audio tracks:', remoteStream.getAudioTracks());
      
      const audio = document.getElementById('remote-audio') as HTMLAudioElement;
      if (audio) {
        audio.srcObject = remoteStream;
        audio.volume = 1.0;
        audio.muted = false;
        
        // Try to play
        audio.play()
          .then(() => {
            console.log('✅ Remote audio playing');
          })
          .catch(err => {
            console.error('❌ Failed to play audio:', err);
            // Try again with user interaction
            setTimeout(() => {
              audio.play().catch(e => console.error('❌ Retry failed:', e));
            }, 1000);
          });
      } else {
        console.error('❌ Audio element not found');
      }
      
      // Debug: Store in window for console access
      (window as any).remoteStream = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    await endCall();
    onCallEnd();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 w-96 shadow-2xl">
        {/* Status */}
        <div className="text-center mb-8">
          {status === 'connecting' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-lg font-medium">Connecting...</p>
              <p className="text-gray-400 text-sm mt-2">Setting up WebRTC connection</p>
            </div>
          )}

          {status === 'connected' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Volume2 className="w-10 h-10 text-white animate-pulse" />
              </div>
              <p className="text-white text-xl font-bold">{callerNumber}</p>
              <p className="text-green-400 text-lg mt-2">{formatDuration(callDuration)}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <PhoneOff className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-lg font-medium">Connection Failed</p>
              <p className="text-red-400 text-sm mt-2">{error || 'Unknown error'}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6 mb-6">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            disabled={!isConnected}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all transform hover:scale-110"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-4 text-xs">
          <div className={`flex items-center gap-1 ${isConnecting ? 'text-yellow-400' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>Connecting</span>
          </div>
          <div className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-500'}`} />
            <span>Connected</span>
          </div>
          <div className={`flex items-center gap-1 ${isMuted ? 'text-red-400' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-400' : 'bg-gray-500'}`} />
            <span>Muted</span>
          </div>
        </div>

        {/* Hidden audio element for remote stream */}
        <audio id="remote-audio" autoPlay playsInline />

        {/* Debug info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400 font-mono">
            <div>Call ID: {callId.substring(0, 20)}...</div>
            <div>Status: {status}</div>
            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
            <div>Muted: {isMuted ? 'Yes' : 'No'}</div>
            {error && <div className="text-red-400">Error: {error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
