import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSignaling } from '../hooks/useSignaling';
import { useAuth } from '../contexts/AuthContext';

interface WebRTCCallProps {
  targetUserId?: string;
  targetUserName?: string;
  incomingCall?: {
    from: string;
    fromName?: string;
    signal: any;
  };
  onCallEnd?: () => void;
}

type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended';

export const WebRTCCall: React.FC<WebRTCCallProps> = ({
  targetUserId,
  targetUserName,
  incomingCall,
  onCallEnd,
}) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebRTC hook
  const {
    localStream,
    remoteStream,
    peer,
    connectionState,
    isMuted,
    isVideoEnabled,
    createPeer,
    signalPeer,
    toggleMute,
    toggleVideo,
    destroyPeer,
  } = useWebRTC({
    audio: true,
    video: false,
    onStream: (stream) => {
      console.log('🎥 Remote stream received');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    },
    onError: (err) => {
      console.error('❌ WebRTC error:', err);
      setError(err.message);
      setCallState('ended');
    },
    onConnectionStateChange: (state) => {
      console.log('🔄 Connection state changed:', state);
      if (state === 'connected') {
        setCallState('connected');
        startCallTimer();
      } else if (state === 'failed' || state === 'closed') {
        setCallState('ended');
        stopCallTimer();
      }
    },
  });

  // Signaling hook
  const {
    isConnected: isSignalingConnected,
    callUser,
    answerCall,
    rejectCall,
    endCall,
    sendIceCandidate,
  } = useSignaling({
    userId: user?.id || '',
    userName: user?.email,
    onCallAccepted: (data) => {
      console.log('✅ Call accepted, signaling peer');
      setCallState('connecting');
      signalPeer(data.signal);
    },
    onCallRejected: () => {
      console.log('❌ Call rejected');
      setError('Call was rejected');
      setCallState('ended');
      handleEndCall();
    },
    onCallEnded: () => {
      console.log('🔚 Call ended by remote user');
      setCallState('ended');
      handleEndCall();
    },
    onIceCandidate: (data) => {
      console.log('🧊 Received ICE candidate');
      if (peer) {
        peer.signal(data.candidate);
      }
    },
  });

  // Start call timer
  const startCallTimer = () => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);
  };

  // Stop call timer
  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartTimeRef.current = null;
  };

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize call (outgoing)
  useEffect(() => {
    if (targetUserId && callState === 'idle' && isSignalingConnected) {
      initiateCall();
    }
  }, [targetUserId, isSignalingConnected]);

  // Handle incoming call
  useEffect(() => {
    if (incomingCall && callState === 'idle') {
      setCallState('ringing');
    }
  }, [incomingCall]);

  // Attach local stream to video element
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Initiate outgoing call
  const initiateCall = async () => {
    if (!targetUserId) return;

    try {
      setCallState('calling');
      console.log('📞 Initiating call to:', targetUserId);

      // Create peer as initiator
      const newPeer = await createPeer(true);

      // Listen for signal to send to remote peer
      newPeer.on('signal', (signal) => {
        console.log('📡 Sending call signal');
        callUser(targetUserId, signal);
      });

      // Send ICE candidates
      newPeer.on('icecandidate', (candidate) => {
        if (candidate) {
          sendIceCandidate(targetUserId, candidate);
        }
      });
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      setError('Failed to start call');
      setCallState('ended');
    }
  };

  // Answer incoming call
  const handleAnswerCall = async () => {
    if (!incomingCall) return;

    try {
      setCallState('connecting');
      console.log('✅ Answering call from:', incomingCall.from);

      // Create peer as non-initiator
      const newPeer = await createPeer(false);

      // Signal the incoming offer
      signalPeer(incomingCall.signal);

      // Listen for answer signal to send back
      newPeer.on('signal', (signal) => {
        console.log('📡 Sending answer signal');
        answerCall(incomingCall.from, signal);
      });

      // Send ICE candidates
      newPeer.on('icecandidate', (candidate) => {
        if (candidate) {
          sendIceCandidate(incomingCall.from, candidate);
        }
      });
    } catch (error) {
      console.error('❌ Failed to answer call:', error);
      setError('Failed to answer call');
      setCallState('ended');
    }
  };

  // Reject incoming call
  const handleRejectCall = () => {
    if (!incomingCall) return;

    console.log('❌ Rejecting call from:', incomingCall.from);
    rejectCall(incomingCall.from);
    setCallState('ended');
    onCallEnd?.();
  };

  // End call
  const handleEndCall = () => {
    console.log('🔚 Ending call');
    
    const remoteUserId = targetUserId || incomingCall?.from;
    if (remoteUserId) {
      endCall(remoteUserId);
    }

    destroyPeer();
    stopCallTimer();
    setCallState('ended');
    onCallEnd?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleEndCall();
    };
  }, []);

  // Render different states
  if (callState === 'ended') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
          {error && (
            <p className="text-red-600 mb-4">{error}</p>
          )}
          {callDuration > 0 && (
            <p className="text-gray-600 mb-4">
              Duration: {formatDuration(callDuration)}
            </p>
          )}
          <button
            onClick={onCallEnd}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (callState === 'ringing' && incomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Incoming Call</h2>
            <p className="text-gray-600">{incomingCall.fromName || incomingCall.from}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRejectCall}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
            <button
              onClick={handleAnswerCall}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Answer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call UI
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {targetUserName || incomingCall?.fromName || 'Unknown'}
            </h2>
            <p className="text-sm text-gray-400">
              {callState === 'calling' && 'Calling...'}
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'connected' && formatDuration(callDuration)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              connectionState === 'connected' ? 'bg-green-500' :
              connectionState === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-sm">{connectionState}</span>
          </div>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative bg-black">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* No video placeholder */}
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-lg">{callState === 'calling' ? 'Calling...' : 'Connecting...'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
            title="End call"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          {/* Video toggle button (if video enabled) */}
          {isVideoEnabled && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isVideoEnabled ? 'Disable video' : 'Enable video'}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
